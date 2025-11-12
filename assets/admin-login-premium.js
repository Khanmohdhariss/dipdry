// Premium Admin Login JavaScript for Dip Dry Care
// Enhanced version specifically designed for your admin-login.html page

class DipDryAdminLogin {
    constructor() {
        this.sessionKey = 'dipDryAdminSession';
        this.maxAttempts = 5;
        this.lockoutTime = 15; // minutes
        this.isLoading = false;
        this.loginForm = null;
        
        // Valid credentials for Dip Dry Care
        this.validCredentials = {
            'admin': 'dipdry2025',
            'owner': 'dipdry2025',
            'manager': 'dipdry2025',
            'administrator': 'dipdry2025'
        };
    }

    // Initialize the login system
    init() {
        this.loginForm = document.getElementById('adminLoginForm');
        if (!this.loginForm) {
            console.error('🔑 Admin login form not found');
            return;
        }

        this.setupEventListeners();
        this.checkExistingSession();
        this.setupFormValidation();
        this.loadLoginAttempts();
        this.addEnhancedStyling();
        
        console.log('🔑 Dip Dry Admin Login initialized');
    }

    // Setup all event listeners
    setupEventListeners() {
        // Form submission
        this.loginForm.addEventListener('submit', (e) => this.handleLogin(e));

        // Input field events
        const usernameField = document.getElementById('adminUsername');
        const passwordField = document.getElementById('adminPassword');

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

        // Auto-focus username field after a delay
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

    // Check if user already has a valid session
    checkExistingSession() {
        try {
            const sessionString = localStorage.getItem(this.sessionKey);
            if (!sessionString) return;

            const sessionData = JSON.parse(sessionString);
            const loginTime = new Date(sessionData.loginTime);
            const now = new Date();
            const timeDiffMinutes = (now - loginTime) / (1000 * 60);

            // Check session validity (30 minutes normal, 8 hours if remember me)
            const timeoutLimit = sessionData.remember ? 480 : 30;

            if (timeDiffMinutes < timeoutLimit) {
                console.log('🔑 Valid session found, redirecting to dashboard');
                this.showAlert('You have an active session. Redirecting to dashboard...', 'success');
                setTimeout(() => {
                    this.redirectToDashboard();
                }, 2000);
            } else {
                // Clear expired session
                localStorage.removeItem(this.sessionKey);
            }
        } catch (error) {
            console.error('🔑 Error checking session:', error);
            localStorage.removeItem(this.sessionKey);
        }
    }

    // Handle form submission
    async handleLogin(event) {
        event.preventDefault();
        
        if (this.isLoading) return;

        // Get form values
        const username = this.loginForm.username.value.trim().toLowerCase();
        const password = this.loginForm.password.value.trim();
        const remember = this.loginForm.remember.checked;

        // Validate inputs
        if (!this.validateInputs(username, password)) {
            return;
        }

        // Check if account is locked
        if (this.isAccountLocked()) {
            const timeRemaining = this.getLockoutTimeRemaining();
            this.showAlert(`Account locked due to multiple failed attempts. Try again in ${timeRemaining} minutes.`, 'error');
            return;
        }

        // Show loading state
        this.setLoadingState(true);

        try {
            // Simulate network delay for better UX
            await new Promise(resolve => setTimeout(resolve, 1200));

            // Validate credentials
            if (this.validateCredentials(username, password)) {
                this.handleLoginSuccess(username, remember);
            } else {
                this.handleLoginFailure();
            }
        } catch (error) {
            console.error('🔑 Login error:', error);
            this.showAlert('An unexpected error occurred. Please try again.', 'error');
            this.setLoadingState(false);
        }
    }

    // Validate form inputs
    validateInputs(username, password) {
        this.clearFieldErrors();
        let isValid = true;

        if (!username) {
            this.showFieldError('adminUsername', 'Username is required');
            isValid = false;
        } else if (username.length < 3) {
            this.showFieldError('adminUsername', 'Username must be at least 3 characters');
            isValid = false;
        }

        if (!password) {
            this.showFieldError('adminPassword', 'Password is required');
            isValid = false;
        } else if (password.length < 6) {
            this.showFieldError('adminPassword', 'Password must be at least 6 characters');
            isValid = false;
        }

        return isValid;
    }

    // Validate login credentials
    validateCredentials(username, password) {
        return this.validCredentials[username] === password;
    }

    // Handle successful login
    handleLoginSuccess(username, remember) {
        console.log('🔑 Login successful for:', username);

        // Clear failed attempts
        this.clearLoginAttempts();

        // Create session - ALWAYS save session, not just with remember me
        const sessionData = {
            username: username,
            loginTime: new Date().toISOString(),
            remember: remember,
            sessionId: this.generateSessionId(),
            userAgent: navigator.userAgent.substring(0, 100)
        };

        try {
            localStorage.setItem(this.sessionKey, JSON.stringify(sessionData));
            console.log('🔑 Session created:', sessionData);
        } catch (error) {
            console.error('🔑 Failed to save session:', error);
        }

        // Log successful login
        this.logLoginAttempt(username, true);

        // Show success message
        this.showAlert(`Welcome back, ${username.charAt(0).toUpperCase() + username.slice(1)}! 🎉 Redirecting to dashboard...`, 'success');

        // Redirect to dashboard
        setTimeout(() => {
            this.redirectToDashboard();
        }, 1800);
    }

    // Handle failed login
    handleLoginFailure() {
        console.log('🔑 Login failed');

        // Increment failed attempts
        this.incrementLoginAttempts();
        
        // Get attempt count
        const attempts = this.getLoginAttempts();
        const remaining = this.maxAttempts - attempts;

        // Log failed attempt
        this.logLoginAttempt(this.loginForm.username.value.trim(), false);

        // Show error message
        if (remaining > 0) {
            this.showAlert(`❌ Invalid credentials. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining before account lockout.`, 'error');
            this.showFieldError('adminPassword', 'Incorrect password');
        } else {
            this.lockAccount();
            this.showAlert(`🔒 Account locked for ${this.lockoutTime} minutes due to multiple failed attempts.`, 'error');
        }

        // Clear password field and focus
        this.loginForm.password.value = '';
        setTimeout(() => {
            document.getElementById('adminPassword')?.focus();
        }, 100);

        this.setLoadingState(false);
    }

    // Set loading state
    setLoadingState(loading) {
        this.isLoading = loading;
        
        const loginBtn = this.loginForm.querySelector('.login-btn');
        const spinner = loginBtn?.querySelector('.loading-spinner');
        const btnText = loginBtn?.querySelector('.btn-text');

        if (loginBtn) {
            loginBtn.disabled = loading;
            if (loading) {
                loginBtn.classList.add('loading');
            } else {
                loginBtn.classList.remove('loading');
            }
        }

        if (btnText) {
            btnText.innerHTML = loading ? 
                '<i class="fas fa-spinner fa-spin me-2"></i>Authenticating...' : 
                '<i class="fas fa-sign-in-alt me-2"></i>Access Admin Dashboard';
        }

        // Disable form inputs
        const inputs = this.loginForm.querySelectorAll('input');
        inputs.forEach(input => {
            input.disabled = loading;
        });
    }

    // Redirect to dashboard
    redirectToDashboard() {
        // Use the correct dashboard filename - update this to match your dashboard file
        const dashboardFile = 'admin-dashboard-premium.html'; // Change this if your file name is different
        
        console.log(`🔑 Redirecting to ${dashboardFile}`);
        window.location.href = dashboardFile;
    }

    // Generate unique session ID
    generateSessionId() {
        return 'DDC' + Date.now() + Math.random().toString(36).substring(2, 9);
    }

    // Login attempts management
    getLoginAttempts() {
        try {
            return parseInt(localStorage.getItem('adminLoginAttempts') || '0');
        } catch {
            return 0;
        }
    }

    incrementLoginAttempts() {
        const attempts = this.getLoginAttempts() + 1;
        try {
            localStorage.setItem('adminLoginAttempts', attempts.toString());
            localStorage.setItem('adminLastFailedAttempt', new Date().toISOString());
        } catch (error) {
            console.error('🔑 Error storing login attempts:', error);
        }
    }

    clearLoginAttempts() {
        try {
            localStorage.removeItem('adminLoginAttempts');
            localStorage.removeItem('adminLastFailedAttempt');
            localStorage.removeItem('adminAccountLocked');
        } catch (error) {
            console.error('🔑 Error clearing login attempts:', error);
        }
    }

    lockAccount() {
        try {
            localStorage.setItem('adminAccountLocked', new Date().toISOString());
        } catch (error) {
            console.error('🔑 Error locking account:', error);
        }
    }

    isAccountLocked() {
        try {
            const lockedTime = localStorage.getItem('adminAccountLocked');
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
            const lockedTime = localStorage.getItem('adminAccountLocked');
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
            console.log(`🔑 Previous failed attempts: ${attempts}`);
        }
    }

    logLoginAttempt(username, success) {
        try {
            const logEntry = {
                username: username,
                success: success,
                timestamp: new Date().toISOString(),
                userAgent: navigator.userAgent.substring(0, 100),
                ip: 'N/A' // Would need server-side to get real IP
            };

            let loginLog = JSON.parse(localStorage.getItem('adminLoginLog') || '[]');
            loginLog.unshift(logEntry);
            loginLog = loginLog.slice(0, 20); // Keep last 20 attempts

            localStorage.setItem('adminLoginLog', JSON.stringify(loginLog));
        } catch (error) {
            console.error('🔑 Error logging login attempt:', error);
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

        if (fieldId === 'adminUsername') {
            if (!value) {
                this.showFieldError(fieldId, 'Username is required');
            } else if (value.length < 3) {
                this.showFieldError(fieldId, 'Username must be at least 3 characters');
            } else {
                this.clearFieldError(fieldId);
            }
        } else if (fieldId === 'adminPassword') {
            if (!value) {
                this.showFieldError(fieldId, 'Password is required');
            } else if (value.length < 6) {
                this.showFieldError(fieldId, 'Password must be at least 6 characters');
            } else {
                this.clearFieldError(fieldId);
            }
        }
    }

    // Enhanced alert system (compatible with your existing showAlert function)
    showAlert(message, type = 'info') {
        // Remove existing alerts
        document.querySelectorAll('.custom-alert').forEach(alert => alert.remove());

        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-triangle',
            info: 'fa-info-circle',
            warning: 'fa-exclamation-circle'
        };

        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type === 'error' ? 'danger' : type} custom-alert position-fixed shadow-lg`;
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
                        ${type.charAt(0).toUpperCase() + type.slice(1)}
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
            padding-left: 1rem;
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
            
            .login-btn {
                transition: all 0.3s ease !important;
            }
            
            .login-btn:hover:not(:disabled) {
                transform: translateY(-3px);
                box-shadow: 0 8px 25px rgba(30, 58, 138, 0.4) !important;
            }
            
            .login-btn.loading {
                opacity: 0.8;
                cursor: not-allowed;
            }
            
            .form-floating-custom input:focus {
                transform: scale(1.02);
            }
            
            .field-error {
                animation: slideDown 0.3s ease !important;
            }
            
            .loading-spinner {
                animation: spin 1s linear infinite;
            }
            
            @keyframes spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);
    }

    // Get login statistics (for debugging)
    getLoginStats() {
        try {
            const loginLog = JSON.parse(localStorage.getItem('adminLoginLog') || '[]');
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

    // Clean up expired data
    cleanupExpiredData() {
        try {
            // Clean up old login logs (keep only last 30 days)
            const loginLog = JSON.parse(localStorage.getItem('adminLoginLog') || '[]');
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            const cleanedLog = loginLog.filter(entry => 
                new Date(entry.timestamp) > thirtyDaysAgo
            );

            localStorage.setItem('adminLoginLog', JSON.stringify(cleanedLog));
        } catch (error) {
            console.error('🔑 Error cleaning up expired data:', error);
        }
    }
}

// Initialize the login system
const dipDryAdminLogin = new DipDryAdminLogin();

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    dipDryAdminLogin.init();
});

// Make login available globally for debugging
window.dipDryAdminLogin = dipDryAdminLogin;

// Override the global handleAdminLogin function to use our enhanced version
window.handleAdminLogin = function(event) {
    dipDryAdminLogin.handleLogin(event);
};

// Override the global showForgotPassword function
window.showForgotPassword = function() {
    dipDryAdminLogin.showAlert(`🔐 Password Recovery:\n\nPlease contact your IT administrator or business owner for password recovery.\n\nFor immediate assistance:\n📧 Email: support@dipdrycare.com\n📞 Phone: +91 9876543210`, 'info');
};

// Clean up expired data on load
document.addEventListener('DOMContentLoaded', function() {
    dipDryAdminLogin.cleanupExpiredData();
});