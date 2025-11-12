// Premium Admin Authentication Module
// Enhanced authentication with better session management and security

class PremiumAdminAuth {
    constructor() {
        this.sessionKey = 'dipDryAdminSession';
        this.sessionTimeouts = {
            normal: 30,    // 30 minutes normal session
            remember: 480  // 8 hours if "remember me" is checked
        };
        this.validCredentials = {
            'admin': 'dipdry2025',
            'owner': 'dipdry2025',
            'manager': 'dipdry2025'
        };
    }

    // Check if user is authenticated
    isAuthenticated() {
        const sessionData = this.getSession();
        if (!sessionData) {
            console.log('🔐 No session found');
            return false;
        }

        try {
            const loginTime = new Date(sessionData.loginTime);
            const now = new Date();
            const timeDiffMinutes = (now - loginTime) / (1000 * 60);
            
            // Determine timeout based on remember me setting
            const timeoutLimit = sessionData.remember ? 
                this.sessionTimeouts.remember : 
                this.sessionTimeouts.normal;

            console.log(`🔐 Session check: ${timeDiffMinutes.toFixed(1)}min elapsed, limit: ${timeoutLimit}min`);

            // Check if session expired
            if (timeDiffMinutes > timeoutLimit) {
                console.log('🔐 Session expired');
                this.logout();
                return false;
            }

            console.log('🔐 Session valid');
            return true;
        } catch (error) {
            console.error('🔐 Session validation error:', error);
            this.logout();
            return false;
        }
    }

    // Validate login credentials
    validateCredentials(username, password) {
        const normalizedUsername = username.toLowerCase().trim();
        const normalizedPassword = password.trim();
        
        return this.validCredentials[normalizedUsername] === normalizedPassword;
    }

    // Create session after successful login
    createSession(username, password, rememberMe = false) {
        if (!this.validateCredentials(username, password)) {
            console.log('🔐 Invalid credentials');
            return false;
        }

        const sessionData = {
            username: username.toLowerCase().trim(),
            loginTime: new Date().toISOString(),
            remember: rememberMe,
            userAgent: navigator.userAgent.substring(0, 100), // Security check
            sessionId: this.generateSessionId()
        };

        try {
            localStorage.setItem(this.sessionKey, JSON.stringify(sessionData));
            console.log('🔐 Session created successfully', sessionData);
            return true;
        } catch (error) {
            console.error('🔐 Failed to create session:', error);
            return false;
        }
    }

    // Generate unique session ID
    generateSessionId() {
        return 'DDC' + Date.now() + Math.random().toString(36).substring(2, 9);
    }

    // Get current session data
    getSession() {
        try {
            const sessionString = localStorage.getItem(this.sessionKey);
            if (!sessionString) return null;
            
            const sessionData = JSON.parse(sessionString);
            
            // Validate session structure
            if (!sessionData.username || !sessionData.loginTime || !sessionData.sessionId) {
                console.log('🔐 Invalid session structure');
                this.logout();
                return null;
            }
            
            return sessionData;
        } catch (error) {
            console.error('🔐 Error parsing session:', error);
            this.logout();
            return null;
        }
    }

    // Update session timestamp (extend session)
    extendSession() {
        const session = this.getSession();
        if (session) {
            session.loginTime = new Date().toISOString();
            try {
                localStorage.setItem(this.sessionKey, JSON.stringify(session));
                console.log('🔐 Session extended');
            } catch (error) {
                console.error('🔐 Failed to extend session:', error);
            }
        }
    }

    // Logout and clear session
    logout() {
        try {
            localStorage.removeItem(this.sessionKey);
            console.log('🔐 Session cleared');
        } catch (error) {
            console.error('🔐 Error clearing session:', error);
        }
        
        // Redirect to login page
        this.redirectToLogin();
    }

    // Redirect to login page
    redirectToLogin() {
        // Use replace to prevent back button issues
        if (window.location.pathname.includes('admin-dashboard')) {
            window.location.replace('admin-login.html');
        }
    }

    // Require authentication (call on dashboard page load)
    requireAuth() {
        if (!this.isAuthenticated()) {
            console.log('🔐 Authentication required, redirecting to login');
            this.redirectToLogin();
            return false;
        }
        
        console.log('🔐 Authentication successful');
        return true;
    }

    // Show session timeout warning
    showTimeoutWarning() {
        const session = this.getSession();
        if (!session) return false;

        const loginTime = new Date(session.loginTime);
        const now = new Date();
        const timeDiffMinutes = (now - loginTime) / (1000 * 60);
        const timeoutLimit = session.remember ? 
            this.sessionTimeouts.remember : 
            this.sessionTimeouts.normal;
        const timeLeft = timeoutLimit - timeDiffMinutes;

        // Show warning 5 minutes before expiry
        if (timeLeft <= 5 && timeLeft > 0) {
            const extend = confirm(`⚠️ Your session will expire in ${Math.round(timeLeft)} minutes.\n\nDo you want to extend it?`);
            if (extend) {
                this.extendSession();
                this.showNotification('Session extended successfully! 🔒', 'success');
                return true;
            }
        }

        return false;
    }

    // Get user info from session
    getUserInfo() {
        const session = this.getSession();
        if (!session) return null;

        return {
            username: session.username,
            loginTime: session.loginTime,
            remember: session.remember,
            sessionId: session.sessionId
        };
    }

    // Check if user has specific role (for future use)
    hasRole(role) {
        const session = this.getSession();
        if (!session) return false;

        // For now, all users are admin, but this can be expanded
        const userRoles = {
            'admin': ['admin', 'manager', 'viewer'],
            'owner': ['admin', 'manager', 'viewer', 'owner'],
            'manager': ['manager', 'viewer']
        };

        return userRoles[session.username]?.includes(role) || false;
    }

    // Show notification (if dashboard is available)
    showNotification(message, type = 'info') {
        if (typeof premiumDashboard !== 'undefined' && premiumDashboard.showNotification) {
            premiumDashboard.showNotification(message, type);
        } else {
            console.log(`🔐 ${type.toUpperCase()}: ${message}`);
        }
    }

    // Security: Check for suspicious activity
    validateSession() {
        const session = this.getSession();
        if (!session) return false;

        // Check if user agent changed (possible session hijacking)
        const currentUserAgent = navigator.userAgent.substring(0, 100);
        if (session.userAgent && session.userAgent !== currentUserAgent) {
            console.warn('🔐 User agent mismatch - possible security issue');
            this.logout();
            return false;
        }

        return true;
    }

    // Initialize authentication system
    init() {
        console.log('🔐 Premium Admin Auth initialized');
        
        // Validate existing session on load
        this.validateSession();
        
        // Set up periodic session checks
        this.startSessionMonitoring();
    }

    // Start monitoring session health
    startSessionMonitoring() {
        // Check session every 5 minutes
        setInterval(() => {
            if (this.isAuthenticated()) {
                this.showTimeoutWarning();
            }
        }, 5 * 60 * 1000);

        // Extend session on user activity
        const activityEvents = ['click', 'keydown', 'scroll', 'mousemove'];
        let lastActivity = Date.now();
        
        const handleActivity = () => {
            const now = Date.now();
            // Only extend if 5 minutes passed since last activity
            if (now - lastActivity > 5 * 60 * 1000) {
                this.extendSession();
                lastActivity = now;
            }
        };

        activityEvents.forEach(event => {
            document.addEventListener(event, handleActivity, { passive: true });
        });
    }
}

// Initialize auth system
const premiumAdminAuth = new PremiumAdminAuth();

// Auto-initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    premiumAdminAuth.init();
    
    // Only require auth on dashboard pages
    if (window.location.pathname.includes('admin-dashboard') || 
        window.location.pathname.includes('dashboard')) {
        premiumAdminAuth.requireAuth();
    }
});

// Make auth available globally
window.premiumAdminAuth = premiumAdminAuth;