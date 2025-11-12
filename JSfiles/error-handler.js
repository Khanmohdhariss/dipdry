// Global Error Handler for Dip Dry Care
class ErrorHandler {
    constructor() {
        this.setupGlobalErrorHandling();
    }

    setupGlobalErrorHandling() {
        // Handle unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            console.error('Unhandled promise rejection:', event.reason);
            this.showGlobalError('Something went wrong. Please try again.');
            event.preventDefault();
        });

        // Handle JavaScript errors
        window.addEventListener('error', (event) => {
            console.error('JavaScript error:', event.error);
            this.showGlobalError('A system error occurred. Please refresh the page.');
        });

        // Handle network errors
        window.addEventListener('online', () => {
            this.showGlobalError('Connection restored.', 'success', 3000);
        });

        window.addEventListener('offline', () => {
            this.showGlobalError('You are offline. Some features may not work.', 'warning');
        });
    }

    showGlobalError(message, type = 'error', duration = 5000) {
        // Remove existing error notifications
        document.querySelectorAll('.global-error-notification').forEach(el => el.remove());

        const notification = document.createElement('div');
        notification.className = `global-error-notification alert alert-${type === 'error' ? 'danger' : type} position-fixed`;
        notification.style.cssText = `
            top: 20px;
            right: 20px;
            z-index: 99999;
            min-width: 300px;
            max-width: 400px;
            border-radius: 12px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            animation: slideInRight 0.3s ease;
        `;
        
        const icon = type === 'success' ? 'fa-check-circle' : 
                    type === 'warning' ? 'fa-exclamation-triangle' : 'fa-exclamation-circle';

        notification.innerHTML = `
            <div class="d-flex align-items-center">
                <i class="fas ${icon} me-3"></i>
                <div class="flex-grow-1">${message}</div>
                <button type="button" class="btn-close ms-3" onclick="this.parentElement.parentElement.remove()"></button>
            </div>
        `;

        document.body.appendChild(notification);

        if (duration > 0) {
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.remove();
                }
            }, duration);
        }
    }

    handleAPIError(error, context = '') {
        console.error(`API Error ${context}:`, error);
        
        let userMessage = 'Something went wrong. Please try again.';
        
        if (error.name === 'AbortError') {
            userMessage = 'Request timeout. Please check your connection.';
        } else if (error.message.includes('401')) {
            userMessage = 'Session expired. Please login again.';
            setTimeout(() => window.location.href = 'partner-login.html', 2000);
        } else if (error.message.includes('403')) {
            userMessage = 'Access denied. Please contact support.';
        } else if (error.message.includes('404')) {
            userMessage = 'Resource not found.';
        } else if (error.message.includes('500')) {
            userMessage = 'Server error. Please try again later.';
        }

        this.showGlobalError(userMessage, 'error');
    }
}

// Initialize error handler
const errorHandler = new ErrorHandler();
window.errorHandler = errorHandler;