// ============================================================================
// ADMIN DASHBOARD - PRODUCTION READY 2025 (NO MOCK DATA)
// ============================================================================
// File: admin-dashboard-premium-PRODUCTION.js
// Replace your existing admin-dashboard-premium.js with this file

class ProductionAdminDashboard {
    constructor() {
        this.currentSection = 'dashboard';
        this.apiBaseUrl = window.location.origin.includes('localhost') 
            ? 'http://localhost:5000/api' 
            : '/api';
        this.authToken = localStorage.getItem('dipDryAdminToken');
        this.adminUser = null;
        this.data = {
            orders: [],
            customers: [],
            partners: [],
            stats: {},
            activities: []
        };
        this.updateIntervals = [];
        this.refreshInterval = 30000; // 30 seconds auto-refresh
    }

    // ========================================================================
    // INITIALIZATION
    // ========================================================================
    
    async init() {
        try {
            console.log('🚀 Initializing Production Admin Dashboard...');

            // Check authentication
            if (!await this.checkAuth()) {
                this.redirectToLogin();
                return;
            }

            // Load all initial data
            await this.loadAllData();

            // Setup UI components
            this.setupEventListeners();
            this.startAutoRefresh();

            console.log('✅ Dashboard initialized successfully');
            this.showNotification('Dashboard loaded successfully!', 'success');

        } catch (error) {
            console.error('❌ Dashboard initialization failed:', error);
            this.showNotification('Failed to initialize dashboard', 'error');
        }
    }

    // ========================================================================
    // AUTHENTICATION
    // ========================================================================

    async checkAuth() {
        if (!this.authToken) {
            return false;
        }

        try {
            const response = await this.apiRequest('/admin/verify', {
                method: 'GET'
            });

            if (response.success) {
                this.adminUser = response.data.admin;
                this.updateAdminInfo();
                return true;
            }
            return false;

        } catch (error) {
            console.error('Auth check failed:', error);
            return false;
        }
    }

    updateAdminInfo() {
        if (this.adminUser) {
            const nameElement = document.querySelector('.admin-name');
            const emailElement = document.querySelector('.admin-email');
            
            if (nameElement) nameElement.textContent = this.adminUser.name || 'Admin';
            if (emailElement) emailElement.textContent = this.adminUser.email || '';
        }
    }

    redirectToLogin() {
        window.location.href = '/admin-login.html';
    }

    async handleLogout() {
        try {
            await this.apiRequest('/admin/logout', { method: 'POST' });
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            localStorage.removeItem('dipDryAdminToken');
            this.redirectToLogin();
        }
    }

    // ========================================================================
    // DATA LOADING
    // ========================================================================

    async loadAllData() {
        try {
            this.showLoading(true);

            // Load all data in parallel
            await Promise.allSettled([
                this.loadStats(),
                this.loadOrders(),
                this.loadCustomers(),
                this.loadPartners(),
                this.loadActivities()
            ]);

            this.updateAllUI();

        } catch (error) {
            console.error('Failed to load data:', error);
            this.showNotification('Failed to load dashboard data', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    async loadStats() {
        try {
            const response = await this.apiRequest('/admin/stats');
            
            if (response.success) {
                this.data.stats = response.data;
                console.log('✅ Stats loaded:', this.data.stats);
            }

        } catch (error) {
            console.error('Failed to load stats:', error);
            throw error;
        }
    }

    async loadOrders(filters = {}) {
        try {
            const queryParams = new URLSearchParams({
                page: filters.page || 1,
                limit: filters.limit || 20,
                ...(filters.status && { status: filters.status }),
                ...(filters.search && { search: filters.search })
            }).toString();

            const response = await this.apiRequest(`/admin/orders?${queryParams}`);
            
            if (response.success) {
                this.data.orders = response.data.orders;
                this.data.ordersPagination = response.data.pagination;
                console.log('✅ Orders loaded:', this.data.orders.length);
            }

        } catch (error) {
            console.error('Failed to load orders:', error);
            throw error;
        }
    }

    async loadCustomers(filters = {}) {
        try {
            const queryParams = new URLSearchParams({
                page: filters.page || 1,
                limit: filters.limit || 20,
                ...(filters.search && { search: filters.search })
            }).toString();

            const response = await this.apiRequest(`/admin/customers?${queryParams}`);
            
            if (response.success) {
                this.data.customers = response.data.customers;
                this.data.customersPagination = response.data.pagination;
                console.log('✅ Customers loaded:', this.data.customers.length);
            }

        } catch (error) {
            console.error('Failed to load customers:', error);
            throw error;
        }
    }

    async loadPartners(filters = {}) {
        try {
            const queryParams = new URLSearchParams({
                page: filters.page || 1,
                limit: filters.limit || 20,
                ...(filters.status && { status: filters.status })
            }).toString();

            const response = await this.apiRequest(`/admin/partners?${queryParams}`);
            
            if (response.success) {
                this.data.partners = response.data.partners;
                this.data.partnersPagination = response.data.pagination;
                console.log('✅ Partners loaded:', this.data.partners.length);
            }

        } catch (error) {
            console.error('Failed to load partners:', error);
            throw error;
        }
    }

    async loadActivities(filters = {}) {
        try {
            const queryParams = new URLSearchParams({
                page: filters.page || 1,
                limit: filters.limit || 10
            }).toString();

            const response = await this.apiRequest(`/admin/activity?${queryParams}`);
            
            if (response.success) {
                this.data.activities = response.data.activities;
                console.log('✅ Activities loaded:', this.data.activities.length);
            }

        } catch (error) {
            console.error('Failed to load activities:', error);
            // Don't throw - activities are not critical
        }
    }

    // ========================================================================
    // API REQUEST HANDLER
    // ========================================================================

    async apiRequest(endpoint, options = {}) {
        const url = `${this.apiBaseUrl}${endpoint}`;
        
        const config = {
            method: options.method || 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.authToken}`,
                ...options.headers
            },
            ...options
        };

        if (options.body && config.method !== 'GET') {
            config.body = JSON.stringify(options.body);
        }

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                // Handle auth errors
                if (response.status === 401) {
                    this.handleLogout();
                    throw new Error('Unauthorized - please login again');
                }

                throw new Error(data.message || `API error: ${response.statusText}`);
            }

            return data;

        } catch (error) {
            console.error(`API request failed for ${endpoint}:`, error);
            throw error;
        }
    }

    // ========================================================================
    // UI UPDATE METHODS
    // ========================================================================

    updateAllUI() {
        this.updateStatsDisplay();
        this.updateOrdersTable();
        this.updateCustomersTable();
        this.updatePartnersTable();
        this.updateActivityFeed();
    }

    updateStatsDisplay() {
        const stats = this.data.stats;

        if (!stats || Object.keys(stats).length === 0) {
            console.warn('No stats data available');
            return;
        }

        // Update Today's Revenue
        this.updateElement('[data-stat="revenue-value"]', `₹${stats.todayRevenue?.toLocaleString('en-IN') || '0'}`);
        this.updateElement('[data-stat="revenue-change"]', `${stats.revenueChange >= 0 ? '+' : ''}${stats.revenueChange}%`);
        this.updateElement('[data-stat="revenue-yesterday"]', `vs ₹${stats.yesterdayRevenue?.toLocaleString('en-IN') || '0'} yesterday`);
        
        // Set color based on change
        const revenueChangeEl = document.querySelector('[data-stat="revenue-change"]');
        if (revenueChangeEl) {
            revenueChangeEl.className = stats.revenueChange >= 0 ? 'stat-change positive' : 'stat-change negative';
        }

        // Update Today's Orders
        this.updateElement('[data-stat="orders-value"]', stats.todayOrders || '0');
        this.updateElement('[data-stat="orders-change"]', `${stats.ordersChange >= 0 ? '+' : ''}${stats.ordersChange}%`);
        this.updateElement('[data-stat="orders-yesterday"]', `vs ${stats.yesterdayOrders || '0'} yesterday`);
        
        const ordersChangeEl = document.querySelector('[data-stat="orders-change"]');
        if (ordersChangeEl) {
            ordersChangeEl.className = stats.ordersChange >= 0 ? 'stat-change positive' : 'stat-change negative';
        }

        // Update Active Customers
        this.updateElement('[data-stat="customers-value"]', stats.activeCustomers?.toLocaleString('en-IN') || '0');
        this.updateElement('[data-stat="customers-new"]', `+${stats.newCustomersThisWeek || '0'} new this week`);

        // Update Average Turnaround
        this.updateElement('[data-stat="turnaround-value"]', `${stats.avgTurnaround || '0'}h`);
        
        // Update sidebar mini stats
        this.updateElement('.sidebar-revenue-value', `₹${Math.floor((stats.todayRevenue || 0) * 30 / 1000)}K`);
        this.updateElement('.sidebar-orders-value', (stats.todayOrders || 0) * 30);

        console.log('✅ Stats UI updated');
    }

    updateOrdersTable() {
        const ordersTableBody = document.getElementById('ordersTableBody');
        const allOrdersTableBody = document.getElementById('allOrdersTableBody');

        if (ordersTableBody) {
            const recentOrders = this.data.orders.slice(0, 5);
            ordersTableBody.innerHTML = this.renderOrdersRows(recentOrders);
        }

        if (allOrdersTableBody) {
            allOrdersTableBody.innerHTML = this.renderOrdersRows(this.data.orders);
        }

        console.log('✅ Orders table updated');
    }

    renderOrdersRows(orders) {
        if (!orders || orders.length === 0) {
            return '<tr><td colspan="6" style="text-align:center;padding:20px;">No orders found</td></tr>';
        }

        return orders.map(order => `
            <tr>
                <td>${order.orderId || order._id?.slice(-8)}</td>
                <td>${order.customer?.name || 'N/A'}</td>
                <td>${order.items?.[0]?.serviceType || 'Multiple Services'}</td>
                <td>₹${order.totalAmount?.toLocaleString('en-IN') || '0'}</td>
                <td><span class="status-badge status-${order.status}">${this.formatStatus(order.status)}</span></td>
                <td>
                    <button class="btn-icon" onclick="dashboard.viewOrder('${order._id}')" title="View">👁️</button>
                    <button class="btn-icon" onclick="dashboard.editOrderStatus('${order._id}')" title="Edit">✏️</button>
                </td>
            </tr>
        `).join('');
    }

    updateCustomersTable() {
        const customersTableBody = document.getElementById('customersTableBody');
        
        if (!customersTableBody) return;

        if (!this.data.customers || this.data.customers.length === 0) {
            customersTableBody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:20px;">No customers found</td></tr>';
            return;
        }

        customersTableBody.innerHTML = this.data.customers.map(customer => `
            <tr>
                <td>${customer.name || 'N/A'}</td>
                <td>${customer.email || 'N/A'}</td>
                <td>${customer.phone || 'N/A'}</td>
                <td>${customer.orderCount || 0}</td>
                <td>₹${customer.totalSpent?.toLocaleString('en-IN') || '0'}</td>
                <td>
                    <button class="btn-icon" onclick="dashboard.viewCustomer('${customer._id}')" title="View">👁️</button>
                </td>
            </tr>
        `).join('');

        console.log('✅ Customers table updated');
    }

    updatePartnersTable() {
        const partnersTableBody = document.getElementById('partnersTableBody');
        
        if (!partnersTableBody) return;

        if (!this.data.partners || this.data.partners.length === 0) {
            partnersTableBody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:20px;">No partners found</td></tr>';
            return;
        }

        partnersTableBody.innerHTML = this.data.partners.map(partner => `
            <tr>
                <td>${partner.businessName || 'N/A'}</td>
                <td>${partner.name || 'N/A'}</td>
                <td>${partner.email || 'N/A'}</td>
                <td>${partner.phone || 'N/A'}</td>
                <td><span class="status-badge status-${partner.status}">${this.formatStatus(partner.status)}</span></td>
                <td>
                    <button class="btn-icon" onclick="dashboard.viewPartner('${partner._id}')" title="View">👁️</button>
                    <button class="btn-icon" onclick="dashboard.editPartner('${partner._id}')" title="Edit">✏️</button>
                </td>
            </tr>
        `).join('');

        console.log('✅ Partners table updated');
    }

    updateActivityFeed() {
        const activityFeed = document.getElementById('activityFeed');
        
        if (!activityFeed) return;

        if (!this.data.activities || this.data.activities.length === 0) {
            activityFeed.innerHTML = '<div style="text-align:center;padding:20px;">No recent activities</div>';
            return;
        }

        activityFeed.innerHTML = this.data.activities.map(activity => {
            const timeAgo = this.getTimeAgo(new Date(activity.createdAt));
            const icon = this.getActivityIcon(activity.type);
            
            return `
                <div class="activity-item">
                    <span class="activity-icon">${icon}</span>
                    <div class="activity-content">
                        <div class="activity-description">${activity.description}</div>
                        <div class="activity-time">${timeAgo}</div>
                    </div>
                </div>
            `;
        }).join('');

        console.log('✅ Activity feed updated');
    }

    // ========================================================================
    // ORDER ACTIONS
    // ========================================================================

    async viewOrder(orderId) {
        try {
            this.showLoading(true);
            const response = await this.apiRequest(`/admin/orders/${orderId}`);
            
            if (response.success) {
                this.showOrderModal(response.data.order);
            }

        } catch (error) {
            console.error('Failed to load order:', error);
            this.showNotification('Failed to load order details', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    async editOrderStatus(orderId) {
        const newStatus = prompt('Enter new status (pending, processing, out_for_delivery, delivered, cancelled):');
        
        if (!newStatus) return;

        const validStatuses = ['pending', 'processing', 'out_for_delivery', 'delivered', 'cancelled'];
        if (!validStatuses.includes(newStatus)) {
            this.showNotification('Invalid status', 'error');
            return;
        }

        try {
            this.showLoading(true);
            
            const response = await this.apiRequest(`/admin/orders/${orderId}/status`, {
                method: 'PUT',
                body: { status: newStatus }
            });

            if (response.success) {
                this.showNotification('Order status updated successfully', 'success');
                await this.loadOrders();
                this.updateOrdersTable();
            }

        } catch (error) {
            console.error('Failed to update order status:', error);
            this.showNotification('Failed to update order status', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    // ========================================================================
    // CUSTOMER ACTIONS
    // ========================================================================

    async viewCustomer(customerId) {
        try {
            this.showLoading(true);
            const response = await this.apiRequest(`/admin/customers/${customerId}`);
            
            if (response.success) {
                this.showCustomerModal(response.data.customer, response.data.recentOrders);
            }

        } catch (error) {
            console.error('Failed to load customer:', error);
            this.showNotification('Failed to load customer details', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    // ========================================================================
    // PARTNER ACTIONS
    // ========================================================================

    async viewPartner(partnerId) {
        try {
            this.showLoading(true);
            const response = await this.apiRequest(`/admin/partners/${partnerId}`);
            
            if (response.success) {
                this.showPartnerModal(response.data.partner);
            }

        } catch (error) {
            console.error('Failed to load partner:', error);
            this.showNotification('Failed to load partner details', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    async editPartner(partnerId) {
        // Implementation for partner edit modal
        console.log('Edit partner:', partnerId);
        this.showNotification('Partner edit feature coming soon', 'info');
    }

    // ========================================================================
    // UI HELPERS
    // ========================================================================

    updateElement(selector, content) {
        const element = document.querySelector(selector);
        if (element) {
            element.textContent = content;
        }
    }

    formatStatus(status) {
        const statusMap = {
            'pending': 'Pending',
            'processing': 'Processing',
            'out_for_delivery': 'Out for Delivery',
            'delivered': 'Delivered',
            'cancelled': 'Cancelled',
            'active': 'Active',
            'inactive': 'Inactive'
        };
        return statusMap[status] || status;
    }

    getActivityIcon(type) {
        const iconMap = {
            'admin': '👤',
            'order': '📦',
            'customer': '👥',
            'partner': '🤝',
            'system': '⚙️'
        };
        return iconMap[type] || '📌';
    }

    getTimeAgo(date) {
        const seconds = Math.floor((new Date() - date) / 1000);
        
        const intervals = {
            year: 31536000,
            month: 2592000,
            week: 604800,
            day: 86400,
            hour: 3600,
            minute: 60
        };

        for (const [unit, secondsInUnit] of Object.entries(intervals)) {
            const interval = Math.floor(seconds / secondsInUnit);
            if (interval >= 1) {
                return `${interval} ${unit}${interval > 1 ? 's' : ''} ago`;
            }
        }

        return 'Just now';
    }

    showLoading(show) {
        let loader = document.getElementById('globalLoader');
        
        if (!loader) {
            loader = document.createElement('div');
            loader.id = 'globalLoader';
            loader.className = 'global-loader';
            loader.innerHTML = '<div class="spinner"></div>';
            document.body.appendChild(loader);
        }

        loader.style.display = show ? 'flex' : 'none';
    }

    showNotification(message, type = 'info') {
        console.log(`[${type.toUpperCase()}]`, message);
        
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);

        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // ========================================================================
    // AUTO REFRESH
    // ========================================================================

    startAutoRefresh() {
        // Clear any existing intervals
        this.updateIntervals.forEach(interval => clearInterval(interval));
        this.updateIntervals = [];

        // Stats refresh every 30 seconds
        const statsInterval = setInterval(() => {
            console.log('🔄 Auto-refreshing stats...');
            this.loadStats().then(() => this.updateStatsDisplay());
        }, this.refreshInterval);

        // Orders refresh every 30 seconds
        const ordersInterval = setInterval(() => {
            console.log('🔄 Auto-refreshing orders...');
            this.loadOrders().then(() => this.updateOrdersTable());
        }, this.refreshInterval);

        this.updateIntervals.push(statsInterval, ordersInterval);
        
        console.log('✅ Auto-refresh enabled (30s interval)');
    }

    // ========================================================================
    // EVENT LISTENERS
    // ========================================================================

    setupEventListeners() {
        // Logout button
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.handleLogout());
        }

        // Refresh button
        const refreshBtn = document.getElementById('refreshBtn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.loadAllData());
        }

        // Section navigation
        document.querySelectorAll('[data-section]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const section = e.target.dataset.section;
                this.switchSection(section);
            });
        });

        console.log('✅ Event listeners setup complete');
    }

    switchSection(section) {
        this.currentSection = section;
        
        // Hide all sections
        document.querySelectorAll('.dashboard-section').forEach(el => {
            el.style.display = 'none';
        });

        // Show selected section
        const selectedSection = document.getElementById(`${section}Section`);
        if (selectedSection) {
            selectedSection.style.display = 'block';
        }

        // Update nav active state
        document.querySelectorAll('[data-section]').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-section="${section}"]`)?.classList.add('active');
    }

    showOrderModal(order) {
        alert(`Order Details:\nID: ${order.orderId}\nCustomer: ${order.customer.name}\nAmount: ₹${order.totalAmount}\nStatus: ${order.status}`);
    }

    showCustomerModal(customer, orders) {
        alert(`Customer Details:\nName: ${customer.name}\nEmail: ${customer.email}\nPhone: ${customer.phone}\nTotal Orders: ${customer.orderCount}\nTotal Spent: ₹${customer.totalSpent}`);
    }

    showPartnerModal(partner) {
        alert(`Partner Details:\nBusiness: ${partner.businessName}\nName: ${partner.name}\nEmail: ${partner.email}\nStatus: ${partner.status}`);
    }
}

// ============================================================================
// INITIALIZE DASHBOARD ON PAGE LOAD
// ============================================================================

let dashboard;

document.addEventListener('DOMContentLoaded', () => {
    console.log('🎯 DOM loaded - initializing dashboard...');
    dashboard = new ProductionAdminDashboard();
    dashboard.init();
});

// Make dashboard globally accessible
window.dashboard = dashboard;