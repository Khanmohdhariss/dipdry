// Contact Form JavaScript
document.addEventListener('DOMContentLoaded', function() {
    initializeContactForm();
    initializeFAQ();
});

// Initialize contact form functionality
function initializeContactForm() {
    const form = document.getElementById('contactForm');
    if (!form) return;
    
    // Form validation and submission
    form.addEventListener('submit', handleContactFormSubmission);
    
    // Real-time validation
    setupRealTimeValidation();
    
    // Auto-save functionality
    setupContactAutoSave();
}

// Handle contact form submission
function handleContactFormSubmission(e) {
    e.preventDefault();
    
    const form = e.target;
    
    // Validate form
    if (!validateContactForm(form)) {
        return;
    }
    
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    
    // Show loading state
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Sending Message...';
    submitBtn.disabled = true;
    
    // Collect form data
    const formData = new FormData(form);
    const contactData = Object.fromEntries(formData);
    
    // Simulate API call
    setTimeout(() => {
        // Clear saved draft
        localStorage.removeItem('contactForm_draft');
        
        // Reset form
        form.reset();
        
        // Show success message
        showAlert('success', 'Thank you for your message! We will get back to you within 24 hours.');
        
        // Reset button
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        
        // Log contact data (in production, this would be sent to server)
        console.log('Contact form submitted:', contactData);
        
        // Optional: Send confirmation email (would be handled by backend)
        console.log('Confirmation email would be sent to:', contactData.email);
        
    }, 2000);
}

// Validate contact form
function validateContactForm(form) {
    let isValid = true;
    
    // Get form fields
    const name = form.querySelector('#name');
    const email = form.querySelector('#email');
    const phone = form.querySelector('#phone');
    const subject = form.querySelector('#subject');
    const message = form.querySelector('#message');
    
    // Clear previous validation states
    form.querySelectorAll('.is-invalid').forEach(field => {
        field.classList.remove('is-invalid');
    });
    
    // Validate name
    if (!name.value.trim()) {
        name.classList.add('is-invalid');
        showAlert('danger', 'Please enter your full name');
        isValid = false;
    } else if (name.value.trim().length < 2) {
        name.classList.add('is-invalid');
        showAlert('danger', 'Name must be at least 2 characters long');
        isValid = false;
    }
    
    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.value.trim()) {
        email.classList.add('is-invalid');
        showAlert('danger', 'Please enter your email address');
        isValid = false;
    } else if (!emailRegex.test(email.value)) {
        email.classList.add('is-invalid');
        showAlert('danger', 'Please enter a valid email address');
        isValid = false;
    }
    
    // Validate phone
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phone.value.trim()) {
        phone.classList.add('is-invalid');
        showAlert('danger', 'Please enter your phone number');
        isValid = false;
    } else if (!phoneRegex.test(phone.value.replace(/\D/g, ''))) {
        phone.classList.add('is-invalid');
        showAlert('danger', 'Please enter a valid 10-digit mobile number');
        isValid = false;
    }
    
    // Validate subject
    if (!subject.value) {
        subject.classList.add('is-invalid');
        showAlert('danger', 'Please select a subject');
        isValid = false;
    }
    
    // Validate message
    if (!message.value.trim()) {
        message.classList.add('is-invalid');
        showAlert('danger', 'Please enter your message');
        isValid = false;
    } else if (message.value.trim().length < 10) {
        message.classList.add('is-invalid');
        showAlert('danger', 'Message must be at least 10 characters long');
        isValid = false;
    }
    
    return isValid;
}

// Real-time validation
function setupRealTimeValidation() {
    const form = document.getElementById('contactForm');
    if (!form) return;
    
    const fields = {
        name: { 
            regex: /^.{2,}$/,
            message: 'Name must be at least 2 characters long'
        },
        email: {
            regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            message: 'Please enter a valid email address'
        },
        phone: {
            regex: /^[6-9]\d{9}$/,
            message: 'Please enter a valid 10-digit mobile number'
        }
    };
    
    Object.keys(fields).forEach(fieldName => {
        const field = form.querySelector(`#${fieldName}`);
        if (field) {
            field.addEventListener('blur', function() {
                validateField(field, fields[fieldName]);
            });
            
            field.addEventListener('input', function() {
                if (field.classList.contains('is-invalid')) {
                    validateField(field, fields[fieldName]);
                }
            });
        }
    });
}

function validateField(field, validation) {
    const value = field.value.trim();
    
    if (field.id === 'phone') {
        // Remove non-digits for phone validation
        const phoneValue = value.replace(/\D/g, '');
        if (validation.regex.test(phoneValue)) {
            field.classList.remove('is-invalid');
            field.classList.add('is-valid');
        } else if (value.length > 0) {
            field.classList.remove('is-valid');
            field.classList.add('is-invalid');
        }
    } else {
        if (validation.regex.test(value)) {
            field.classList.remove('is-invalid');
            field.classList.add('is-valid');
        } else if (value.length > 0) {
            field.classList.remove('is-valid');
            field.classList.add('is-invalid');
        }
    }
}

// Auto-save functionality
function setupContactAutoSave() {
    const form = document.getElementById('contactForm');
    if (!form) return;
    
    const inputs = form.querySelectorAll('input, select, textarea');
    
    inputs.forEach(input => {
        input.addEventListener('input', debounce(() => {
            saveContactFormData();
        }, 1000));
    });
    
    // Load saved data on page load
    loadContactFormData();
}

function saveContactFormData() {
    const form = document.getElementById('contactForm');
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    
    localStorage.setItem('contactForm_draft', JSON.stringify(data));
}

function loadContactFormData() {
    const savedData = localStorage.getItem('contactForm_draft');
    if (!savedData) return;
    
    const data = JSON.parse(savedData);
    
    Object.keys(data).forEach(key => {
        const input = document.querySelector(`#${key}`);
        if (input && data[key]) {
            input.value = data[key];
        }
    });
}

// FAQ functionality
function initializeFAQ() {
    const faqQuestions = document.querySelectorAll('.faq-question');
    
    faqQuestions.forEach(question => {
        question.addEventListener('click', function() {
            toggleFAQ(this);
        });
    });
}

function toggleFAQ(questionElement) {
    const faqItem = questionElement.parentElement;
    const answer = faqItem.querySelector('.faq-answer');
    const icon = questionElement.querySelector('i');
    
    // Close all other FAQ items
    document.querySelectorAll('.faq-item').forEach(item => {
        if (item !== faqItem) {
            const otherAnswer = item.querySelector('.faq-answer');
            const otherIcon = item.querySelector('.faq-question i');
            otherAnswer.classList.remove('active');
            otherIcon.classList.remove('fa-minus');
            otherIcon.classList.add('fa-plus');
        }
    });
    
    // Toggle current FAQ item
    if (answer.classList.contains('active')) {
        answer.classList.remove('active');
        icon.classList.remove('fa-minus');
        icon.classList.add('fa-plus');
    } else {
        answer.classList.add('active');
        icon.classList.remove('fa-plus');
        icon.classList.add('fa-minus');
    }
}

// Phone number formatting
function formatPhoneNumber(input) {
    let value = input.value.replace(/\D/g, ''); // Remove non-digits
    
    if (value.length > 10) {
        value = value.substring(0, 10);
    }
    
    // Format as XXX-XXX-XXXX
    if (value.length >= 6) {
        value = value.substring(0, 3) + '-' + value.substring(3, 6) + '-' + value.substring(6);
    } else if (value.length >= 3) {
        value = value.substring(0, 3) + '-' + value.substring(3);
    }
    
    input.value = value;
}

// Add phone formatting to phone input
document.addEventListener('DOMContentLoaded', function() {
    const phoneInput = document.getElementById('phone');
    if (phoneInput) {
        phoneInput.addEventListener('input', function() {
            formatPhoneNumber(this);
        });
    }
});

// Utility functions
function showAlert(type, message) {
    // Remove existing alerts
    document.querySelectorAll('.alert.position-fixed').forEach(alert => {
        alert.remove();
    });
    
    // Create alert element
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
    alertDiv.style.cssText = 'top: 100px; right: 20px; z-index: 9999; min-width: 300px;';
    alertDiv.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'danger' ? 'exclamation-triangle' : 'info-circle'} me-2"></i>
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    // Add to body
    document.body.appendChild(alertDiv);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.parentNode.removeChild(alertDiv);
        }
    }, 5000);
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Map functionality (if Google Maps is integrated)
function initializeMap() {
    // This would initialize Google Maps
    // For demo purposes, we'll just show a placeholder
    console.log('Map would be initialized here with Google Maps API');
}

// Contact form analytics (for tracking form performance)
function trackFormInteraction(action, field = null) {
    // This would send analytics data to your tracking service
    console.log('Form interaction:', { action, field, timestamp: new Date() });
}

// Add interaction tracking
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('contactForm');
    if (form) {
        // Track form start
        form.addEventListener('focusin', function(e) {
            if (e.target.matches('input, select, textarea')) {
                trackFormInteraction('field_focus', e.target.id);
            }
        }, { once: true });
        
        // Track form completion
        form.addEventListener('submit', function() {
            trackFormInteraction('form_submit');
        });
    }
});

// Export functions for global use
window.toggleFAQ = toggleFAQ;
// logo ka liya
document.addEventListener('DOMContentLoaded', () => {
  const trigger = document.getElementById('brandTrigger');
  const overlay = document.getElementById('brandOverlay');

  function openOverlay(e){
    e.preventDefault();
    overlay.classList.add('open');
    overlay.setAttribute('aria-hidden','false');
  }
  function closeOverlay(){
    overlay.classList.remove('open');
    overlay.setAttribute('aria-hidden','true');
  }

  trigger?.addEventListener('click', openOverlay);
  overlay?.addEventListener('click', closeOverlay);
  document.addEventListener('keydown', (e) => {
    if(e.key === 'Escape' && overlay.classList.contains('open')) closeOverlay();
  });
});