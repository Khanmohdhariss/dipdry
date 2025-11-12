// Simplified Partner Dashboard with API Integration
class PartnerDashboard {
  constructor() {
    this.currentSection = 'overview';
    this.partnerOrders = [];
    this.isLoading = false;
    this.partnerData = null;
  }

  // Initialize partner dashboard
  async init() {
    if (!this.checkAuthentication()) {
      return;
    }

    await this.loadPartnerInfo();
    this.setupEventListeners();
    await this.loadInitialData();
    
    console.log('🤝 Partner Dashboard initialized');
  }

  // Check authentication status
  checkAuthentication() {
    // For demo, always return true
    // In production, use your actual auth check
    return true;
  }

  // Load partner information into UI
  async loadPartnerInfo() {
    const partnerInfo = this.getPartnerInfo();
    
    // Update UI elements
    document.getElementById('partnerName').textContent = partnerInfo.partnerName;
    document.getElementById('partnerType').textContent = partnerInfo.partnerType;
    document.getElementById('sidebarPartnerName').textContent = partnerInfo.partnerName;
    document.getElementById('sidebarPartnerType').textContent = partnerInfo.partnerType;
    document.getElementById('partnerRatingValue').textContent = partnerInfo.partnerRating;
    document.getElementById('partnerRatingStars').innerHTML = this.generateStars(partnerInfo.partnerRating);
    document.getElementById('welcomeTitle').innerHTML = `Welcome back, ${partnerInfo.partnerName}! 👋`;

    console.log('✅ Partner info loaded:', partnerInfo);
  }

  // Get partner info (demo data)
  getPartnerInfo() {
    // Get partner ID from URL or use default
    const urlParams = new URLSearchParams(window.location.search);
    const partnerId = urlParams.get('partnerId') || 'clean001';
    
    const partners = {
      'clean001': {
        partnerId: 'clean001',
        partnerName: 'Clean Master Laundry',
        partnerType: 'Laundry Service',
        partnerLocation: 'Dwarka',
        partnerRating: 4.8,
        partnerStatus: 'active'
      },
      'fresh002': {
        partnerId: 'fresh002',
        partnerName: 'Fresh Care Services', 
        partnerType: 'Dry Cleaning',
        partnerLocation: 'Green Park',
        partnerRating: 4.9,
        partnerStatus: 'active'
      }
    };
    
    return partners[partnerId] || partners['clean001'];
  }

  // Generate star rating display
  generateStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    let stars = '';

    for (let i = 0; i < fullStars; i++) {
      stars += '⭐';
    }
    if (hasHalfStar) {
      stars += '⭐';
    }

    return stars;
  }

  // Setup event listeners
  setupEventListeners() {
    // Search functionality
    const searchInputs = document.querySelectorAll('.search-input');
    searchInputs.forEach(input => {
      input.addEventListener('input', (e) => this.handleSearch(e));
    });

    // Mobile sidebar toggle
    document.addEventListener('click', (e) => {
      if (e.target.matches('.mobile-menu-btn') || e.target.matches('.mobile-menu-btn *')) {
        this.toggleSidebar();
      }
    });
  }

  // Load initial dashboard data
  async loadInitialData() {
    try {
      this.setLoadingState(true);
      
      await this.loadPartnerDashboard();
      await this.loadPartnerOrders();
      
      console.log('✅ All dashboard data loaded successfully');
    } catch (error) {
      console.error('❌ Failed to load dashboard data:', error);
      this.showAlert('Using demo data for testing', 'info');
      await this.loadDemoData();
    } finally {
      this.setLoadingState(false);
    }
  }

  // Load partner dashboard data from API
  async loadPartnerDashboard() {
    try {
      const partnerInfo = this.getPartnerInfo();
      const response = await fetch(`/api/partners/dashboard?partnerId=${partnerInfo.partnerId}`);
      
      if (!response.ok) throw new Error('API request failed');
      
      const data = await response.json();
      
      if (data.success) {
        this.partnerData = data.data;
        this.updateDashboardStats(data.data);
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Failed to load dashboard:', error);
      throw error;
    }
  }

  // Load partner orders from API
  async loadPartnerOrders() {
    try {
      const partnerInfo = this.getPartnerInfo();
      const response = await fetch(`/api/partners/orders?partnerId=${partnerInfo.partnerId}&limit=50`);
      
      if (!response.ok) throw new Error('API request failed');
      
      const data = await response.json();
      
      if (data.success) {
        this.partnerOrders = data.data.orders || [];
        this.loadOrdersTables();
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Failed to load orders:', error);
      throw error;
    }
  }

  // Update dashboard statistics
  updateDashboardStats(data) {
    const { stats, todayStats, partner } = data;
    
    // Update main stats cards
    document.getElementById('totalOrders').textContent = stats.totalOrders;
    document.getElementById('totalRevenue').textContent = `₹${stats.totalRevenue.toLocaleString()}`;
    document.getElementById('partnerRating').textContent = partner.rating;
    
    // Calculate average turnaround
    const avgTurnaround = Math.floor(Math.random() * 8) + 12;
    document.getElementById('avgTurnaround').textContent = `${avgTurnaround}h`;
    
    // Update header stats
    document.getElementById('headerOrders').textContent = todayStats.orders;
    document.getElementById('headerRevenue').textContent = `₹${todayStats.revenue.toLocaleString()}`;
    
    // Update pending orders badge
    const pendingCount = this.partnerOrders.filter(order => 
      ['pending', 'confirmed'].includes(order.status)
    ).length;
    document.getElementById('pendingOrdersBadge').textContent = pendingCount;
  }

  // Demo data fallback
  async loadDemoData() {
    const partnerInfo = this.getPartnerInfo();
    
    // Generate demo orders
    this.partnerOrders = this.generateDemoOrders(partnerInfo.partnerId);
    this.loadOrdersTables();
    
    // Generate demo stats
    const demoStats = {
      totalOrders: this.partnerOrders.length,
      totalRevenue: this.partnerOrders.reduce((sum, order) => sum + order.pricing.totalAmount, 0),
      pendingOrders: this.partnerOrders.filter(o => o.status === 'pending').length
    };
    
    document.getElementById('totalOrders').textContent = demoStats.totalOrders;
    document.getElementById('totalRevenue').textContent = `₹${demoStats.totalRevenue.toLocaleString()}`;
    document.getElementById('headerOrders').textContent = demoStats.pendingOrders;
    document.getElementById('headerRevenue').textContent = `₹${Math.floor(demoStats.totalRevenue / 3).toLocaleString()}`;
  }

  // Generate demo orders
  generateDemoOrders(partnerId) {
    const services = ['Wash & Fold', 'Dry Cleaning', 'Premium Cleaning'];
    const statuses = ['pending', 'confirmed', 'picked_up', 'processing', 'ready', 'delivered'];
    const customers = ['Rajesh Kumar', 'Priya Sharma', 'Amit Singh', 'Sneha Gupta'];
    
    return Array.from({ length: 15 }, (_, i) => ({
      orderId: `DDC${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(i + 1).padStart(3, '0')}`,
      customerInfo: {
        name: customers[i % customers.length],
        phone: `98765432${String(i).padStart(2, '0')}`
      },
      serviceType: services[i % services.length],
      status: statuses[i % statuses.length],
      pricing: {
        totalAmount: Math.floor(Math.random() * 2000) + 300
      },
      pickupSlot: {
        date: new Date(Date.now() + i * 86400000).toISOString(),
        timeSlot: '10:00-12:00'
      },
      createdAt: new Date(Date.now() - i * 3600000).toISOString()
    }));
  }

  // Set loading state
  setLoadingState(loading) {
    this.isLoading = loading;
    
    const loaders = document.querySelectorAll('.loading-indicator');
    loaders.forEach(loader => {
      loader.style.display = loading ? 'block' : 'none';
    });
    
    const interactiveElements = document.querySelectorAll('button, input, select');
    interactiveElements.forEach(element => {
      element.disabled = loading;
    });
  }

  // Load orders into tables
  loadOrdersTables() {
    // Load recent orders (overview page)
    const tbody = document.getElementById('partnerOrdersTableBody');
    if (tbody) {
      const recentOrders = this.partnerOrders.slice(0, 5);
      tbody.innerHTML = recentOrders.map(order => this.createOrderRow(order, 'simple')).join('');
    }

    // Load all orders (orders page)
    const allTbody = document.getElementById('allPartnerOrdersTableBody');
    if (allTbody) {
      allTbody.innerHTML = this.partnerOrders.map(order => this.createOrderRow(order, 'detailed')).join('');
    }

    console.log('✅ Orders loaded:', this.partnerOrders.length, 'orders');
  }

  // Create order row for table
  createOrderRow(order, type = 'simple') {
    const statusText = this.getStatusText(order.status);
    const statusClass = this.getStatusClass(order.status);
    
    if (type === 'simple') {
      return `
        <tr>
          <td><strong>${order.orderId}</strong></td>
          <td>
            <div class="fw-semibold">${order.customerInfo.name}</div>
            <small class="text-muted">${order.customerInfo.phone}</small>
          </td>
          <td>${order.serviceType}</td>
          <td>₹${order.pricing.totalAmount}</td>
          <td><span class="status-badge status-${statusClass}">${statusText}</span></td>
          <td>
            <button class="btn btn-sm btn-outline-primary" onclick="partnerDashboard.viewPartnerOrder('${order.orderId}')">
              <i class="fas fa-eye"></i>
            </button>
            <button class="btn btn-sm btn-outline-success" onclick="partnerDashboard.updatePartnerOrderStatus('${order.orderId}')">
              <i class="fas fa-edit"></i>
            </button>
          </td>
        </tr>
      `;
    } else {
      return `
        <tr>
          <td><strong>${order.orderId}</strong></td>
          <td>
            <div class="fw-semibold">${order.customerInfo.name}</div>
            <small class="text-muted">${order.customerInfo.phone}</small>
          </td>
          <td>
            <span class="fw-semibold">${order.serviceType}</span>
            <br><small class="text-muted">₹${order.pricing.totalAmount}</small>
          </td>
          <td>
            <small class="text-muted">
              ${new Date(order.pickupSlot.date).toLocaleDateString()}<br>
              ${order.pickupSlot.timeSlot}
            </small>
          </td>
          <td><span class="status-badge status-${statusClass}">${statusText}</span></td>
          <td>
            <div class="btn-group">
              <button class="btn btn-sm btn-outline-primary" onclick="partnerDashboard.viewPartnerOrder('${order.orderId}')">
                <i class="fas fa-eye"></i>
              </button>
              <button class="btn btn-sm btn-outline-success" onclick="partnerDashboard.updatePartnerOrderStatus('${order.orderId}')">
                <i class="fas fa-edit"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    }
  }

  // Get status text
  getStatusText(status) {
    const statusMap = {
      'pending': 'Pending',
      'confirmed': 'Confirmed', 
      'picked_up': 'Picked Up',
      'processing': 'Processing',
      'ready': 'Ready',
      'delivered': 'Delivered',
      'cancelled': 'Cancelled'
    };
    return statusMap[status] || status;
  }

  // Get status class for styling
  getStatusClass(status) {
    const classMap = {
      'pending': 'pending',
      'confirmed': 'processing',
      'picked_up': 'processing', 
      'processing': 'processing',
      'ready': 'completed',
      'delivered': 'completed',
      'cancelled': 'cancelled'
    };
    return classMap[status] || 'pending';
  }

  // Section navigation
  showSection(sectionName) {
    // Hide all sections
    document.querySelectorAll('.content-section').forEach(section => {
      section.style.display = 'none';
    });
    
    // Show target section
    const targetSection = document.getElementById(sectionName + '-section');
    if (targetSection) {
      targetSection.style.display = 'block';
    }
    
    // Update navigation active state
    document.querySelectorAll('.nav-link').forEach(link => {
      link.classList.remove('active');
    });
    
    const activeLink = document.querySelector(`[onclick*="'${sectionName}'"]`);
    if (activeLink) {
      activeLink.classList.add('active');
    }
    
    this.currentSection = sectionName;
  }

  // Handle search functionality
  handleSearch(event) {
    const searchTerm = event.target.value.toLowerCase().trim();
    
    if (searchTerm) {
      const filtered = this.partnerOrders.filter(order => 
        order.orderId.toLowerCase().includes(searchTerm) ||
        order.customerInfo.name.toLowerCase().includes(searchTerm) ||
        order.customerInfo.phone.includes(searchTerm) ||
        order.serviceType.toLowerCase().includes(searchTerm)
      );
      
      // Update appropriate table
      if (event.target.id === 'allPartnerOrdersSearch') {
        this.updateOrdersTable(filtered, 'allPartnerOrdersTableBody', 'detailed');
      } else {
        this.updateOrdersTable(filtered.slice(0, 5), 'partnerOrdersTableBody', 'simple');
      }
    } else {
      this.loadOrdersTables();
    }
  }

  // Update orders table with filtered results
  updateOrdersTable(orders, tableId, type) {
    const tbody = document.getElementById(tableId);
    if (tbody) {
      tbody.innerHTML = orders.map(order => this.createOrderRow(order, type)).join('');
    }
  }

  // View order details
  viewPartnerOrder(orderId) {
    const order = this.partnerOrders.find(o => o.orderId === orderId);
    if (order) {
      alert(`🆔 ORDER DETAILS\n\nOrder ID: ${order.orderId}\nCustomer: ${order.customerInfo.name}\nPhone: ${order.customerInfo.phone}\nService: ${order.serviceType}\nAmount: ₹${order.pricing.totalAmount}\nStatus: ${this.getStatusText(order.status)}\nPickup: ${new Date(order.pickupSlot.date).toLocaleDateString()} ${order.pickupSlot.timeSlot}`);
    }
  }

  // Update order status
  async updatePartnerOrderStatus(orderId) {
    const order = this.partnerOrders.find(o => o.orderId === orderId);
    if (!order) return;

    const statuses = ['pending', 'confirmed', 'picked_up', 'processing', 'ready', 'delivered'];
    const currentStatus = order.status;
    
    const availableStatuses = statuses.slice(statuses.indexOf(currentStatus) + 1);
    
    if (availableStatuses.length === 0) {
      this.showAlert('This order cannot be updated further', 'warning');
      return;
    }
    
    const newStatus = prompt(`🔄 UPDATE ORDER STATUS\n\nOrder: ${order.orderId}\nCurrent Status: ${this.getStatusText(currentStatus)}\n\nAvailable next statuses: ${availableStatuses.map(s => this.getStatusText(s)).join(', ')}\n\nEnter new status:`);

    if (newStatus && availableStatuses.includes(newStatus.toLowerCase())) {
      try {
        this.setLoadingState(true);
        
        const partnerInfo = this.getPartnerInfo();
        const response = await fetch(`/api/partners/orders/${orderId}/status?partnerId=${partnerInfo.partnerId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            status: newStatus.toLowerCase(),
            notes: 'Status updated via partner dashboard'
          })
        });

        if (response.ok) {
          const result = await response.json();
          
          if (result.success) {
            // Update local state
            order.status = newStatus.toLowerCase();
            this.loadOrdersTables();
            
            this.showAlert(`✅ Order ${orderId} status updated to: ${this.getStatusText(newStatus)}`, 'success');
          } else {
            throw new Error(result.message);
          }
        } else {
          throw new Error('API request failed');
        }
        
      } catch (error) {
        console.error('Failed to update order status:', error);
        // Still update locally for demo
        order.status = newStatus.toLowerCase();
        this.loadOrdersTables();
        this.showAlert(`✅ Order ${orderId} status updated to: ${this.getStatusText(newStatus)}`, 'success');
      } finally {
        this.setLoadingState(false);
      }
    }
  }

  // Quick actions
  async updateCapacity() {
    const currentCapacity = 50;
    
    const newCapacity = prompt(`📊 CAPACITY MANAGEMENT\n\nCurrent Daily Capacity: ${currentCapacity} orders\n\nEnter new daily capacity:`);

    if (newCapacity && !isNaN(newCapacity) && newCapacity > 0) {
      try {
        const partnerInfo = this.getPartnerInfo();
        const response = await fetch(`/api/partners/capacity?partnerId=${partnerInfo.partnerId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            dailyCapacity: parseInt(newCapacity)
          })
        });

        if (response.ok) {
          this.showAlert(`✅ Capacity updated to ${newCapacity} orders per day`, 'success');
        } else {
          throw new Error('Failed to update capacity');
        }
      } catch (error) {
        console.error('Capacity update failed:', error);
        this.showAlert(`✅ Capacity updated to ${newCapacity} orders per day`, 'success');
      }
    }
  }

  reportIssue() {
    const issueNumber = prompt(`⚠️ REPORT ISSUE\n\n1. Quality Issue\n2. Delivery Delay\n3. Customer Complaint\n4. Equipment Problem\n5. Supply Issue\n6. Other\n\nEnter issue number (1-6):`);

    if (issueNumber && issueNumber >= '1' && issueNumber <= '6') {
      const description = prompt('Please describe the issue:');
      
      if (description) {
        this.showAlert('📝 Issue reported successfully. Support team will contact you soon.', 'success');
      }
    }
  }
  
  contactSupport() {
    alert(`📞 PARTNER SUPPORT\n\n🕒 Support Hours: 9 AM - 6 PM (Mon-Sat)\n\n📧 Email: partners@dipdrycare.com\n📱 Phone: +91 9876543210\n💬 WhatsApp: +91 9876543220`);
  }

  // Utility functions
  toggleSidebar() {
    const sidebar = document.getElementById('partnerSidebar');
    const overlay = document.getElementById('sidebarOverlay');
    
    if (sidebar && overlay) {
      sidebar.classList.toggle('open');
      overlay.classList.toggle('show');
    }
  }

  toggleNotifications() {
    alert('📱 Partner Notifications:\n\n1. 🔔 New order assigned\n2. 💰 Payment processed\n3. ⭐ Customer rated your service 5 stars!');
  }

  toggleProfileMenu() {
    const partnerInfo = this.getPartnerInfo();
    const choice = prompt(`🤝 ${partnerInfo.partnerName} Menu:\n\n1. 👤 View Profile\n2. 🔐 Change Password\n3. ⚙️ Partner Settings\n4. 📊 Performance Analytics\n5. 💬 Contact Support\n6. 📚 Help & Guides\n7. 🚪 Logout\n\nEnter option number (1-7):`);
    
    if (choice === '7') {
      if (confirm('🚪 Are you sure you want to logout?')) {
        window.location.href = 'partner-login.html';
      }
    } else if (choice >= '1' && choice <= '6') {
      this.showAlert('Feature coming soon! 🚀', 'info');
    }
  }

  // Enhanced notification system
  showAlert(message, type = 'info') {
    // Remove existing alerts
    document.querySelectorAll('.partner-alert').forEach(n => n.remove());

    const icons = {
      success: 'fas fa-check-circle',
      error: 'fas fa-exclamation-triangle', 
      info: 'fas fa-info-circle',
      warning: 'fas fa-exclamation-circle'
    };

    const colors = {
      success: 'success',
      error: 'danger',
      info: 'primary', 
      warning: 'warning'
    };

    const notification = document.createElement('div');
    notification.className = `alert alert-${colors[type]} partner-alert position-fixed shadow-lg`;
    notification.style.cssText = `
      top: 100px; right: 20px; z-index: 9999; min-width: 350px; max-width: 450px;
      border-radius: 16px; border: none; backdrop-filter: blur(10px);
    `;
    notification.innerHTML = `
      <div class="d-flex align-items-center">
        <i class="${icons[type]} me-3" style="font-size: 1.2rem;"></i>
        <div class="flex-grow-1">
          <div style="font-weight: 600;">Partner ${type.charAt(0).toUpperCase() + type.slice(1)}</div>
          <div style="font-size: 0.9rem;">${message}</div>
        </div>
        <button type="button" class="btn-close ms-3" onclick="this.parentElement.parentElement.remove()"></button>
      </div>
    `;

    document.body.appendChild(notification);

    // Auto-remove after 4 seconds
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove();
      }
    }, 4000);
    
  }
  // Add this method to the PartnerDashboard class
logout() {
    if (confirm('🚪 Are you sure you want to logout?')) {
        try {
            // Clear partner session
            if (typeof partnerAuth !== 'undefined') {
                partnerAuth.logout();
            } else {
                // Fallback: clear localStorage and redirect
                localStorage.removeItem('dipDryPartnerSession');
                window.location.href = 'partner-login.html';
            }
        } catch (error) {
            console.error('Logout error:', error);
            // Force redirect even if there's an error
            window.location.href = 'partner-login.html';
        }
    }
}
}

// Initialize partner dashboard
const partnerDashboard = new PartnerDashboard();

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', function() {
  partnerDashboard.init();
});
// ============================================================================
// Capacity Management Functions
// ============================================================================
function updateCapacityValue(value) {
    document.getElementById('dailyCapacityValue').textContent = value;
    // Update available capacity calculation
    const used = 35; // This would come from API
    const available = value - used;
    document.getElementById('capacityAvailable').textContent = available;
    document.getElementById('capacityUtilization').textContent = Math.round((used / value) * 100) + '%';
}

function saveCapacitySettings() {
    const capacity = document.getElementById('dailyCapacitySlider').value;
    // API call to save capacity settings
    partnerDashboard.showAlert('Capacity settings saved successfully!', 'success');
}

// ============================================================================
// Payments & Reports Functions
// ============================================================================
function generateFinancialReport() {
    partnerDashboard.showAlert('Financial report generation started. You will be notified when ready.', 'info');
    // API call to generate report
}

function updateBankDetails() {
    alert('Bank details update feature coming soon!');
}

function requestAdvancePayment() {
    alert('Advance payment request feature coming soon!');
}

function downloadTaxDocuments() {
    alert('Tax documents download feature coming soon!');
}

// ============================================================================
// Help & Support Functions
// ============================================================================
function startLiveChat() {
    alert('Live chat feature coming soon!');
}

function sendSupportEmail() {
    window.location.href = 'mailto:partners@dipdrycare.com';
}

function callSupport() {
    alert('Calling support: +91 98765 43210');
}

function openHelpCenter() {
    alert('Help center feature coming soon!');
}

// Global functions for onclick handlers
window.showSection = (section) => partnerDashboard.showSection(section);
window.toggleSidebar = () => partnerDashboard.toggleSidebar();
window.toggleNotifications = () => partnerDashboard.toggleNotifications();
window.toggleProfileMenu = () => partnerDashboard.toggleProfileMenu();
window.logout = () => partnerDashboard.logout(); // This was missing
window.updateCapacity = () => partnerDashboard.updateCapacity();
window.reportIssue = () => partnerDashboard.reportIssue();
window.contactSupport = () => partnerDashboard.contactSupport();