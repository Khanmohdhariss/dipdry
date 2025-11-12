// Enhanced Order Page JavaScript - Fixed cart loading and minimum order handling
// Updated: ₹349 minimum order, No delivery charges, Fixed cart synchronization

document.addEventListener('DOMContentLoaded', function() {
    initializeOrderPage();
});

// Global variables
let cart = [];
let currentStep = 1;
let selectedPickupSlot = null;

// Configuration
const MIN_ORDER_VALUE = 349;
const DELIVERY_CHARGE = 0;

// Initialize the order page
function initializeOrderPage() {
    console.log('Initializing order page...');
    loadCartData();
    renderCartItems();
    updateOrderSummary();
    generatePickupSlots();
    setupFormValidation();
    loadSavedFormData();
    console.log('Order page initialized with', cart.length, 'items');
}

// Enhanced cart loading with better error handling
function loadCartData() {
    try {
        // First try to get checkout data (from pricing page)
        const checkoutData = localStorage.getItem('checkoutData');
        if (checkoutData) {
            const data = JSON.parse(checkoutData);
            cart = Array.isArray(data.items) ? data.items : [];
            console.log('Loaded from checkoutData:', cart.length, 'items');
            return;
        }
        
        // Fallback to cart data
        const cartData = localStorage.getItem('laundryCart');
        if (cartData) {
            cart = JSON.parse(cartData);
            cart = Array.isArray(cart) ? cart : [];
            console.log('Loaded from laundryCart:', cart.length, 'items');
        } else {
            cart = [];
            console.log('No cart data found');
        }
    } catch (error) {
        console.error('Error loading cart data:', error);
        cart = [];
    }
}

// Fixed cart rendering
function renderCartItems() {
    const cartItemsContainer = document.getElementById('cartItems');
    const emptyMessage = document.getElementById('emptyCartMessage');
    const continueBtn = document.getElementById('continueToDetails');
    
    if (!cartItemsContainer) {
        console.error('Cart container not found');
        return;
    }
    
    // Validate cart data
    if (!cart || !Array.isArray(cart) || cart.length === 0) {
        console.log('Cart is empty or invalid');
        if (emptyMessage) emptyMessage.style.display = 'block';
        if (continueBtn) continueBtn.style.display = 'none';
        return;
    }
    
    console.log('Rendering', cart.length, 'cart items');
    
    if (emptyMessage) emptyMessage.style.display = 'none';
    if (continueBtn) continueBtn.style.display = 'block';
    
    const itemsHTML = cart.map(item => {
        // Validate item structure
        if (!item || !item.name || !item.price || !item.quantity) {
            console.warn('Invalid item:', item);
            return '';
        }
        
        return `
            <div class="cart-item">
                <div class="d-flex justify-content-between align-items-center">
                    <div class="item-details">
                        <div class="item-name">${item.name}</div>
                        <div class="item-meta">
                            <span class="badge bg-light text-dark">${item.unit || 'Piece'}</span>
                            <span class="text-muted ms-2">₹${parseFloat(item.price).toFixed(2)} × ${item.quantity}</span>
                            <span class="badge bg-primary ms-2">${(item.category || 'general').toUpperCase()}</span>
                        </div>
                    </div>
                    <div class="item-price">
                        <div class="fs-5 fw-bold">₹${(parseFloat(item.price) * parseInt(item.quantity)).toFixed(2)}</div>
                        <button class="btn btn-sm btn-outline-danger mt-1" onclick="removeFromCart('${item.id}')">
                            <i class="fas fa-trash-alt me-1"></i>Remove
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).filter(html => html).join('');
    
    cartItemsContainer.innerHTML = itemsHTML;
}

// Fixed item removal
function removeFromCart(itemId) {
    console.log('Removing item:', itemId);
    
    if (!cart || !Array.isArray(cart)) {
        console.error('Invalid cart structure');
        return;
    }
    
    const initialLength = cart.length;
    cart = cart.filter(item => item && item.id !== itemId);
    
    console.log(`Removed item. Cart size: ${initialLength} -> ${cart.length}`);
    
    // Save updated cart to both storage locations
    saveCartData();
    
    // Re-render and update
    renderCartItems();
    updateOrderSummary();
    
    // Show feedback
    showNotification('Item removed from cart', 'success');
}

// Enhanced cart saving
function saveCartData() {
    try {
        // Save to both locations to maintain sync
        localStorage.setItem('laundryCart', JSON.stringify(cart));
        
        const checkoutData = {
            items: cart,
            timestamp: new Date().toISOString()
        };
        localStorage.setItem('checkoutData', JSON.stringify(checkoutData));
        
        console.log('Cart data saved:', cart.length, 'items');
    } catch (error) {
        console.error('Error saving cart data:', error);
    }
}

// Updated order summary with no delivery charges and minimum order validation
function updateOrderSummary() {
    const summaryItems = document.getElementById('summaryItems');
    const summarySubtotal = document.getElementById('summarySubtotal');
    const summaryDelivery = document.getElementById('summaryDelivery');
    const summaryExpress = document.getElementById('summaryExpress');
    const summaryTotal = document.getElementById('summaryTotal');
    
    if (!cart || cart.length === 0) {
        if (summaryItems) summaryItems.innerHTML = '<p class="text-muted">No items in cart</p>';
        if (summarySubtotal) summarySubtotal.textContent = '₹0.00';
        if (summaryDelivery) summaryDelivery.textContent = 'FREE';
        if (summaryExpress) summaryExpress.textContent = '₹0.00';
        if (summaryTotal) summaryTotal.textContent = '₹0.00';
        return;
    }
    
    const subtotal = cart.reduce((sum, item) => {
        const price = parseFloat(item.price) || 0;
        const quantity = parseInt(item.quantity) || 0;
        return sum + (price * quantity);
    }, 0);
    
    const deliveryCharge = DELIVERY_CHARGE; // Always 0
    const expressCharge = (selectedPickupSlot && selectedPickupSlot.includes('Express')) ? subtotal * 0.5 : 0;
    const total = subtotal + deliveryCharge + expressCharge;
    
    // Render summary items
    if (summaryItems) {
        const summaryHTML = cart.map(item => `
            <div class="d-flex justify-content-between mb-2 small">
                <span>${item.name} (${item.quantity})</span>
                <span>₹${(parseFloat(item.price) * parseInt(item.quantity)).toFixed(2)}</span>
            </div>
        `).join('');
        summaryItems.innerHTML = summaryHTML;
    }
    
    if (summarySubtotal) summarySubtotal.textContent = `₹${subtotal.toFixed(2)}`;
    if (summaryDelivery) summaryDelivery.textContent = 'FREE';
    if (summaryExpress) summaryExpress.textContent = `₹${expressCharge.toFixed(2)}`;
    if (summaryTotal) summaryTotal.textContent = `₹${total.toFixed(2)}`;
    
    // Check minimum order requirement
    updateMinimumOrderStatus(subtotal);
}

// New function to handle minimum order status
function updateMinimumOrderStatus(subtotal) {
    const minOrderElement = document.getElementById('minimumOrderStatus');
    
    if (subtotal < MIN_ORDER_VALUE) {
        const remaining = MIN_ORDER_VALUE - subtotal;
        const statusHtml = `
            <div class="alert alert-warning mt-3">
                <i class="fas fa-info-circle me-2"></i>
                <strong>Minimum order: ₹${MIN_ORDER_VALUE}</strong><br>
                Add ₹${remaining.toFixed(2)} more to proceed with checkout
            </div>
        `;
        
        if (minOrderElement) {
            minOrderElement.innerHTML = statusHtml;
        } else {
            // Add to summary if dedicated element doesn't exist
            const summaryCard = document.querySelector('.summary-card');
            if (summaryCard && !summaryCard.querySelector('.min-order-alert')) {
                const alertDiv = document.createElement('div');
                alertDiv.className = 'min-order-alert';
                alertDiv.innerHTML = statusHtml;
                summaryCard.appendChild(alertDiv);
            }
        }
    } else {
        if (minOrderElement) minOrderElement.innerHTML = '';
        // Remove alert if it exists
        const existingAlert = document.querySelector('.min-order-alert');
        if (existingAlert) existingAlert.remove();
    }
}

// Generate pickup slots
function generatePickupSlots() {
    const slotsContainer = document.getElementById('pickupSlots');
    if (!slotsContainer) return;
    
    const today = new Date();
    const slots = [];
    
    // Generate slots for next 7 days
    for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        
        const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
        const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const isToday = i === 0;
        const isTomorrow = i === 1;
        
        // Morning slot
        if (!isToday || today.getHours() < 11) {
            slots.push({
                id: `morning-${i}`,
                time: '9:00 AM - 12:00 PM',
                date: isToday ? 'Today' : isTomorrow ? 'Tomorrow' : `${dayName}, ${dateStr}`,
                price: 'Standard',
                available: true
            });
        }
        
        // Afternoon slot
        if (!isToday || today.getHours() < 15) {
            slots.push({
                id: `afternoon-${i}`,
                time: '2:00 PM - 5:00 PM',
                date: isToday ? 'Today' : isTomorrow ? 'Tomorrow' : `${dayName}, ${dateStr}`,
                price: 'Standard',
                available: true
            });
        }
        
        // Express slot (only for today and tomorrow)
        if (i <= 1 && (!isToday || today.getHours() < 18)) {
            slots.push({
                id: `express-${i}`,
                time: '6:00 PM - 8:00 PM',
                date: isToday ? 'Today' : 'Tomorrow',
                price: 'Express (+50%)',
                available: true,
                express: true
            });
        }
    }
    
    const slotsHTML = slots.map(slot => `
        <div class="col-md-6 mb-3">
            <label class="pickup-slot ${!slot.available ? 'disabled' : ''}" for="${slot.id}">
                <input type="radio" name="pickupSlot" id="${slot.id}" value="${slot.time} - ${slot.date}" 
                       ${!slot.available ? 'disabled' : ''} onchange="selectPickupSlot(this)">
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <div class="pickup-time">${slot.time}</div>
                        <div class="pickup-date">${slot.date}</div>
                    </div>
                    <div class="text-end">
                        <div class="badge ${slot.express ? 'bg-warning' : 'bg-success'} text-dark">
                            ${slot.price}
                        </div>
                        ${!slot.available ? '<div class="text-muted small">Unavailable</div>' : ''}
                    </div>
                </div>
            </label>
        </div>
    `).join('');
    
    slotsContainer.innerHTML = slotsHTML;
}

// Select pickup slot
function selectPickupSlot(radio) {
    selectedPickupSlot = radio.value;
    
    // Update UI
    document.querySelectorAll('.pickup-slot').forEach(slot => {
        slot.classList.remove('selected');
    });
    radio.closest('.pickup-slot').classList.add('selected');
    
    // Update order summary (for express charges)
    updateOrderSummary();
}

// Step navigation
function nextStep(stepNumber) {
    if (stepNumber === 2 && !validateStep1()) return;
    if (stepNumber === 3 && !validateStep2()) return;
    
    // Hide current step
    const currentStepEl = document.getElementById(`step${currentStep}`);
    if (currentStepEl) currentStepEl.style.display = 'none';
    
    // Show next step
    const nextStepEl = document.getElementById(`step${stepNumber}`);
    if (nextStepEl) nextStepEl.style.display = 'block';
    
    // Update progress
    updateProgressSteps(stepNumber);
    
    currentStep = stepNumber;
    
    // Auto-save form data
    if (stepNumber >= 3) {
        saveFormData();
    }
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function previousStep(stepNumber) {
    // Hide current step
    const currentStepEl = document.getElementById(`step${currentStep}`);
    if (currentStepEl) currentStepEl.style.display = 'none';
    
    // Show previous step
    const prevStepEl = document.getElementById(`step${stepNumber}`);
    if (prevStepEl) prevStepEl.style.display = 'block';
    
    // Update progress
    updateProgressSteps(stepNumber);
    
    currentStep = stepNumber;
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Update progress steps
function updateProgressSteps(activeStep) {
    document.querySelectorAll('.step-item').forEach((step, index) => {
        const stepNumber = index + 1;
        step.classList.remove('active', 'completed');
        
        if (stepNumber === activeStep) {
            step.classList.add('active');
        } else if (stepNumber < activeStep) {
            step.classList.add('completed');
        }
    });
}

// Validation functions
function validateStep1() {
    if (!cart || cart.length === 0) {
        showNotification('Please add items to your cart before continuing', 'error');
        return false;
    }
    
    const subtotal = cart.reduce((sum, item) => sum + (parseFloat(item.price) * parseInt(item.quantity)), 0);
    if (subtotal < MIN_ORDER_VALUE) {
        const remaining = MIN_ORDER_VALUE - subtotal;
        showNotification(`Minimum order value is ₹${MIN_ORDER_VALUE}. Please add ₹${remaining.toFixed(2)} more.`, 'error');
        return false;
    }
    
    return true;
}

function validateStep2() {
    const form = document.getElementById('deliveryForm');
    if (!form) return false;
    
    const requiredFields = ['fullName', 'phone', 'email', 'address', 'city', 'pincode', 'area'];
    
    let isValid = true;
    
    requiredFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (!field || !field.value.trim()) {
            if (field) {
                field.classList.add('is-invalid');
            }
            isValid = false;
        } else {
            field.classList.remove('is-invalid');
            field.classList.add('is-valid');
        }
    });
    
    // Validate email
    const email = document.getElementById('email');
    if (email && email.value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.value)) {
            email.classList.add('is-invalid');
            isValid = false;
        }
    }
    
    // Validate phone
    const phone = document.getElementById('phone');
    if (phone && phone.value) {
        const phoneRegex = /^[6-9]\d{9}$/;
        if (!phoneRegex.test(phone.value.replace(/\D/g, ''))) {
            phone.classList.add('is-invalid');
            isValid = false;
        }
    }
    
    if (!isValid) {
        showNotification('Please fill in all required fields correctly', 'error');
    }
    
    return isValid;
}

function validateStep3() {
    if (!selectedPickupSlot) {
        showNotification('Please select a pickup time slot', 'error');
        return false;
    }
    return true;
}

// Enhanced order placement with minimum order check
function placeOrder() {
    if (!validateStep3()) return;
    
    // Final minimum order check
    const subtotal = cart.reduce((sum, item) => sum + (parseFloat(item.price) * parseInt(item.quantity)), 0);
    if (subtotal < MIN_ORDER_VALUE) {
        const remaining = MIN_ORDER_VALUE - subtotal;
        showNotification(`Minimum order value is ₹${MIN_ORDER_VALUE}. Please add ₹${remaining.toFixed(2)} more.`, 'error');
        return;
    }
    
    const orderBtn = document.querySelector('#step3 .btn-primary-gradient');
    if (!orderBtn) return;
    
    const spinner = orderBtn.querySelector('.loading-spinner');
    const btnText = orderBtn.querySelector('.btn-text');
    
    // Show loading
    if (spinner) spinner.classList.add('show');
    if (btnText) btnText.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Processing...';
    orderBtn.disabled = true;
    
    // Collect order data
    const orderData = {
        id: generateOrderId(),
        items: cart,
        customer: {
            fullName: document.getElementById('fullName')?.value || '',
            phone: document.getElementById('phone')?.value || '',
            email: document.getElementById('email')?.value || '',
            address: document.getElementById('address')?.value || '',
            city: document.getElementById('city')?.value || '',
            pincode: document.getElementById('pincode')?.value || '',
            area: document.getElementById('area')?.value || '',
            specialInstructions: document.getElementById('specialInstructions')?.value || ''
        },
        pickup: {
            slot: selectedPickupSlot,
            specialInstructions: document.getElementById('specialInstructions')?.value || ''
        },
        pricing: {
            subtotal: subtotal,
            delivery: DELIVERY_CHARGE,
            express: (selectedPickupSlot && selectedPickupSlot.includes('Express')) ? subtotal * 0.5 : 0,
            total: subtotal + ((selectedPickupSlot && selectedPickupSlot.includes('Express')) ? subtotal * 0.5 : 0)
        },
        timestamp: new Date().toISOString()
    };
    
    // Simulate API call
    setTimeout(() => {
        try {
            // Save order data
            localStorage.setItem('lastOrder', JSON.stringify(orderData));
            
            // Clear cart data
            localStorage.removeItem('laundryCart');
            localStorage.removeItem('checkoutData');
            localStorage.removeItem('orderFormData');
            
            // Update order display
            const orderNumberEl = document.getElementById('orderNumber');
            const pickupTimeDisplayEl = document.getElementById('pickupTimeDisplay');
            
            if (orderNumberEl) orderNumberEl.textContent = orderData.id;
            if (pickupTimeDisplayEl) pickupTimeDisplayEl.textContent = selectedPickupSlot;
            
            // Show success
            nextStep(4);
            
            // Show success notification
            showNotification('Order placed successfully! We\'ll call you soon.', 'success');
            
            console.log('Order placed:', orderData);
            
        } catch (error) {
            console.error('Error placing order:', error);
            showNotification('Error placing order. Please try again.', 'error');
            
            // Reset button
            if (spinner) spinner.classList.remove('show');
            if (btnText) btnText.innerHTML = '<i class="fas fa-check me-2"></i>Place Order';
            orderBtn.disabled = false;
        }
        
    }, 3000);
}

// Generate order ID
function generateOrderId() {
  const date = new Date();
  const year  = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day   = String(date.getDate()).padStart(2, '0');

  // 5 random digits instead of 3
  const random = Math.floor(Math.random() * 100000)  // 0..99999
                  .toString()
                  .padStart(5, '0');

  // Prefix can be your brand code (DDC/FC/etc.)
  return `DDC${year}${month}${day}${random}`;
}


// Form data persistence
function saveFormData() {
    const formData = {
        fullName: document.getElementById('fullName')?.value || '',
        phone: document.getElementById('phone')?.value || '',
        email: document.getElementById('email')?.value || '',
        address: document.getElementById('address')?.value || '',
        city: document.getElementById('city')?.value || '',
        pincode: document.getElementById('pincode')?.value || '',
        area: document.getElementById('area')?.value || '',
        specialInstructions: document.getElementById('specialInstructions')?.value || ''
    };
    
    try {
        localStorage.setItem('orderFormData', JSON.stringify(formData));
    } catch (error) {
        console.error('Error saving form data:', error);
    }
}

function loadSavedFormData() {
    try {
        const savedData = localStorage.getItem('orderFormData');
        if (!savedData) return;
        
        const formData = JSON.parse(savedData);
        Object.keys(formData).forEach(key => {
            const field = document.getElementById(key);
            if (field && formData[key]) {
                field.value = formData[key];
            }
        });
    } catch (error) {
        console.error('Error loading form data:', error);
    }
}

// Setup form validation
function setupFormValidation() {
    const form = document.getElementById('deliveryForm');
    if (!form) return;
    
    // Real-time validation
    form.querySelectorAll('input, select, textarea').forEach(field => {
        field.addEventListener('blur', function() {
            validateField(this);
        });
        
        field.addEventListener('input', function() {
            if (this.classList.contains('is-invalid')) {
                validateField(this);
            }
            
            // Auto-save with debouncing
            debounce(saveFormData, 1000)();
        });
    });
    
    // Phone formatting
    const phoneField = document.getElementById('phone');
    if (phoneField) {
        phoneField.addEventListener('input', function() {
            formatPhoneNumber(this);
        });
    }
}

// Validate individual field
function validateField(field) {
    const value = field.value.trim();
    field.classList.remove('is-invalid', 'is-valid');
    
    if (field.hasAttribute('required') && !value) {
        field.classList.add('is-invalid');
        return false;
    }
    
    // Email validation
    if (field.type === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            field.classList.add('is-invalid');
            return false;
        }
    }
    
    // Phone validation
    if (field.id === 'phone' && value) {
        const phoneRegex = /^[6-9]\d{9}$/;
        if (!phoneRegex.test(value.replace(/\D/g, ''))) {
            field.classList.add('is-invalid');
            return false;
        }
    }
    
    if (value) {
        field.classList.add('is-valid');
    }
    
    return true;
}

// Format phone number
function formatPhoneNumber(input) {
    let value = input.value.replace(/\D/g, '');
    if (value.length > 10) {
        value = value.substring(0, 10);
    }
    input.value = value;
}

// Notification system
function showNotification(message, type = 'info') {
    // Remove existing notifications
    document.querySelectorAll('.order-notification').forEach(n => n.remove());
    
    const notification = document.createElement('div');
    notification.className = `alert alert-${type === 'error' ? 'danger' : type} order-notification position-fixed shadow-lg`;
    notification.style.cssText = 'top: 100px; right: 20px; z-index: 9999; min-width: 300px;';
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-triangle' : 'info-circle'} me-2"></i>
        ${message}
        <button type="button" class="btn-close" onclick="this.parentElement.remove()"></button>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

// Utility function for debouncing
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

// Global functions for onclick handlers
window.removeFromCart = removeFromCart;
window.nextStep = nextStep;
window.previousStep = previousStep;
window.selectPickupSlot = selectPickupSlot;
window.placeOrder = placeOrder;