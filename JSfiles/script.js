// Main JavaScript file for Fresh Clean Laundry Website

// DOM Content Loaded Event
document.addEventListener('DOMContentLoaded', function () {
    // Initialize all components
    initializeNavigation();
    initializeAnimations();
    initializeForms();
    setMinimumDates();
});

// Navigation Functions

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

function initializeNavigation() {
    // Mobile menu toggle
    const navbarToggler = document.querySelector('.navbar-toggler');
    const navbarCollapse = document.querySelector('.navbar-collapse');

    if (navbarToggler && navbarCollapse) {
        navbarToggler.addEventListener('click', function () {
            navbarCollapse.classList.toggle('show');
        });
    }

    // Close mobile menu when clicking on MAIN navigation links only (not dropdown items)
const mainNavLinks = document.querySelectorAll('.navbar-nav > .nav-item:not(.dropdown) > .nav-link');
mainNavLinks.forEach(link => {
    link.addEventListener('click', function () {
        const navbarCollapse = document.querySelector('.navbar-collapse.show');
        if (navbarCollapse) {
            navbarCollapse.classList.remove('show');
        }
    });
});

    // Navbar background on scroll
    window.addEventListener('scroll', function () {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
}

// Animation Functions
function initializeAnimations() {
    // Fade in animation for elements
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, observerOptions);

    // Observe elements with fade-in class
    document.querySelectorAll('.fade-in').forEach(el => {
        observer.observe(el);
    });

    // Service cards hover effect
    const serviceCards = document.querySelectorAll('.service-card');
    serviceCards.forEach(card => {
        card.addEventListener('mouseenter', function () {
            this.classList.add('scale-in', 'active');
        });

        card.addEventListener('mouseleave', function () {
            this.classList.remove('scale-in', 'active');
        });
    });
}

// Form Initialization
function initializeForms() {
    // Contact form
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactForm);
    }

    // Order form
    const orderForm = document.getElementById('orderForm');
    if (orderForm) {
        orderForm.addEventListener('submit', handleOrderForm);
    }

    // Newsletter form
    const newsletterForm = document.getElementById('newsletterForm');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', handleNewsletterForm);
    }
}

// Set minimum dates for order form
function setMinimumDates() {
    const pickupDate = document.getElementById('pickupDate');
    const deliveryDate = document.getElementById('deliveryDate');

    if (pickupDate && deliveryDate) {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const minDate = tomorrow.toISOString().split('T')[0];
        pickupDate.min = minDate;

        // Update delivery date when pickup date changes
        pickupDate.addEventListener('change', function () {
            const selectedPickup = new Date(this.value);
            const minDelivery = new Date(selectedPickup);
            minDelivery.setDate(minDelivery.getDate() + 1);

            deliveryDate.min = minDelivery.toISOString().split('T')[0];

            // Clear delivery date if it's before the new minimum
            if (deliveryDate.value && new Date(deliveryDate.value) <= selectedPickup) {
                deliveryDate.value = '';
            }
        });
    }
}

// Contact Form Handler
function handleContactForm(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);

    // Show loading state
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Sending...';
    submitBtn.disabled = true;

    // Simulate API call
    setTimeout(() => {
        // Reset form
        e.target.reset();

        // Show success message
        showAlert('success', 'Thank you for your message! We will get back to you soon.');

        // Reset button
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;

        console.log('Contact form data:', data);
    }, 2000);
}

// Order Form Handler
function handleOrderForm(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);

    // Validate that at least one service is selected
    const totalItems = getTotalItems();
    if (totalItems === 0) {
        showAlert('warning', 'Please select at least one service item.');
        return;
    }

    // Show loading state
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Processing...';
    submitBtn.disabled = true;

    // Simulate API call
    setTimeout(() => {
        // Generate order ID
        const orderId = generateOrderId();

        // Show success modal
        document.getElementById('orderIdDisplay').textContent = orderId;
        const modal = new bootstrap.Modal(document.getElementById('orderSuccessModal'));
        modal.show();

        // Reset button
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;

        console.log('Order form data:', data);
        console.log('Order ID:', orderId);
    }, 3000);
}

// Newsletter Form Handler
function handleNewsletterForm(e) {
    e.preventDefault();

    const email = e.target.querySelector('input[type="email"]').value;

    // Show loading state
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Subscribing...';
    submitBtn.disabled = true;

    // Simulate API call
    setTimeout(() => {
        // Reset form
        e.target.reset();

        // Show success message
        showAlert('success', 'Successfully subscribed to our newsletter!');

        // Reset button
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;

        console.log('Newsletter subscription:', email);
    }, 1500);
}

// Utility Functions
function showAlert(type, message) {
    // Create alert element
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
    alertDiv.style.cssText = 'top: 100px; right: 20px; z-index: 9999; min-width: 300px;';
    alertDiv.innerHTML = `
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

function generateOrderId() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');

    return `#FC${year}${month}${day}${random}`;
}

function getTotalItems() {
    const quantities = [
        parseInt(document.getElementById('wash-fold-qty')?.textContent || 0),
        parseInt(document.getElementById('dry-cleaning-qty')?.textContent || 0),
        parseInt(document.getElementById('ironing-qty')?.textContent || 0)
    ];

    return quantities.reduce((sum, qty) => sum + qty, 0);
}

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Back to top button
function createBackToTopButton() {
    const button = document.createElement('button');
    button.innerHTML = '<i class="fas fa-arrow-up"></i>';
    button.className = 'btn btn-primary position-fixed';
    button.style.cssText = 'bottom: 20px; right: 20px; z-index: 999; border-radius: 50%; width: 50px; height: 50px; display: none;';
    button.title = 'Back to Top';

    button.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    document.body.appendChild(button);

    // Show/hide on scroll
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            button.style.display = 'block';
        } else {
            button.style.display = 'none';
        }
    });
}

// Initialize back to top button
createBackToTopButton();

// Performance optimization
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

// Debounced scroll handler
const debouncedScrollHandler = debounce(() => {
    // Handle scroll events here
    console.log('Scrolled');
}, 100);

window.addEventListener('scroll', debouncedScrollHandler);

// Local Storage Functions for User Preferences
function saveUserPreferences(data) {
    localStorage.setItem('freshCleanPrefs', JSON.stringify(data));
}

function getUserPreferences() {
    const prefs = localStorage.getItem('freshCleanPrefs');
    return prefs ? JSON.parse(prefs) : {};
}

// Auto-save form data
function autoSaveFormData(formId) {
    const form = document.getElementById(formId);
    if (!form) return;

    const inputs = form.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        input.addEventListener('input', debounce(() => {
            const formData = new FormData(form);
            const data = Object.fromEntries(formData);
            localStorage.setItem(`${formId}_draft`, JSON.stringify(data));
        }, 500));
    });

    // Load saved data on page load
    const savedData = localStorage.getItem(`${formId}_draft`);
    if (savedData) {
        const data = JSON.parse(savedData);
        Object.keys(data).forEach(key => {
            const input = form.querySelector(`[name="${key}"]`);
            if (input) {
                input.value = data[key];
            }
        });
    }
}
// ============================================================================
// UNIVERSAL DROPDOWN PROTECTION - PRODUCTION READY
// ============================================================================

function initializeDropdownProtection() {
    console.log('🛡️ Initializing dropdown protection...');
    
    // Method 1: Stop propagation for all dropdown items
    const dropdownItems = document.querySelectorAll('.dropdown-menu a, .dropdown-menu .nav-link, .dropdown-item');
    dropdownItems.forEach(item => {
        item.addEventListener('click', function(e) {
            console.log('🛡️ Dropdown item clicked - preventing navbar close');
            e.stopPropagation();
        });
    });
    
    // Method 2: Specifically protect the secure access section
    const secureSection = document.querySelector('.dropdown-menu .px-3.py-2');
    if (secureSection) {
        secureSection.addEventListener('click', function(e) {
            console.log('🛡️ Secure section clicked - preventing close');
            e.stopPropagation();
            e.preventDefault();
        });
        
        // Protect all elements inside secure section
        const secureChildren = secureSection.querySelectorAll('*');
        secureChildren.forEach(child => {
            child.addEventListener('click', function(e) {
                e.stopPropagation();
            });
        });
    }
    
    // Method 3: Protect dropdown logos
    const dropdownLogos = document.querySelectorAll('.dropdown-menu .brand-avatar');
    dropdownLogos.forEach(logo => {
        logo.addEventListener('click', function(e) {
            console.log('🛡️ Dropdown logo clicked - preventing close');
            e.stopPropagation();
            e.preventDefault();
        });
    });
    
    console.log('✅ Dropdown protection initialized');
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    initializeDropdownProtection();
});

// Re-initialize if DOM changes (for dynamic content)
if (typeof MutationObserver !== 'undefined') {
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes.length) {
                initializeDropdownProtection();
            }
        });
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}
// Initialize auto-save for forms
autoSaveFormData('orderForm');
autoSaveFormData('contactForm');