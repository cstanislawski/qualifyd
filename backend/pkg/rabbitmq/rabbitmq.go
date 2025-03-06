package rabbitmq

import (
	"context"
	"errors"
	"fmt"
	"sync"
	"time"

	"github.com/cstanislawski/qualifyd/pkg/config"
	"github.com/cstanislawski/qualifyd/pkg/logger"
	amqp "github.com/rabbitmq/amqp091-go"
)

const (
	// Default reconnect delay in seconds
	defaultReconnectDelay = 5 * time.Second
	// Maximum reconnect delay in seconds
	maxReconnectDelay = 60 * time.Second
	// Reconnect multiplier for exponential backoff
	reconnectMultiplier = 2
	// Default publish timeout
	defaultPublishTimeout = 5 * time.Second
	// Default consumer prefetch count
	defaultPrefetchCount = 10
)

// Common errors
var (
	ErrNotConnected      = errors.New("not connected to RabbitMQ")
	ErrAlreadyConnected  = errors.New("already connected to RabbitMQ")
	ErrShutdownInProcess = errors.New("shutdown in process")
	ErrChannelClosed     = errors.New("channel closed")
)

// RabbitMQ represents a RabbitMQ connection
type RabbitMQ struct {
	config         *config.RabbitMQConfig
	conn           *amqp.Connection
	connNotify     chan *amqp.Error
	channels       []*Channel
	channelsMu     sync.RWMutex
	isReconnecting bool
	mu             sync.RWMutex
	shutdown       bool
	reconnectDelay time.Duration
}

// Channel represents a RabbitMQ channel
type Channel struct {
	ch             *amqp.Channel
	prefetchCount  int
	notifyClose    chan *amqp.Error
	notifyCancel   chan string
	notifyReturn   chan amqp.Return
	notifyConfirm  chan amqp.Confirmation
	name           string
	rmq            *RabbitMQ
	publishTimeout time.Duration
	mu             sync.Mutex
}

// Publisher struct for publishing messages
type Publisher struct {
	channel        *Channel
	exchange       string
	routingKey     string
	mandatory      bool
	immediate      bool
	publishTimeout time.Duration
}

// Consumer struct for consuming messages
type Consumer struct {
	channel      *Channel
	queue        string
	consumerTag  string
	autoAck      bool
	exclusive    bool
	noLocal      bool
	noWait       bool
	msgChannel   <-chan amqp.Delivery
	stopConsume  chan struct{}
	qos          int
	isConsuming  bool
	mu           sync.Mutex
	handleFunc   func(delivery amqp.Delivery) error
	stopHandling chan struct{}
}

// New creates a new RabbitMQ instance
func New(cfg *config.RabbitMQConfig) *RabbitMQ {
	return &RabbitMQ{
		config:         cfg,
		channels:       make([]*Channel, 0),
		reconnectDelay: defaultReconnectDelay,
	}
}

// Connect establishes a connection to RabbitMQ
func (r *RabbitMQ) Connect() error {
	r.mu.Lock()
	defer r.mu.Unlock()

	if r.shutdown {
		return ErrShutdownInProcess
	}

	if r.conn != nil {
		return ErrAlreadyConnected
	}

	conn, err := amqp.Dial(r.buildConnectionString())
	if err != nil {
		return fmt.Errorf("failed to connect to RabbitMQ: %w", err)
	}

	r.conn = conn
	r.connNotify = make(chan *amqp.Error)
	r.conn.NotifyClose(r.connNotify)

	logger.Info("Connected to RabbitMQ", map[string]interface{}{
		"host": r.config.Host,
		"port": r.config.Port,
		"user": r.config.User,
	})

	// Start the reconnection monitor
	go r.monitorConnection()

	return nil
}

// NewChannel creates a new channel
func (r *RabbitMQ) NewChannel(name string) (*Channel, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	if r.conn == nil {
		return nil, ErrNotConnected
	}

	ch, err := r.conn.Channel()
	if err != nil {
		return nil, fmt.Errorf("failed to create channel: %w", err)
	}

	channel := &Channel{
		ch:             ch,
		notifyClose:    make(chan *amqp.Error),
		notifyCancel:   make(chan string),
		notifyReturn:   make(chan amqp.Return),
		notifyConfirm:  make(chan amqp.Confirmation),
		name:           name,
		rmq:            r,
		prefetchCount:  defaultPrefetchCount,
		publishTimeout: defaultPublishTimeout,
	}

	// Set up channel notifications
	ch.NotifyClose(channel.notifyClose)
	ch.NotifyCancel(channel.notifyCancel)
	ch.NotifyReturn(channel.notifyReturn)
	ch.NotifyPublish(channel.notifyConfirm)

	// Set up channel prefetch (QoS)
	if err := ch.Qos(channel.prefetchCount, 0, false); err != nil {
		ch.Close()
		return nil, fmt.Errorf("failed to set channel QoS: %w", err)
	}

	// Enable publish confirmations
	if err := ch.Confirm(false); err != nil {
		ch.Close()
		return nil, fmt.Errorf("failed to put channel in confirm mode: %w", err)
	}

	// Add channel to the list of channels
	r.channelsMu.Lock()
	r.channels = append(r.channels, channel)
	r.channelsMu.Unlock()

	// Monitor channel for closure
	go r.monitorChannel(channel)

	return channel, nil
}

// Close closes the RabbitMQ connection
func (r *RabbitMQ) Close() error {
	r.mu.Lock()
	defer r.mu.Unlock()

	r.shutdown = true

	if r.conn != nil {
		// Close all channels
		r.channelsMu.Lock()
		for _, channel := range r.channels {
			channel.mu.Lock()
			if channel.ch != nil {
				_ = channel.ch.Close()
			}
			channel.mu.Unlock()
		}
		r.channels = nil
		r.channelsMu.Unlock()

		// Close the connection
		err := r.conn.Close()
		r.conn = nil
		return err
	}

	return nil
}

// DeclareExchange declares an exchange
func (c *Channel) DeclareExchange(name, kind string, durable, autoDelete, internal, noWait bool, args amqp.Table) error {
	c.mu.Lock()
	defer c.mu.Unlock()

	if c.ch == nil {
		return ErrChannelClosed
	}

	return c.ch.ExchangeDeclare(
		name,       // name
		kind,       // type
		durable,    // durable
		autoDelete, // auto-delete
		internal,   // internal
		noWait,     // no-wait
		args,       // arguments
	)
}

// DeclareQueue declares a queue
func (c *Channel) DeclareQueue(name string, durable, autoDelete, exclusive, noWait bool, args amqp.Table) (amqp.Queue, error) {
	c.mu.Lock()
	defer c.mu.Unlock()

	if c.ch == nil {
		return amqp.Queue{}, ErrChannelClosed
	}

	return c.ch.QueueDeclare(
		name,       // name
		durable,    // durable
		autoDelete, // auto-delete
		exclusive,  // exclusive
		noWait,     // no-wait
		args,       // arguments
	)
}

// BindQueue binds a queue to an exchange
func (c *Channel) BindQueue(name, key, exchange string, noWait bool, args amqp.Table) error {
	c.mu.Lock()
	defer c.mu.Unlock()

	if c.ch == nil {
		return ErrChannelClosed
	}

	return c.ch.QueueBind(
		name,     // queue name
		key,      // routing key
		exchange, // exchange
		noWait,   // no-wait
		args,     // arguments
	)
}

// NewPublisher creates a new Publisher
func (c *Channel) NewPublisher(exchange, routingKey string) *Publisher {
	return &Publisher{
		channel:        c,
		exchange:       exchange,
		routingKey:     routingKey,
		publishTimeout: c.publishTimeout,
	}
}

// Publish publishes a message
func (p *Publisher) Publish(ctx context.Context, body []byte, contentType string, headers amqp.Table) error {
	p.channel.mu.Lock()
	defer p.channel.mu.Unlock()

	if p.channel.ch == nil {
		return ErrChannelClosed
	}

	msg := amqp.Publishing{
		ContentType:  contentType,
		Body:         body,
		DeliveryMode: amqp.Persistent,
		Timestamp:    time.Now(),
		Headers:      headers,
	}

	// Use context with timeout for publish
	ctx, cancel := context.WithTimeout(ctx, p.publishTimeout)
	defer cancel()

	err := p.channel.ch.PublishWithContext(
		ctx,
		p.exchange,   // exchange
		p.routingKey, // routing key
		p.mandatory,  // mandatory
		p.immediate,  // immediate
		msg,
	)
	if err != nil {
		return fmt.Errorf("failed to publish message: %w", err)
	}

	// Wait for confirmation
	select {
	case confirm := <-p.channel.notifyConfirm:
		if !confirm.Ack {
			return fmt.Errorf("failed to receive acknowledgment for message")
		}
		return nil
	case <-ctx.Done():
		return fmt.Errorf("publish confirmation timed out: %w", ctx.Err())
	}
}

// NewConsumer creates a new Consumer
func (c *Channel) NewConsumer(queue, consumerTag string, autoAck bool) (*Consumer, error) {
	c.mu.Lock()
	defer c.mu.Unlock()

	if c.ch == nil {
		return nil, ErrChannelClosed
	}

	consumer := &Consumer{
		channel:     c,
		queue:       queue,
		consumerTag: consumerTag,
		autoAck:     autoAck,
		qos:         c.prefetchCount,
		stopConsume: make(chan struct{}),
	}

	return consumer, nil
}

// Consume starts consuming messages
func (c *Consumer) Consume() error {
	c.mu.Lock()
	defer c.mu.Unlock()

	if c.isConsuming {
		return errors.New("already consuming")
	}

	c.channel.mu.Lock()
	msgChan, err := c.channel.ch.Consume(
		c.queue,       // queue
		c.consumerTag, // consumer tag
		c.autoAck,     // auto-ack
		c.exclusive,   // exclusive
		c.noLocal,     // no-local
		c.noWait,      // no-wait
		nil,           // arguments
	)
	c.channel.mu.Unlock()

	if err != nil {
		return fmt.Errorf("failed to start consuming: %w", err)
	}

	c.msgChannel = msgChan
	c.isConsuming = true

	return nil
}

// Handle starts handling messages with the provided function
func (c *Consumer) Handle(handleFunc func(delivery amqp.Delivery) error) {
	c.mu.Lock()
	if !c.isConsuming {
		c.mu.Unlock()
		logger.Error("Cannot start handling messages: not consuming", nil, nil)
		return
	}

	if c.stopHandling != nil {
		close(c.stopHandling)
	}
	c.stopHandling = make(chan struct{})
	c.handleFunc = handleFunc
	stopChan := c.stopHandling
	c.mu.Unlock()

	go func() {
		for {
			select {
			case <-stopChan:
				return
			case delivery, ok := <-c.msgChannel:
				if !ok {
					logger.Error("Message channel closed", nil, nil)
					return
				}

				err := handleFunc(delivery)
				if err != nil {
					logger.Error("Error handling message", err, map[string]interface{}{
						"queue":         c.queue,
						"consumerTag":   c.consumerTag,
						"deliveryTag":   delivery.DeliveryTag,
						"messageId":     delivery.MessageId,
						"correlationId": delivery.CorrelationId,
					})

					// If auto-ack is false, we need to nack the message
					if !c.autoAck {
						// Nack the message and requeue it
						if err := delivery.Nack(false, true); err != nil {
							logger.Error("Failed to nack message", err, nil)
						}
					}
				} else if !c.autoAck {
					// If auto-ack is false and the message was handled successfully, we need to ack it
					if err := delivery.Ack(false); err != nil {
						logger.Error("Failed to ack message", err, nil)
					}
				}
			}
		}
	}()
}

// StopConsuming stops consuming messages
func (c *Consumer) StopConsuming() error {
	c.mu.Lock()
	defer c.mu.Unlock()

	if !c.isConsuming {
		return nil
	}

	c.channel.mu.Lock()
	err := c.channel.ch.Cancel(c.consumerTag, false)
	c.channel.mu.Unlock()

	if err != nil {
		return fmt.Errorf("failed to cancel consumer: %w", err)
	}

	// Close the stop channel to signal the message handler to stop
	if c.stopHandling != nil {
		close(c.stopHandling)
		c.stopHandling = nil
	}

	c.isConsuming = false
	return nil
}

// Private helper methods

// buildConnectionString builds a RabbitMQ connection string
func (r *RabbitMQ) buildConnectionString() string {
	return fmt.Sprintf("amqp://%s:%s@%s:%d/%s",
		r.config.User, r.config.Password, r.config.Host, r.config.Port, r.config.VHost)
}

// monitorConnection monitors the connection and reconnects if needed
func (r *RabbitMQ) monitorConnection() {
	for {
		// Wait for a close event
		err, ok := <-r.connNotify
		if !ok || r.shutdown {
			// Channel was closed cleanly
			return
		}

		logger.Error("RabbitMQ connection closed", errors.New(err.Error()), map[string]interface{}{
			"code":    err.Code,
			"reason":  err.Reason,
			"server":  err.Server,
			"recover": err.Recover,
		})

		// Mark that we're reconnecting
		r.mu.Lock()
		r.isReconnecting = true
		r.mu.Unlock()

		// Exponential backoff for reconnection
		delay := r.reconnectDelay
		for {
			logger.Info("Attempting to reconnect to RabbitMQ", map[string]interface{}{
				"delay": delay.String(),
			})

			time.Sleep(delay)

			// Check if we're shutting down
			r.mu.RLock()
			if r.shutdown {
				r.mu.RUnlock()
				return
			}
			r.mu.RUnlock()

			// Try to reconnect
			conn, err := amqp.Dial(r.buildConnectionString())
			if err == nil {
				// Successfully reconnected
				r.mu.Lock()
				r.conn = conn
				r.connNotify = make(chan *amqp.Error)
				r.conn.NotifyClose(r.connNotify)
				r.isReconnecting = false
				r.mu.Unlock()

				logger.Info("Successfully reconnected to RabbitMQ", nil)

				// Recreate all channels
				r.recreateChannels()
				break
			}

			logger.Error("Failed to reconnect to RabbitMQ", err, nil)

			// Increase the delay for the next attempt
			delay *= reconnectMultiplier
			if delay > maxReconnectDelay {
				delay = maxReconnectDelay
			}
		}
	}
}

// recreateChannels recreates all channels after a reconnection
func (r *RabbitMQ) recreateChannels() {
	r.channelsMu.Lock()
	defer r.channelsMu.Unlock()

	for _, channel := range r.channels {
		// Skip if the channel is already closed
		if channel.ch == nil {
			continue
		}

		// Get the channel name
		name := channel.name

		// Create a new channel
		ch, err := r.conn.Channel()
		if err != nil {
			logger.Error("Failed to recreate channel", err, map[string]interface{}{
				"name": name,
			})
			continue
		}

		// Set up the channel
		channel.mu.Lock()
		channel.ch = ch
		channel.notifyClose = make(chan *amqp.Error)
		channel.notifyCancel = make(chan string)
		channel.notifyReturn = make(chan amqp.Return)
		channel.notifyConfirm = make(chan amqp.Confirmation)

		// Set up channel notifications
		ch.NotifyClose(channel.notifyClose)
		ch.NotifyCancel(channel.notifyCancel)
		ch.NotifyReturn(channel.notifyReturn)
		ch.NotifyPublish(channel.notifyConfirm)

		// Set up channel prefetch (QoS)
		if err := ch.Qos(channel.prefetchCount, 0, false); err != nil {
			logger.Error("Failed to set channel QoS", err, map[string]interface{}{
				"name": name,
			})
		}

		// Enable publish confirmations
		if err := ch.Confirm(false); err != nil {
			logger.Error("Failed to put channel in confirm mode", err, map[string]interface{}{
				"name": name,
			})
		}

		channel.mu.Unlock()

		// Monitor channel for closure
		go r.monitorChannel(channel)

		logger.Info("Successfully recreated channel", map[string]interface{}{
			"name": name,
		})
	}
}

// monitorChannel monitors a channel and handles closures
func (r *RabbitMQ) monitorChannel(channel *Channel) {
	select {
	case err, ok := <-channel.notifyClose:
		if !ok {
			// Channel was closed cleanly
			return
		}

		logger.Error("Channel closed", errors.New(err.Error()), map[string]interface{}{
			"name":    channel.name,
			"code":    err.Code,
			"reason":  err.Reason,
			"server":  err.Server,
			"recover": err.Recover,
		})

		// Remove the channel from our list
		r.channelsMu.Lock()
		for i, ch := range r.channels {
			if ch == channel {
				r.channels = append(r.channels[:i], r.channels[i+1:]...)
				break
			}
		}
		r.channelsMu.Unlock()

	case cancelReason := <-channel.notifyCancel:
		logger.Info("Consumer cancelled", map[string]interface{}{
			"name":   channel.name,
			"reason": cancelReason,
		})
	}
}
