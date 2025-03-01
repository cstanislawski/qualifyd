/**
 * Qualifyd - Main JavaScript
 *
 * Common functionality for the Qualifyd application.
 */

document.addEventListener('DOMContentLoaded', function() {
  // Mobile menu toggle
  setupMobileMenu();

  // Notification dismissal
  setupNotificationDismissal();

  // Form validation
  setupFormValidation();

  // Tooltips
  setupTooltips();

  // Modals
  setupModals();
});

/**
 * Set up mobile menu toggle functionality
 */
function setupMobileMenu() {
  const mobileMenuButton = document.getElementById('mobile-menu-button');
  const mobileMenu = document.getElementById('mobile-menu');

  if (mobileMenuButton && mobileMenu) {
    mobileMenuButton.addEventListener('click', function() {
      const expanded = mobileMenuButton.getAttribute('aria-expanded') === 'true';
      mobileMenuButton.setAttribute('aria-expanded', !expanded);
      mobileMenu.classList.toggle('hidden');
    });
  }
}

/**
 * Set up notification dismissal functionality
 */
function setupNotificationDismissal() {
  const dismissButtons = document.querySelectorAll('[data-dismiss="notification"]');

  dismissButtons.forEach(button => {
    button.addEventListener('click', function() {
      const notification = this.closest('.notification');
      if (notification) {
        notification.classList.add('opacity-0');
        setTimeout(() => {
          notification.remove();
        }, 300);
      }
    });
  });
}

/**
 * Set up form validation
 */
function setupFormValidation() {
  const forms = document.querySelectorAll('form[data-validate="true"]');

  forms.forEach(form => {
    form.addEventListener('submit', function(event) {
      const requiredFields = form.querySelectorAll('[required]');
      let isValid = true;

      requiredFields.forEach(field => {
        if (!field.value.trim()) {
          isValid = false;
          field.classList.add('border-red-500');

          // Add or update error message
          let errorMessage = field.nextElementSibling;
          if (!errorMessage || !errorMessage.classList.contains('error-message')) {
            errorMessage = document.createElement('p');
            errorMessage.className = 'mt-1 text-sm text-red-600 error-message';
            field.parentNode.insertBefore(errorMessage, field.nextSibling);
          }
          errorMessage.textContent = 'This field is required';
        } else {
          field.classList.remove('border-red-500');

          // Remove error message if it exists
          const errorMessage = field.nextElementSibling;
          if (errorMessage && errorMessage.classList.contains('error-message')) {
            errorMessage.remove();
          }
        }
      });

      if (!isValid) {
        event.preventDefault();
      }
    });

    // Clear validation styling on input
    const inputs = form.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
      input.addEventListener('input', function() {
        if (this.value.trim()) {
          this.classList.remove('border-red-500');

          // Remove error message if it exists
          const errorMessage = this.nextElementSibling;
          if (errorMessage && errorMessage.classList.contains('error-message')) {
            errorMessage.remove();
          }
        }
      });
    });
  });
}

/**
 * Set up tooltips
 */
function setupTooltips() {
  const tooltipTriggers = document.querySelectorAll('[data-tooltip]');

  tooltipTriggers.forEach(trigger => {
    const tooltipText = trigger.getAttribute('data-tooltip');

    // Create tooltip element
    const tooltip = document.createElement('div');
    tooltip.className = 'absolute z-10 px-2 py-1 text-xs text-white bg-gray-900 rounded opacity-0 invisible transition-opacity duration-200 transform -translate-x-1/2 -translate-y-full';
    tooltip.textContent = tooltipText;
    tooltip.style.bottom = 'calc(100% + 5px)';
    tooltip.style.left = '50%';

    // Add tooltip to the DOM
    trigger.style.position = 'relative';
    trigger.appendChild(tooltip);

    // Show tooltip on hover/focus
    trigger.addEventListener('mouseenter', () => {
      tooltip.classList.remove('opacity-0', 'invisible');
      tooltip.classList.add('opacity-100');
    });

    trigger.addEventListener('focus', () => {
      tooltip.classList.remove('opacity-0', 'invisible');
      tooltip.classList.add('opacity-100');
    });

    // Hide tooltip on mouse leave/blur
    trigger.addEventListener('mouseleave', () => {
      tooltip.classList.remove('opacity-100');
      tooltip.classList.add('opacity-0', 'invisible');
    });

    trigger.addEventListener('blur', () => {
      tooltip.classList.remove('opacity-100');
      tooltip.classList.add('opacity-0', 'invisible');
    });
  });
}

/**
 * Set up modal functionality
 */
function setupModals() {
  const modalTriggers = document.querySelectorAll('[data-modal-target]');
  const modalCloseButtons = document.querySelectorAll('[data-modal-close]');

  // Open modal when trigger is clicked
  modalTriggers.forEach(trigger => {
    trigger.addEventListener('click', function() {
      const modalId = this.getAttribute('data-modal-target');
      const modal = document.getElementById(modalId);

      if (modal) {
        // Show modal
        modal.classList.remove('hidden');
        setTimeout(() => {
          modal.classList.add('opacity-100');
          modal.querySelector('.modal-content').classList.add('translate-y-0');
          modal.querySelector('.modal-content').classList.remove('translate-y-4');
        }, 10);

        // Prevent body scrolling
        document.body.classList.add('overflow-hidden');
      }
    });
  });

  // Close modal when close button is clicked
  modalCloseButtons.forEach(button => {
    button.addEventListener('click', function() {
      const modal = this.closest('.modal');
      closeModal(modal);
    });
  });

  // Close modal when clicking outside content
  document.addEventListener('click', function(event) {
    if (event.target.classList.contains('modal')) {
      closeModal(event.target);
    }
  });

  // Close modal when ESC key is pressed
  document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
      const openModal = document.querySelector('.modal:not(.hidden)');
      if (openModal) {
        closeModal(openModal);
      }
    }
  });
}

/**
 * Close a modal with animation
 */
function closeModal(modal) {
  if (modal) {
    modal.classList.remove('opacity-100');
    modal.querySelector('.modal-content').classList.remove('translate-y-0');
    modal.querySelector('.modal-content').classList.add('translate-y-4');

    setTimeout(() => {
      modal.classList.add('hidden');
      document.body.classList.remove('overflow-hidden');
    }, 300);
  }
}

/**
 * Format a date string
 */
function formatDate(dateString, format = 'long') {
  const date = new Date(dateString);

  if (isNaN(date)) {
    return dateString;
  }

  if (format === 'long') {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } else if (format === 'short') {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } else if (format === 'relative') {
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 60) {
      return 'just now';
    } else if (diffMin < 60) {
      return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
    } else if (diffHour < 24) {
      return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`;
    } else if (diffDay < 7) {
      return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    }
  }

  return dateString;
}

/**
 * Format a duration in minutes to a human-readable string
 */
function formatDuration(minutes) {
  if (minutes < 60) {
    return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
  } else {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (remainingMinutes === 0) {
      return `${hours} hour${hours !== 1 ? 's' : ''}`;
    } else {
      return `${hours} hour${hours !== 1 ? 's' : ''} ${remainingMinutes} minute${remainingMinutes !== 1 ? 's' : ''}`;
    }
  }
}

/**
 * Copy text to clipboard
 */
function copyToClipboard(text) {
  if (navigator.clipboard) {
    return navigator.clipboard.writeText(text);
  } else {
    // Fallback for older browsers
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();

    try {
      document.execCommand('copy');
      document.body.removeChild(textarea);
      return Promise.resolve();
    } catch (err) {
      document.body.removeChild(textarea);
      return Promise.reject(err);
    }
  }
}

/**
 * Show a toast notification
 */
function showToast(message, type = 'info', duration = 3000) {
  // Create toast container if it doesn't exist
  let toastContainer = document.getElementById('toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    toastContainer.className = 'fixed bottom-4 right-4 z-50 flex flex-col space-y-2';
    document.body.appendChild(toastContainer);
  }

  // Create toast element
  const toast = document.createElement('div');
  toast.className = 'px-4 py-3 rounded shadow-lg transform transition-all duration-300 translate-y-2 opacity-0';

  // Set background color based on type
  if (type === 'success') {
    toast.classList.add('bg-green-500', 'text-white');
  } else if (type === 'error') {
    toast.classList.add('bg-red-500', 'text-white');
  } else if (type === 'warning') {
    toast.classList.add('bg-yellow-500', 'text-white');
  } else {
    toast.classList.add('bg-blue-500', 'text-white');
  }

  // Add message
  toast.textContent = message;

  // Add to container
  toastContainer.appendChild(toast);

  // Animate in
  setTimeout(() => {
    toast.classList.remove('translate-y-2', 'opacity-0');
    toast.classList.add('translate-y-0', 'opacity-100');
  }, 10);

  // Remove after duration
  setTimeout(() => {
    toast.classList.remove('translate-y-0', 'opacity-100');
    toast.classList.add('translate-y-2', 'opacity-0');

    setTimeout(() => {
      toast.remove();
    }, 300);
  }, duration);
}
