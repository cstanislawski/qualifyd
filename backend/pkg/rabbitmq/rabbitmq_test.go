package rabbitmq

import (
	"testing"

	"github.com/cstanislawski/qualifyd/pkg/config"
)

func TestBuildConnectionString(t *testing.T) {
	cfg := &config.RabbitMQConfig{
		Host:     "localhost",
		Port:     5672,
		User:     "testuser",
		Password: "testpass",
		VHost:    "test",
	}

	rmq := New(cfg)
	expected := "amqp://testuser:testpass@localhost:5672/test"
	actual := rmq.buildConnectionString()

	if actual != expected {
		t.Errorf("Expected connection string: %s, got: %s", expected, actual)
	}
}

func TestBuildConnectionStringDefaultVHost(t *testing.T) {
	cfg := &config.RabbitMQConfig{
		Host:     "localhost",
		Port:     5672,
		User:     "guest",
		Password: "guest",
		VHost:    "/",
	}

	rmq := New(cfg)
	expected := "amqp://guest:guest@localhost:5672/"
	actual := rmq.buildConnectionString()

	if actual != expected {
		t.Errorf("Expected connection string: %s, got: %s", expected, actual)
	}
}

// Note: Integration tests that require a real RabbitMQ connection should be in a separate file
// with a _integration_test.go suffix and use a tag to conditionally run them.
