// Partner Login JavaScript for Dip Dry Care
// Enhanced login functionality specifically for partners and vendors

class PartnerLogin {
    constructor() {
        this.maxAttempts = 3;
        this.lockoutTime = 10; // minutes
        this.isLoading = false;
        this.loginForm = null;
    }

    // Initialize the partner login system
    init() {
        this.loginForm = document.getElementById('partnerLoginForm');
        if (!this.loginForm) {
            console.error('🔑 Partner login form not found');
            return;
        }

        this.setupEventListeners();
        this.checkExistingSession();
        this.setupFormValidation();
        this.loadLoginAttempts();
        this.addEnhancedStyling();
        this.displayPartnerCredentials();
        
        console.log('🔑 Partner Login System initialized');
    }

    // Display available partner credentials for testing
    displayPartnerCredentials() {
        // Only in development - remove in production
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            setTimeout(() => {
                console.log('🔑 Available Partner Credentials for Testing:');
                console.table({
                    'Clean Master': { ID: 'clean001', Password: 'clean123', Type: 'Laundry Service' },
                    'Fresh Care': { ID: 'fresh002', Password: 'fresh123', Type: 'Dry Cleaning' },
                    'Quick Wash': { ID: 'quick003', Password: 'quick123', Type: 'Express Service' },
                    'Demo Partner': { ID: 'partner', Password: 'partner123', Type: 'Demo Service' },
                    'Demo Vendor': { ID: 'vendor', Password: 'vendor123', Type: 'Supply Vendor' }
                });
            }, 2000);
        }
    }

    // Setup all event listeners
    setupEventListeners() {
        // Form submission
        this.loginForm.addEventListener('submit', (e) => this.handleLogin(e));

        // Input field events
        const usernameField = document.getElementById('partnerUsername');
        const passwordField = document.getElementById('partnerPassword');

        if (usernameField) {
            usernameField.addEventListener('input', () => this.clearFieldErrors());
            usernameField.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') passwordField?.focus();
            });
        }

        if (passwordField) {
            passwordField.addEventListener('input', () => this.clearFieldErrors());
            passwordField.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.handleLogin(e);
            });
        }

        // Auto-focus username field
        setTimeout(() => {
            usernameField?.focus();
        }, 500);

        // Prevent multiple form submissions
        this.loginForm.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && this.isLoading) {
                e.preventDefault();
            }
        });
    }

    // Check if partner already has a valid session
    checkExistingSession() {
        if (typeof partnerAuth !== 'undefined' && partnerAuth.isAuthenticated()) {
            console.log('🔑 Partner already authenticated, redirecting to dashboard');
            this.showAlert('You have an active partner session. Redirecting to dashboard...', 'success');
            setTimeout(() => {
                this.redirectToDashboard();
            }, 2000);
        }
    }

    // Handle form submission
    async handleLogin(event) {
    event.preventDefault();
    
    if (this.isLoading) return;

    // Get form values
    const partnerId = this.loginForm.username.value.trim();
    const password = this.loginForm.password.value.trim();
    const remember = this.loginForm.remember.checked;

    // Validate inputs
    if (!this.validateInputs(partnerId, password)) {
        return;
    }

    // Show loading state
    this.setLoadingState(true);

    try {
        // Use API validation instead of local
        const success = await partnerAuth.createSession(partnerId, password, remember);
        
        if (success) {
            this.handleLoginSuccess(partnerId);
        } else {
            this.handleLoginFailure();
        }
    } catch (error) {
        console.error('🔑 Partner login error:', error);
        errorHandler.handleAPIError(error, 'during login');
        this.showAlert('Login service unavailable. Please try again.', 'error');
        this.setLoadingState(false);
    }

    }

    // Validate form inputs
    validateInputs(partnerId, password) {
        this.clearFieldErrors();
        let isValid = true;

        if (!partnerId) {
            this.showFieldError('partnerUsername', 'Partner ID is required');
            isValid = false;
        } else if (partnerId.length < 3) {
            this.showFieldError('partnerUsername', 'Partner ID must be at least 3 characters');
            isValid = false;
        }

        if (!password) {
            this.showFieldError('partnerPassword', 'Password is required');
            isValid = false;
        } else if (password.length < 6) {
            this.showFieldError('partnerPassword', 'Password must be at least 6 characters');
            isValid = false;
        }

        return isValid;
    }

    // Handle successful login
    handleLoginSuccess(partnerId) {
        console.log('🔑 Partner login successful for:', partnerId);

        // Get partner info
        const partnerInfo = partnerAuth.getPartnerInfo();
        
        // Clear failed attempts
        this.clearLoginAttempts();

        // Log successful login
        this.logLoginAttempt(partnerId, true);

        // Show success message with partner info
        this.showAlert(`Welcome back, ${partnerInfo.partnerName}! 🎉 Redirecting to your dashboard...`, 'success');

        // Redirect to dashboard
        setTimeout(() => {
            this.redirectToDashboard();
        }, 2000);
    }

    // Handle failed login
    handleLoginFailure() {
        console.log('🔑 Partner login failed');

        // Increment failed attempts
        this.incrementLoginAttempts();
        
        // Get attempt count
        const attempts = this.getLoginAttempts();
        const remaining = this.maxAttempts - attempts;

        // Log failed attempt
        this.logLoginAttempt(this.loginForm.username.value.trim(), false);

        // Show error message
        if (remaining > 0) {
            this.showAlert(`❌ Invalid Partner ID or Password. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.`, 'error');
            this.showFieldError('partnerPassword', 'Incorrect credentials');
        } else {
            this.lockAccount();
            this.showAlert(`🔒 Partner account locked for ${this.lockoutTime} minutes due to multiple failed attempts.`, 'error');
        }

        // Clear password field and focus
        this.loginForm.password.value = '';
        setTimeout(() => {
            document.getElementById('partnerPassword')?.focus();
        }, 100);

        this.setLoadingState(false);
    }

    // Set loading state
    setLoadingState(loading) {
        this.isLoading = loading;
        
        const loginBtn = this.loginForm.querySelector('.partner-login-btn');
        const spinner = loginBtn?.querySelector('.loading-spinner');
        const btnText = loginBtn?.querySelector('.btn-text');

        if (loginBtn) {
            loginBtn.disabled = loading;
        }

        if (btnText && spinner) {
            if (loading) {
                btnText.style.display = 'none';
                spinner.style.display = 'inline-block';
            } else {
                btnText.style.display = 'flex';
                spinner.style.display = 'none';
            }
        }

        // Disable form inputs
        const inputs = this.loginForm.querySelectorAll('input');
        inputs.forEach(input => {
            input.disabled = loading;
        });
    }

    // Redirect to partner dashboard
    redirectToDashboard() {
        const dashboardFile = 'partner-dashboard.html';
        console.log(`🔑 Redirecting to ${dashboardFile}`);
        window.location.href = dashboardFile;
    }

    // Login attempts management
    getLoginAttempts() {
        try {
            const attempts = localStorage.getItem('partnerLoginAttempts');
            return attempts ? parseInt(attempts) : 0;
        } catch {
            return 0;
        }
    }

    incrementLoginAttempts() {
        const attempts = this.getLoginAttempts() + 1;
        try {
            localStorage.setItem('partnerLoginAttempts', attempts.toString());
            localStorage.setItem('partnerLastFailedAttempt', new Date().toISOString());
        } catch (error) {
            console.error('🔑 Error storing partner login attempts:', error);
        }
    }

    clearLoginAttempts() {
        try {
            localStorage.removeItem('partnerLoginAttempts');
            localStorage.removeItem('partnerLastFailedAttempt');
            localStorage.removeItem('partnerAccountLocked');
        } catch (error) {
            console.error('🔑 Error clearing partner login attempts:', error);
        }
    }

    lockAccount() {
        try {
            localStorage.setItem('partnerAccountLocked', new Date().toISOString());
        } catch (error) {
            console.error('🔑 Error locking partner account:', error);
        }
    }

    isAccountLocked() {
        try {
            const lockedTime = localStorage.getItem('partnerAccountLocked');
            if (!lockedTime) return false;

            const lockTime = new Date(lockedTime);
            const now = new Date();
            const minutesElapsed = (now - lockTime) / (1000 * 60);

            if (minutesElapsed >= this.lockoutTime) {
                this.clearLoginAttempts();
                return false;
            }

            return true;
        } catch {
            return false;
        }
    }

    getLockoutTimeRemaining() {
        try {
            const lockedTime = localStorage.getItem('partnerAccountLocked');
            if (!lockedTime) return 0;

            const lockTime = new Date(lockedTime);
            const now = new Date();
            const minutesElapsed = (now - lockTime) / (1000 * 60);
            const remaining = Math.ceil(this.lockoutTime - minutesElapsed);

            return Math.max(0, remaining);
        } catch {
            return 0;
        }
    }

    loadLoginAttempts() {
        const attempts = this.getLoginAttempts();
        if (attempts > 0) {
            console.log(`🔑 ${attempts} previous failed partner login attempts`);
        }
    }

    logLoginAttempt(partnerId, success) {
        try {
            const logEntry = {
                partnerId: partnerId,
                success: success,
                timestamp: new Date().toISOString(),
                userAgent: navigator.userAgent.substring(0, 100)
            };

            let loginLog = JSON.parse(localStorage.getItem('partnerLoginLog') || '[]');
            loginLog.unshift(logEntry);
            loginLog = loginLog.slice(0, 10);

            localStorage.setItem('partnerLoginLog', JSON.stringify(loginLog));
        } catch (error) {
            console.error('🔑 Error logging partner login attempt:', error);
        }
    }

    // Form validation setup
    setupFormValidation() {
        const inputs = this.loginForm.querySelectorAll('input');
        inputs.forEach(input => {
            input.addEventListener('blur', () => {
                this.validateField(input);
            });
        });
    }

    validateField(field) {
        const value = field.value.trim();
        const fieldId = field.id;

        if (fieldId === 'partnerUsername') {
            if (!value) {
                this.showFieldError(fieldId, 'Partner ID is required');
            } else if (value.length < 3) {
                this.showFieldError(fieldId, 'Partner ID must be at least 3 characters');
            } else {
                this.clearFieldError(fieldId);
            }
        } else if (fieldId === 'partnerPassword') {
            if (!value) {
                this.showFieldError(fieldId, 'Password is required');
            } else if (value.length < 6) {
                this.showFieldError(fieldId, 'Password must be at least 6 characters');
            } else {
                this.clearFieldError(fieldId);
            }
        }
    }

    // Enhanced alert system
    showAlert(message, type = 'info') {
        // Remove existing alerts
        document.querySelectorAll('.partner-alert').forEach(alert => alert.remove());

        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-triangle',
            info: 'fa-info-circle',
            warning: 'fa-exclamation-circle'
        };

        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type === 'error' ? 'danger' : type} partner-alert position-fixed shadow-lg`;
        alertDiv.style.cssText = `
            top: 2rem; 
            right: 2rem; 
            z-index: 9999; 
            min-width: 350px; 
            max-width: 450px;
            border-radius: 16px;
            border: none;
            backdrop-filter: blur(10px);
            animation: slideInRight 0.4s ease;
        `;

        alertDiv.innerHTML = `
            <div class="d-flex align-items-center">
                <i class="fas ${icons[type]} me-3" style="font-size: 1.3rem;"></i>
                <div class="flex-grow-1">
                    <div style="font-weight: 600; margin-bottom: 0.25rem;">
                        Partner ${type.charAt(0).toUpperCase() + type.slice(1)}
                    </div>
                    <div style="font-size: 0.9rem;">
                        ${message}
                    </div>
                </div>
                <button type="button" class="btn-close ms-3" onclick="this.parentElement.parentElement.remove()"></button>
            </div>
        `;

        document.body.appendChild(alertDiv);

        // Auto-remove after 6 seconds
        setTimeout(() => {
            if (alertDiv.parentElement) {
                alertDiv.style.animation = 'slideOutRight 0.4s ease';
                setTimeout(() => alertDiv.remove(), 400);
            }
        }, 6000);
    }

    // Field error handling
    showFieldError(fieldId, message) {
        const field = document.getElementById(fieldId);
        const container = field?.parentElement;
        
        if (!container) return;

        // Remove existing error
        const existingError = container.querySelector('.field-error');
        existingError?.remove();

        // Add error styling
        field.style.borderColor = '#dc3545';
        field.style.boxShadow = '0 0 0 3px rgba(220, 53, 69, 0.25)';

        // Create error message
        const errorDiv = document.createElement('div');
        errorDiv.className = 'field-error text-danger small mt-1';
        errorDiv.style.cssText = `
            font-weight: 600;
            animation: slideDown 0.3s ease;
            padding-left: 1.5rem;
        `;
        errorDiv.innerHTML = `<i class="fas fa-exclamation-circle me-1"></i>${message}`;

        container.appendChild(errorDiv);
    }

    clearFieldError(fieldId) {
        const field = document.getElementById(fieldId);
        const container = field?.parentElement;
        
        if (field) {
            field.style.borderColor = '';
            field.style.boxShadow = '';
        }

        container?.querySelector('.field-error')?.remove();
    }

    clearFieldErrors() {
        document.querySelectorAll('.field-error').forEach(error => error.remove());
        document.querySelectorAll('input').forEach(input => {
            input.style.borderColor = '';
            input.style.boxShadow = '';
        });
    }

    // Add enhanced styling and animations
    addEnhancedStyling() {
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideInRight {
                from {
                    opacity: 0;
                    transform: translateX(100px);
                }
                to {
                    opacity: 1;
                    transform: translateX(0);
                }
            }
            
            @keyframes slideOutRight {
                from {
                    opacity: 1;
                    transform: translateX(0);
                }
                to {
                    opacity: 0;
                    transform: translateX(100px);
                }
            }
            
            @keyframes slideDown {
                from {
                    opacity: 0;
                    transform: translateY(-10px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            .partner-login-btn:hover:not(:disabled) {
                transform: translateY(-3px);
                box-shadow: 0 12px 30px rgba(30, 58, 138, 0.4) !important;
            }
            
            .form-floating-custom input:focus {
                transform: scale(1.02);
            }
            
            .field-error {
                animation: slideDown 0.3s ease !important;
            }
        `;
        document.head.appendChild(style);
    }

    // Get partner login statistics
    getLoginStats() {
        try {
            const loginLog = JSON.parse(localStorage.getItem('partnerLoginLog') || '[]');
            const attempts = this.getLoginAttempts();
            const isLocked = this.isAccountLocked();

            return {
                totalAttempts: loginLog.length,
                failedAttempts: attempts,
                successfulLogins: loginLog.filter(log => log.success).length,
                isAccountLocked: isLocked,
                lockoutTimeRemaining: this.getLockoutTimeRemaining(),
                recentAttempts: loginLog.slice(0, 5),
                lastSuccessfulLogin: loginLog.find(entry => entry.success)
            };
        } catch {
            return null;
        }
    }
}

// Initialize the partner login system
const partnerLogin = new PartnerLogin();

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    partnerLogin.init();
});

// Make partner login available globally
window.partnerLogin = partnerLogin;

// Override the global forgot password function
window.showForgotPassword = function() {
    partnerLogin.showAlert(`🔐 Partner Password Recovery:

For password reset requests, please contact:
📧 Email: partners@dipdrycare.com
📞 Phone: +91 9876543210
🕒 Support Hours: 9 AM - 6 PM (Mon-Sat)

Please provide your Partner ID for verification.

For immediate assistance during business hours, 
call our partner support hotline.`, 'info');
};
// Back to Website handler for partner login
(function () {
  // Configure preferred home path if needed
  // For example: const SITE_HOME = '/index.html';
  const SITE_HOME = detectHomePath();

  function detectHomePath() {
    // If current page lives under /HTMLfiles/, go one level up to reach site root
    const path = window.location.pathname;
    if (path.includes('/HTMLfiles/')) {
      return '../index.html';
    }
    // Fallbacks if your home lives at root
    return 'index.html';
  }

  function goBackToWebsite() {
    try {
      window.location.href = SITE_HOME;
    } catch (e) {
      // Final fallback to site root
      window.location.href = '/';
    }
  }

  // Attach once DOM is ready
  document.addEventListener('DOMContentLoaded', function () {
    const btn = document.getElementById('backToSiteBtn');
    if (btn) {
      btn.addEventListener('click', goBackToWebsite);
    }
  });
})();