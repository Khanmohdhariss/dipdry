// Partner Authentication Module for Dip Dry Care
// Secure authentication system for laundry partners and vendors

class PartnerAuth {
    constructor() {
        this.sessionKey = 'dipDryPartnerSession';
        this.sessionTimeouts = {
            normal: 60,    // 1 hour normal session
            remember: 720  // 12 hours if "remember me" is checked
        };
        
        // Valid partner credentials - Partner ID: Password
        this.validPartners = {
            // Laundry Partners
            'clean001': 'clean123',
            'fresh002': 'fresh123', 
            'quick003': 'quick123',
            'premium004': 'premium123',
            'express005': 'express123',
            'sparkle006': 'sparkle123',
            
            // Demo Partners for testing
            'partner': 'partner123',
            'vendor': 'vendor123',
            'laundry': 'laundry123'
        };
        
        // Partner information database
        this.partnerInfo = {
            'clean001': { name: 'Clean Master Laundry', type: 'Laundry Service', location: 'Dwarka', rating: 4.8, status: 'active' },
            'fresh002': { name: 'Fresh Care Services', type: 'Dry Cleaning', location: 'Green Park', rating: 4.9, status: 'active' },
            'quick003': { name: 'Quick Wash Pro', type: 'Express Service', location: 'Lajpat Nagar', rating: 4.7, status: 'active' },
            'premium004': { name: 'Premium Dry Cleaners', type: 'Premium Service', location: 'Saket', rating: 4.8, status: 'active' },
            'express005': { name: 'Express Laundry Hub', type: 'Express Service', location: 'CP', rating: 4.6, status: 'active' },
            'sparkle006': { name: 'Sparkle Clean Co', type: 'All Services', location: 'Rohini', rating: 4.7, status: 'active' },
            'partner': { name: 'Demo Partner', type: 'Demo Service', location: 'Demo Area', rating: 4.5, status: 'active' },
            'vendor': { name: 'Demo Vendor', type: 'Supply Vendor', location: 'Demo Location', rating: 4.0, status: 'active' },
            'laundry': { name: 'Demo Laundry', type: 'Laundry Service', location: 'Demo City', rating: 4.2, status: 'active' }
        };
    }

    // Check if partner is authenticated
    isAuthenticated() {
        const sessionData = this.getSession();
        if (!sessionData) {
            console.log('🔐 No partner session found');
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

            console.log(`🔐 Partner session check: ${timeDiffMinutes.toFixed(1)}min elapsed, limit: ${timeoutLimit}min`);

            // Check if session expired
            if (timeDiffMinutes > timeoutLimit) {
                console.log('🔐 Partner session expired');
                this.logout();
                return false;
            }

            console.log('🔐 Partner session valid');
            return true;
        } catch (error) {
            console.error('🔐 Partner session validation error:', error);
            this.logout();
            return false;
        }
    }

    // Validate partner credentials
    validateCredentials(partnerId, password) {
        console.log('🔐 Validating partner credentials');
        
        // Use ALL defined partners for local validation
        const normalizedPartnerId = partnerId.toLowerCase().trim();
        const normalizedPassword = password.trim();
        
        // Check against ALL valid partners defined in constructor
        if (this.validPartners[normalizedPartnerId] === normalizedPassword) {
            console.log('🔐 Local validation successful');
            return true;
        }
        
        console.log('🔐 Local validation failed');
        return false;
    }

    // Create partner session
    async createSession(partnerId, password, rememberMe = false) {
        // Validate credentials using local validation first
        const isValid = this.validateCredentials(partnerId, password);
        
        if (!isValid) {
            console.log('🔐 Invalid partner credentials');
            return false;
        }

        // Get partner info from local database (not API)
        const normalizedPartnerId = partnerId.toLowerCase().trim();
        const partnerInfo = this.partnerInfo[normalizedPartnerId];
        
        if (!partnerInfo) {
            console.log('🔐 Partner info not found');
            return false;
        }

        const sessionData = {
            partnerId: normalizedPartnerId,
            partnerName: partnerInfo.name,
            partnerType: partnerInfo.type,
            partnerLocation: partnerInfo.location,
            partnerRating: partnerInfo.rating,
            partnerStatus: partnerInfo.status,
            loginTime: new Date().toISOString(),
            remember: rememberMe,
            userAgent: navigator.userAgent.substring(0, 100),
            sessionId: this.generateSessionId()
        };

        try {
            localStorage.setItem(this.sessionKey, JSON.stringify(sessionData));
            console.log('🔐 Partner session created successfully');
            return true;
        } catch (error) {
            console.error('🔐 Failed to create partner session:', error);
            return false;
        }
    }

    // API validation method (for future use)
    async validateViaAPI(partnerId, password) {
        try {
            const response = await fetch('/api/auth/partner/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    partnerId: partnerId.trim(),
                    password: password.trim()
                })
            });

            if (!response.ok) {
                throw new Error('Authentication failed');
            }

            const data = await response.json();
            return data.success;
        } catch (error) {
            console.error('🔐 API authentication failed:', error);
            return false;
        }
    }

    // Get partner info from API (for future use)
    async getPartnerInfoFromAPI(partnerId) {
        try {
            // For now, use local partner info instead of API call
            const normalizedPartnerId = partnerId.toLowerCase().trim();
            return this.partnerInfo[normalizedPartnerId] || null;
        } catch (error) {
            console.error('🔐 Failed to fetch partner info:', error);
            return this.partnerInfo[partnerId.toLowerCase()] || null;
        }
    }

    // Generate unique session ID
    generateSessionId() {
        return 'PARTNER' + Date.now() + Math.random().toString(36).substring(2, 9);
    }

    // Get current session data
    getSession() {
        try {
            const sessionString = localStorage.getItem(this.sessionKey);
            if (!sessionString) return null;
            
            const sessionData = JSON.parse(sessionString);
            
            // Validate session structure
            if (!sessionData.partnerId || !sessionData.loginTime || !sessionData.sessionId) {
                console.log('🔐 Invalid partner session structure');
                this.logout();
                return null;
            }
            
            return sessionData;
        } catch (error) {
            console.error('🔐 Error parsing partner session:', error);
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
                console.log('🔐 Partner session extended');
            } catch (error) {
                console.error('🔐 Failed to extend partner session:', error);
            }
        }
    }

    // Logout and clear session
    logout() {
        try {
            localStorage.removeItem(this.sessionKey);
            console.log('🔐 Partner session cleared');
        } catch (error) {
            console.error('🔐 Error clearing partner session:', error);
        }
        
        // Redirect to login page
        this.redirectToLogin();
    }

    // Redirect to login page
    redirectToLogin() {
        if (window.location.pathname.includes('partner-dashboard')) {
            window.location.replace('partner-login.html');
        }
    }

    // Require authentication (call on dashboard page load)
    requireAuth() {
        if (!this.isAuthenticated()) {
            console.log('🔐 Partner authentication required, redirecting to login');
            this.redirectToLogin();
            return false;
        }
        
        console.log('🔐 Partner authentication successful');
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

        // Show warning 10 minutes before expiry
        if (timeLeft <= 10 && timeLeft > 0) {
            const extend = confirm(`⚠️ Your partner session will expire in ${Math.round(timeLeft)} minutes.\n\nDo you want to extend it?`);
            if (extend) {
                this.extendSession();
                this.showNotification('Partner session extended successfully! 🔒', 'success');
                return true;
            }
        }

        return false;
    }

    // Get partner info from session
    getPartnerInfo() {
        const session = this.getSession();
        if (!session) return null;

        return {
            partnerId: session.partnerId,
            partnerName: session.partnerName,
            partnerType: session.partnerType,
            partnerLocation: session.partnerLocation,
            partnerRating: session.partnerRating,
            partnerStatus: session.partnerStatus,
            loginTime: session.loginTime,
            remember: session.remember,
            sessionId: session.sessionId
        };
    }

    // Check if partner has specific permissions
    hasPermission(permission) {
        const session = this.getSession();
        if (!session) return false;

        // Define permissions for different partner types
        const permissions = {
            'Laundry Service': ['view_orders', 'update_status', 'manage_capacity', 'view_payments'],
            'Dry Cleaning': ['view_orders', 'update_status', 'manage_capacity', 'view_payments', 'special_items'],
            'Express Service': ['view_orders', 'update_status', 'manage_capacity', 'view_payments', 'priority_handling'],
            'Premium Service': ['view_orders', 'update_status', 'manage_capacity', 'view_payments', 'special_items', 'premium_support'],
            'All Services': ['view_orders', 'update_status', 'manage_capacity', 'view_payments', 'special_items', 'priority_handling'],
            'Supply Vendor': ['view_inventory', 'manage_supplies', 'view_orders', 'delivery_tracking'],
            'Demo Service': ['view_orders', 'update_status'] // Limited permissions for demo
        };

        const partnerPermissions = permissions[session.partnerType] || [];
        return partnerPermissions.includes(permission);
    }

    // Show notification (if dashboard is available)
    showNotification(message, type = 'info') {
        if (typeof partnerDashboard !== 'undefined' && partnerDashboard.showNotification) {
            partnerDashboard.showNotification(message, type);
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
            console.warn('🔐 Partner user agent mismatch - possible security issue');
            this.logout();
            return false;
        }

        return true;
    }

    // Initialize authentication system
    init() {
        console.log('🔐 Partner Authentication initialized');
        
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
            // Only extend if 10 minutes passed since last activity
            if (now - lastActivity > 10 * 60 * 1000) {
                this.extendSession();
                lastActivity = now;
            }
        };

        activityEvents.forEach(event => {
            document.addEventListener(event, handleActivity, { passive: true });
        });
    }

    // Get partner statistics
    getPartnerStats() {
        const session = this.getSession();
        if (!session) return null;

        // Mock stats based on partner type
        const baseStats = {
            totalOrders: Math.floor(Math.random() * 500) + 100,
            completedOrders: Math.floor(Math.random() * 400) + 80,
            pendingOrders: Math.floor(Math.random() * 50) + 5,
            monthlyRevenue: Math.floor(Math.random() * 200000) + 50000,
            customerRating: session.partnerRating,
            onTimeDelivery: Math.floor(Math.random() * 20) + 80
        };

        return baseStats;
    }

    // Get all valid partner credentials (for testing purposes)
    getAllPartners() {
        return Object.keys(this.validPartners).map(partnerId => ({
            partnerId: partnerId,
            password: this.validPartners[partnerId],
            info: this.partnerInfo[partnerId]
        }));
    }
}

// Initialize partner auth system
const partnerAuth = new PartnerAuth();

// Auto-initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    partnerAuth.init();
    
    // Only require auth on dashboard pages
    if (window.location.pathname.includes('partner-dashboard') || 
        window.location.pathname.includes('vendor-dashboard')) {
        partnerAuth.requireAuth();
    }
});

// Make auth available globally
window.partnerAuth = partnerAuth;