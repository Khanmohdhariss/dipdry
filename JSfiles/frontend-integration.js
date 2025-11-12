// FRONTEND INTEGRATION: Connect Your Website to Enterprise COD Backend
// File: frontend-integration.js

// ============================================================================
// BACKEND CONNECTION CONFIGURATION
// ============================================================================

const API_CONFIG = {
    // Your backend URL (adjust as needed)
    BASE_URL: 'http://localhost:5000',
    
    // API endpoints
    ENDPOINTS: {
        health: '/api/health',
        paymentMethods: '/api/payment-methods', 
        createOrder: '/api/orders',
        customerOrders: '/api/orders/customer',
        adminLogin: '/api/auth/admin/login'
    },
    
    // Request timeout in milliseconds
    TIMEOUT: 30000,
    
    // Retry configuration
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000
};

// ============================================================================
// API CLIENT WITH ERROR HANDLING
// ============================================================================

class CODBackendAPI {
    constructor() {
        this.baseURL = API_CONFIG.BASE_URL;
        this.timeout = API_CONFIG.TIMEOUT;
        this.retryAttempts = API_CONFIG.RETRY_ATTEMPTS;
        this.retryDelay = API_CONFIG.RETRY_DELAY;
    }

    // Generic API request method with retry logic
    async makeRequest(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const requestOptions = {
            timeout: this.timeout,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        let lastError;
        
        for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), this.timeout);
                
                const response = await fetch(url, {
                    ...requestOptions,
                    signal: controller.signal
                });
                
                clearTimeout(timeoutId);
                
                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new APIError(`HTTP ${response.status}`, response.status, errorData);
                }
                
                return await response.json();
                
            } catch (error) {
                lastError = error;
                console.warn(`API Request attempt ${attempt} failed:`, error.message);
                
                if (attempt < this.retryAttempts && this.shouldRetry(error)) {
                    await this.sleep(this.retryDelay * attempt);
                    continue;
                }
                
                break;
            }
        }
        
        throw lastError || new APIError('Request failed after retries');
    }

    // Check if error is retryable
    shouldRetry(error) {
        return error.name === 'AbortError' || 
               error.name === 'TypeError' || 
               (error.status >= 500);
    }

    // Sleep utility for retry delays
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // ========================================================================
    // API METHODS
    // ========================================================================

    // Check backend health
    async checkHealth() {
        return await this.makeRequest(API_CONFIG.ENDPOINTS.health, {
            method: 'GET'
        });
    }

    // Get payment methods
    async getPaymentMethods() {
        return await this.makeRequest(API_CONFIG.ENDPOINTS.paymentMethods, {
            method: 'GET'
        });
    }

    // Create COD order
    async createOrder(orderData) {
        return await this.makeRequest(API_CONFIG.ENDPOINTS.createOrder, {
            method: 'POST',
            body: JSON.stringify(orderData)
        });
    }

    // Get customer orders
    async getCustomerOrders(phone, params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const endpoint = `${API_CONFIG.ENDPOINTS.customerOrders}/${phone}${queryString ? '?' + queryString : ''}`;
        
        return await this.makeRequest(endpoint, {
            method: 'GET'
        });
    }

    // Admin login
    async adminLogin(credentials) {
        return await this.makeRequest(API_CONFIG.ENDPOINTS.adminLogin, {
            method: 'POST',
            body: JSON.stringify(credentials)
        });
    }
}

// ============================================================================
// CUSTOM ERROR CLASS
// ============================================================================

class APIError extends Error {
    constructor(message, status = null, data = null) {
        super(message);
        this.name = 'APIError';
        this.status = status;
        this.data = data;
    }
}

// ============================================================================
// FRONTEND ORDER INTEGRATION
// ============================================================================

class CODOrderManager {
    constructor() {
        this.api = new CODBackendAPI();
        this.currentOrder = null;
        this.isProcessing = false;
        
        // Initialize on page load
        this.init();
    }

    // Initialize the order manager
    init() {
        this.checkBackendHealth();
        this.loadPaymentMethods();
        this.setupFormHandlers();
        this.setupErrorHandling();
        
        console.log('🚀 COD Order Manager initialized');
    }

    // Check if backend is healthy
    async checkBackendHealth() {
        try {
            const health = await this.api.checkHealth();
            console.log('✅ Backend health check:', health);
            
            if (health.success) {
                this.showConnectionStatus('Connected to secure COD backend', 'success');
            }
        } catch (error) {
            console.error('❌ Backend health check failed:', error);
            this.showConnectionStatus('Backend temporarily unavailable', 'warning');
        }
    }

    // Load payment methods
    async loadPaymentMethods() {
        try {
            const methods = await this.api.getPaymentMethods();
            console.log('💰 Payment methods loaded:', methods);
            
            if (methods.success) {
                this.updatePaymentMethodsUI(methods.data);
            }
        } catch (error) {
            console.error('❌ Failed to load payment methods:', error);
        }
    }

    // Setup form handlers for existing order forms
    setupFormHandlers() {
        // Handle existing order form submission
        const orderForm = document.getElementById('orderForm') || 
                         document.getElementById('deliveryForm');
        
        if (orderForm) {
            orderForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleOrderSubmission(orderForm);
            });
        }

        // Handle existing "Place Order" buttons
        const placeOrderButtons = document.querySelectorAll('[onclick*="placeOrder"], .place-order-btn');
        placeOrderButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                this.handlePlaceOrderClick();
            });
        });

        // Handle cart checkout
        const checkoutButton = document.getElementById('proceedToCheckout') || 
                              document.querySelector('.checkout-btn');
        
        if (checkoutButton) {
            checkoutButton.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleCartCheckout();
            });
        }
    }

    // ========================================================================
    // ORDER SUBMISSION HANDLERS
    // ========================================================================

    // Handle order form submission
    async handleOrderSubmission(form) {
        if (this.isProcessing) return;
        
        try {
            this.isProcessing = true;
            this.showLoadingState(true);
            
            // Extract form data
            const formData = new FormData(form);
            const orderData = this.buildOrderData(formData);
            
            // Validate order data
            const validation = this.validateOrderData(orderData);
            if (!validation.valid) {
                throw new APIError(validation.message);
            }

            // Submit to backend
            const response = await this.api.createOrder(orderData);
            
            if (response.success) {
                this.handleOrderSuccess(response);
            } else {
                throw new APIError(response.message || 'Order submission failed');
            }
            
        } catch (error) {
            this.handleOrderError(error);
        } finally {
            this.isProcessing = false;
            this.showLoadingState(false);
        }
    }

    // Handle place order button clicks
    async handlePlaceOrderClick() {
        // Get order data from global variables or localStorage
        const orderData = this.getExistingOrderData();
        
        if (!orderData) {
            this.showNotification('No order data found. Please fill the form first.', 'warning');
            return;
        }

        try {
            this.isProcessing = true;
            this.showLoadingState(true);
            
            const response = await this.api.createOrder(orderData);
            
            if (response.success) {
                this.handleOrderSuccess(response);
            } else {
                throw new APIError(response.message || 'Order submission failed');
            }
            
        } catch (error) {
            this.handleOrderError(error);
        } finally {
            this.isProcessing = false;
            this.showLoadingState(false);
        }
    }

    // Handle cart checkout
    async handleCartCheckout() {
        // Get cart data from localStorage
        const cart = JSON.parse(localStorage.getItem('laundryCart') || '[]');
        
        if (!cart || cart.length === 0) {
            this.showNotification('Your cart is empty. Add items first.', 'warning');
            return;
        }

        // Convert cart to order format
        const orderData = this.convertCartToOrder(cart);
        
        // Redirect to order form with cart data
        localStorage.setItem('checkoutData', JSON.stringify({
            items: cart,
            timestamp: new Date().toISOString()
        }));
        
        window.location.href = 'order.html';
    }

    // ========================================================================
    // DATA CONVERSION METHODS
    // ========================================================================

    // Build order data from form
    buildOrderData(formData) {
        const data = Object.fromEntries(formData);
        
        return {
            customerInfo: {
                name: data.fullName || data.firstName + ' ' + (data.lastName || ''),
                phone: data.phone,
                email: data.email,
                address: {
                    street: data.address,
                    area: data.area,
                    pincode: data.pincode
                }
            },
            items: this.getOrderItems(data),
            pickupSlot: {
                date: data.pickupDate,
                timeSlot: data.pickupTime
            },
            deliverySlot: {
                date: data.deliveryDate,
                timeSlot: data.deliveryTime
            },
            specialInstructions: data.specialInstructions || null
        };
    }

    // Get order items from various sources
    getOrderItems(formData) {
        // Try to get from cart first
        const cart = JSON.parse(localStorage.getItem('laundryCart') || '[]');
        if (cart.length > 0) {
            return cart.map(item => ({
                name: item.name,
                quantity: item.quantity,
                price: item.price
            }));
        }

        // Try to get from checkout data
        const checkoutData = JSON.parse(localStorage.getItem('checkoutData') || '{}');
        if (checkoutData.items && checkoutData.items.length > 0) {
            return checkoutData.items.map(item => ({
                name: item.name,
                quantity: item.quantity,
                price: item.price
            }));
        }

        // Try to get from form data (for older forms)
        const items = [];
        
        // Check for service quantities
        if (formData['wash-fold-qty'] && parseInt(formData['wash-fold-qty']) > 0) {
            items.push({
                name: 'Wash & Fold',
                quantity: parseInt(formData['wash-fold-qty']),
                price: 15
            });
        }
        
        if (formData['dry-cleaning-qty'] && parseInt(formData['dry-cleaning-qty']) > 0) {
            items.push({
                name: 'Dry Cleaning',
                quantity: parseInt(formData['dry-cleaning-qty']),
                price: 80
            });
        }

        // Default fallback item if no items found
        if (items.length === 0) {
            items.push({
                name: 'Laundry Service',
                quantity: 1,
                price: 100
            });
        }

        return items;
    }

    // Get existing order data from global scope
    getExistingOrderData() {
        // Try to get from window object (from existing scripts)
        if (window.orderData) {
            return this.convertExistingOrderData(window.orderData);
        }

        // Try to get from localStorage
        const savedOrder = localStorage.getItem('orderFormData');
        if (savedOrder) {
            const data = JSON.parse(savedOrder);
            return this.convertExistingOrderData(data);
        }

        return null;
    }

    // Convert existing order data to backend format
    convertExistingOrderData(data) {
        return {
            customerInfo: {
                name: data.customer?.fullName || data.fullName || 'Customer',
                phone: data.customer?.phone || data.phone || '',
                email: data.customer?.email || data.email,
                address: {
                    street: data.customer?.address || data.address || '',
                    area: data.customer?.city || data.area || '',
                    pincode: data.customer?.pincode || data.pincode || ''
                }
            },
            items: data.items || [{
                name: 'Laundry Service',
                quantity: 1,
                price: 100
            }],
            pickupSlot: {
                date: data.pickup?.slot || new Date().toISOString().split('T')[0],
                timeSlot: data.pickup?.timeSlot || '15:00-18:00'
            },
            deliverySlot: {
                date: data.delivery?.slot || new Date().toISOString().split('T')[0], 
                timeSlot: data.delivery?.timeSlot || '15:00-18:00'
            },
            specialInstructions: data.specialInstructions
        };
    }

    // Convert cart to order format
    convertCartToOrder(cart) {
        return {
            items: cart.map(item => ({
                name: item.name,
                quantity: item.quantity,
                price: item.price
            }))
        };
    }

    // ========================================================================
    // VALIDATION
    // ========================================================================

    validateOrderData(orderData) {
        const errors = [];

        // Validate customer info
        if (!orderData.customerInfo?.name?.trim()) {
            errors.push('Customer name is required');
        }
        
        if (!orderData.customerInfo?.phone?.match(/^[6-9]\d{9}$/)) {
            errors.push('Valid 10-digit Indian phone number is required');
        }

        if (!orderData.customerInfo?.address?.street?.trim()) {
            errors.push('Address is required');
        }

        // Validate items
        if (!orderData.items || orderData.items.length === 0) {
            errors.push('At least one item is required');
        }

        // Validate slots
        if (!orderData.pickupSlot?.date) {
            errors.push('Pickup date is required');
        }

        if (errors.length > 0) {
            return {
                valid: false,
                message: errors[0] // Show first error
            };
        }

        return { valid: true };
    }

    // ========================================================================
    // SUCCESS AND ERROR HANDLERS
    // ========================================================================

    handleOrderSuccess(response) {
        console.log('✅ Order created successfully:', response);
        
        this.currentOrder = response.data;
        
        // Clear cart and form data
        localStorage.removeItem('laundryCart');
        localStorage.removeItem('checkoutData');
        localStorage.removeItem('orderFormData');
        
        // Show success message
        this.showOrderSuccessModal(response.data);
        
        // Optional: Redirect to success page
        // window.location.href = 'order-success.html';
    }

    handleOrderError(error) {
        console.error('❌ Order submission failed:', error);
        
        let message = 'Failed to place order. Please try again.';
        
        if (error instanceof APIError) {
            if (error.data && error.data.message) {
                message = error.data.message;
            } else {
                message = error.message;
            }
        }
        
        this.showNotification(message, 'error');
    }

    // ========================================================================
    // UI UPDATE METHODS
    // ========================================================================

    showOrderSuccessModal(orderData) {
        const modal = document.createElement('div');
        modal.className = 'modal fade show';
        modal.style.display = 'block';
        modal.innerHTML = `
            <div class="modal-dialog modal-lg">
                <div class="modal-content border-0 shadow-lg">
                    <div class="modal-header bg-success text-white border-0">
                        <h5 class="modal-title">
                            <i class="fas fa-check-circle me-2"></i>
                            Order Placed Successfully!
                        </h5>
                    </div>
                    <div class="modal-body text-center py-4">
                        <div class="mb-4">
                            <i class="fas fa-check-circle text-success" style="font-size: 4rem;"></i>
                        </div>
                        
                        <h4 class="text-success mb-3">Thank You for Your Order!</h4>
                        
                        <div class="bg-light p-4 rounded mb-4">
                            <h6 class="fw-bold mb-3">Order Details</h6>
                            <p class="mb-2"><strong>Order ID:</strong> ${orderData.order.orderId}</p>
                            <p class="mb-2"><strong>Customer:</strong> ${orderData.order.customerName}</p>
                            <p class="mb-2"><strong>Phone:</strong> ${orderData.order.phone}</p>
                            <p class="mb-2"><strong>Total Amount:</strong> ₹${orderData.order.totalAmount}</p>
                            <p class="mb-0"><strong>Payment:</strong> Cash on Delivery</p>
                        </div>
                        
                        <div class="alert alert-info">
                            <h6 class="fw-bold mb-2">What Happens Next?</h6>
                            <ul class="list-unstyled mb-0 text-start">
                                <li class="mb-1">📞 We'll call you within 15 minutes to confirm</li>
                                <li class="mb-1">🚚 Pickup scheduled for ${orderData.order.pickupSlot.formattedDate}</li>
                                <li class="mb-1">🏠 Delivery at your selected time slot</li>
                                <li class="mb-0">💰 Pay cash on delivery: ₹${orderData.order.totalAmount}</li>
                            </ul>
                        </div>
                        
                        ${orderData.instructions ? `
                        <div class="text-muted small">
                            <p class="mb-1">${orderData.instructions.payment}</p>
                            <p class="mb-0">${orderData.instructions.support}</p>
                        </div>
                        ` : ''}
                    </div>
                    <div class="modal-footer border-0 justify-content-center">
                        <button type="button" class="btn btn-primary" onclick="window.location.href='index.html'">
                            Back to Home
                        </button>
                        <button type="button" class="btn btn-outline-primary" onclick="window.location.href='pricing.html'">
                            Place Another Order
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Auto-remove after 30 seconds
        setTimeout(() => {
            if (modal.parentNode) {
                modal.remove();
            }
        }, 30000);
    }

    showLoadingState(show) {
        const buttons = document.querySelectorAll('.place-order-btn, .checkout-btn, [type="submit"]');
        
        buttons.forEach(button => {
            if (show) {
                button.disabled = true;
                const originalText = button.innerHTML;
                button.setAttribute('data-original-text', originalText);
                button.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Processing Order...';
            } else {
                button.disabled = false;
                const originalText = button.getAttribute('data-original-text');
                if (originalText) {
                    button.innerHTML = originalText;
                }
            }
        });
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `alert alert-${type === 'error' ? 'danger' : type} position-fixed shadow-lg`;
        notification.style.cssText = `
            top: 100px;
            right: 20px;
            z-index: 9999;
            min-width: 350px;
            max-width: 500px;
        `;
        
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-triangle', 
            warning: 'fa-exclamation-circle',
            info: 'fa-info-circle'
        };
        
        notification.innerHTML = `
            <div class="d-flex align-items-center">
                <i class="fas ${icons[type] || icons.info} me-3 fs-5"></i>
                <div class="flex-grow-1">${message}</div>
                <button type="button" class="btn-close ms-3" onclick="this.parentElement.parentElement.remove()"></button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
    }

    showConnectionStatus(message, type) {
        const statusIndicator = document.getElementById('connection-status');
        if (statusIndicator) {
            statusIndicator.className = `badge bg-${type === 'success' ? 'success' : 'warning'}`;
            statusIndicator.textContent = message;
        }
    }

    updatePaymentMethodsUI(paymentMethods) {
        // Update payment method information in the UI
        const codInfo = document.querySelector('.cod-info, .payment-info');
        if (codInfo && paymentMethods.available.cod) {
            codInfo.innerHTML = `
                <div class="alert alert-success">
                    <h6><i class="fas fa-money-bill-wave me-2"></i>Cash on Delivery Available</h6>
                    <p class="mb-1">${paymentMethods.available.cod.description}</p>
                    <small class="text-muted">
                        Min Order: ₹${paymentMethods.available.cod.minimumAmount} | 
                        Max Order: ₹${paymentMethods.available.cod.maximumAmount}
                    </small>
                </div>
                ${paymentMethods.available.online ? `
                <div class="alert alert-info">
                    <p class="mb-0">${paymentMethods.available.online.description}</p>
                    <small>${paymentMethods.available.online.eta}</small>
                </div>
                ` : ''}
            `;
        }
    }

    setupErrorHandling() {
        // Global error handler for unhandled promises
        window.addEventListener('unhandledrejection', (event) => {
            console.error('Unhandled promise rejection:', event.reason);
            
            if (event.reason instanceof APIError) {
                this.showNotification('Service temporarily unavailable. Please try again.', 'error');
            }
        });

        // Network error detection
        window.addEventListener('offline', () => {
            this.showNotification('You are offline. Please check your internet connection.', 'warning');
        });

        window.addEventListener('online', () => {
            this.showNotification('Connection restored. You can now place orders.', 'success');
            this.checkBackendHealth();
        });
    }
}

// ============================================================================
// CUSTOMER ORDER LOOKUP
// ============================================================================

class CustomerOrderLookup {
    constructor() {
        this.api = new CODBackendAPI();
        this.setupLookupForm();
    }

    setupLookupForm() {
        const lookupButton = document.getElementById('lookup-orders-btn');
        const phoneInput = document.getElementById('customer-phone-lookup');
        
        if (lookupButton && phoneInput) {
            lookupButton.addEventListener('click', () => {
                this.lookupOrders(phoneInput.value);
            });
        }
    }

    async lookupOrders(phone) {
        if (!phone || !phone.match(/^[6-9]\d{9}$/)) {
            alert('Please enter a valid 10-digit phone number');
            return;
        }

        try {
            const response = await this.api.getCustomerOrders(phone);
            
            if (response.success) {
                this.displayOrderHistory(response.data.orders);
            } else {
                alert('No orders found for this phone number');
            }
        } catch (error) {
            console.error('Order lookup failed:', error);
            alert('Failed to lookup orders. Please try again.');
        }
    }

    displayOrderHistory(orders) {
        // Create and show order history modal
        console.log('Customer orders:', orders);
        // Implementation depends on your UI framework
    }
}

// ============================================================================
// INITIALIZE ON PAGE LOAD
// ============================================================================

// Initialize the order manager when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Initialize COD Order Manager
    window.codOrderManager = new CODOrderManager();
    
    // Initialize Customer Order Lookup if elements exist
    if (document.getElementById('customer-phone-lookup')) {
        window.customerLookup = new CustomerOrderLookup();
    }
    
    console.log('🎉 Frontend integration initialized successfully!');
});

// ============================================================================
// GLOBAL FUNCTIONS FOR EXISTING ONCLICK HANDLERS
// ============================================================================

// Override existing placeOrder function
window.placeOrder = function() {
    if (window.codOrderManager) {
        window.codOrderManager.handlePlaceOrderClick();
    } else {
        console.error('COD Order Manager not initialized');
    }
};

// Override existing proceedToCheckout function  
window.proceedToCheckout = function() {
    if (window.codOrderManager) {
        window.codOrderManager.handleCartCheckout();
    } else {
        console.error('COD Order Manager not initialized');
    }
};

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        CODBackendAPI,
        CODOrderManager,
        CustomerOrderLookup,
        APIError
    };
}