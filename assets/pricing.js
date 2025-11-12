// Smart Pricing & Cart System - Enhanced with quantity controls and cart management
// Updated: Minimum order ₹349, No delivery charges, Fixed cart removal issues

const PRICE_DATA = {
  laundry: [
    { name: "Wash & fold", price: 69, unit: "KG" },
    { name: "Wash & iron", price: 99, unit: "KG" },
    { name: "Non wearables", price: 99, unit: "KG" },
    { name: "Express ~ 24 hours", price: 199, unit: "KG" },
    { name: "Steam iron", price: 69, unit: "KG" },
    { name: "Premium laundry", price: 149, unit: "KG" },
  ],
  men: [
    { name: "Shirt", price: 79, unit: "Piece" },
    { name: "T shirt", price: 79, unit: "Piece" },
    { name: "Trouser/Jeans", price: 79, unit: "Piece" },
    { name: "Kurta plain", price: 90, unit: "Piece" },
    { name: "Kurta medium", price: 125, unit: "Piece" },
    { name: "Kurta heavy", price: 149, unit: "Piece" },
    { name: "Coat / blazer", price: 249, unit: "Piece" },
    { name: "Coat / blazer heavy", price: 299, unit: "Piece" },
    { name: "Suit 2 piece", price: 299, unit: "Piece" },
    { name: "Suit 3 piece", price: 349, unit: "Piece" },
    { name: "Sherwani", price: 599, unit: "Piece" },
    { name: "Shorts", price: 49, unit: "Piece" },
    { name: "Sweater", price: 149, unit: "Piece" },
    { name: "Leather jacket", price: 499, unit: "Piece" },
    { name: "Nehru jacket", price: 149, unit: "Piece" },
    { name: "Dhoti", price: 149, unit: "Piece" },
    { name: "Pyjama", price: 79, unit: "Piece" },
    { name: "Sports Shoes", price: 249, unit: "Piece" },
    { name: "Premium shoes", price: 399, unit: "Piece" },
    { name: "Casual shoes", price: 299, unit: "Piece" },
    { name: "Sweat shirt", price: 149, unit: "Piece" },
    { name: "Silk shirt", price: 149, unit: "Piece" },
    { name: "Silk dhoti", price: 249, unit: "Piece" },
    { name: "Tie", price: 29, unit: "Piece" },
    { name: "Inner wear", price: 19, unit: "Piece" },
  ],
  women: [
    { name: "Kurti Plain", price: 89, unit: "Piece" },
    { name: "Kurti fancy", price: 149, unit: "Piece" },
    { name: "Dress small", price: 199, unit: "Piece" },
    { name: "Dress long", price: 299, unit: "Piece" },
    { name: "Anarkali suit", price: 299, unit: "Piece" },
    { name: "Top", price: 79, unit: "Piece" },
    { name: "Saree plain", price: 199, unit: "Piece" },
    { name: "Saree medium", price: 249, unit: "Piece" },
    { name: "Saree heavy", price: 349, unit: "Piece" },
    { name: "Lehanga", price: 349, unit: "Piece" },
    { name: "Lehanga bridal", price: 749, unit: "Piece" },
    { name: "Lehanga heavy", price: 999, unit: "Piece" },
    { name: "Blouse plain", price: 79, unit: "Piece" },
    { name: "Blouse fancy", price: 149, unit: "Piece" },
    { name: "Blouse work", price: 199, unit: "Piece" },
    { name: "Skirt", price: 99, unit: "Piece" },
    { name: "Salwar", price: 89, unit: "Piece" },
    { name: "Dupatta", price: 59, unit: "Piece" },
    { name: "Gown", price: 499, unit: "Piece" },
    { name: "Silk saree", price: 249, unit: "Piece" },
    { name: "Saree polishing", price: 199, unit: "Piece" },
    { name: "Petticoat", price: 69, unit: "Piece" },
    { name: "Chunni", price: 89, unit: "Piece" },
    { name: "Saree iron", price: 49, unit: "Piece" },
  ],
  woolen: [
    { name: "Blanket / quilt single", price: 299, unit: "Piece" },
    { name: "Blanket / quilt double", price: 349, unit: "Piece" },
    { name: "Blanket / quilt heavy", price: 399, unit: "Piece" },
    { name: "Blanket cover", price: 149, unit: "Piece" },
    { name: "Jacket", price: 249, unit: "Piece" },
    { name: "Jacket heavy", price: 299, unit: "Piece" },
    { name: "Sweater light", price: 99, unit: "Piece" },
    { name: "Sweater Medium", price: 149, unit: "Piece" },
    { name: "Sweater heavy", price: 199, unit: "Piece" },
    { name: "Overcoat medium", price: 299, unit: "Piece" },
    { name: "Overcoat long", price: 349, unit: "Piece" },
    { name: "Mufflar", price: 39, unit: "Piece" },
    { name: "Shawl", price: 149, unit: "Piece" },
    { name: "Socks", price: 29, unit: "Piece" },
    { name: "Cap", price: 39, unit: "Piece" },
    { name: "Hand gloves", price: 49, unit: "Piece" },
    { name: "Baby blanket", price: 149, unit: "Piece" },
    { name: "Woolen per kg", price: 149, unit: "KG" },
  ],
  household: [
    { name: "Rug / Carpet per sqft", price: 25, unit: "Per sqft" },
    { name: "Hand towel", price: 69, unit: "Piece" },
    { name: "Towel", price: 99, unit: "Piece" },
    { name: "Bedsheet single", price: 149, unit: "Piece" },
    { name: "Bedsheet double", price: 199, unit: "Piece" },
    { name: "Mat small", price: 59, unit: "Piece" },
    { name: "Mat big", price: 99, unit: "Piece" },
    { name: "Table mat", price: 49, unit: "Piece" },
    { name: "Cushion", price: 79, unit: "Piece" },
    { name: "Cushion cover", price: 49, unit: "Piece" },
    { name: "Pillow small", price: 99, unit: "Piece" },
    { name: "Pillow large", price: 149, unit: "Piece" },
    { name: "Pillow cover", price: 49, unit: "Piece" },
    { name: "Curtains (Single layer)", price: 299, unit: "Piece" },
    { name: "Curtains (Double layer)", price: 399, unit: "Piece" },
    { name: "Curtains Steam iron", price: 99, unit: "Piece" },
    { name: "Toy small", price: 99, unit: "Piece" },
    { name: "Toy medium", price: 249, unit: "Piece" },
    { name: "Toy large", price: 399, unit: "Piece" },
    { name: "Baby bed", price: 249, unit: "Piece" },
    { name: "Curtains heavy", price: 399, unit: "Piece" },
    { name: "Curtains Per Sqft", price: 10, unit: "Per sqft" },
    { name: "Bag small", price: 99, unit: "Piece" },
    { name: "Bagpack", price: 149, unit: "Piece" },
    { name: "Bag", price: 199, unit: "Piece" },
    { name: "Bed cover", price: 149, unit: "Piece" },
    { name: "Trolley bag", price: 299, unit: "Piece" },
    { name: "Apron", price: 49, unit: "Piece" },
  ],
};

// Configuration Constants
const MIN_ORDER_VALUE = 349;  // Minimum order value in INR
const DELIVERY_CHARGE = 0;    // No delivery charges

// Cart Management - Initialize from localStorage
let cart = [];
function loadCart() {
  try {
    const saved = localStorage.getItem('laundryCart');
    cart = saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error('Error loading cart:', error);
    cart = [];
  }
}

// Utility Functions
const formatINR = (n) => `₹${Number(n).toFixed(2)}`;
const generateId = (name, category) => `${category}-${name.replace(/\s+/g, '-').toLowerCase()}`;

// Icon mapping for different categories
const iconMap = {
  laundry: "fa-soap",
  men: "fa-user-tie",
  women: "fa-female", 
  woolen: "fa-mitten",
  household: "fa-home"
};

// Quantity state for each item
const quantities = {};

// DOM Elements
const SEARCH_INPUT = document.getElementById('globalSearch');
const SEARCH_COUNT = document.getElementById('searchCount');
const NO_RESULTS = document.getElementById('noResults');
const SEARCH_RESULTS_WRAP = document.getElementById('searchResultsWrap');
const SEARCH_RESULTS = document.getElementById('searchResults');
const CATEGORY_TABS = document.getElementById('categoryTabs');
const CART_SIDEBAR = document.getElementById('cartSidebar');
const CART_OVERLAY = document.getElementById('cartOverlay');
const CART_ITEMS = document.getElementById('cartItems');
const CART_SUMMARY = document.getElementById('cartSummary');

// Initialize quantities for all items
function initializeQuantities() {
  Object.entries(PRICE_DATA).forEach(([category, items]) => {
    items.forEach(item => {
      const id = generateId(item.name, category);
      quantities[id] = 0;
    });
  });
}

// Render item with quantity controls and add to cart
function renderItemRow(item, category) {
  const id = generateId(item.name, category);
  const qty = quantities[id] || 0;
  const icon = iconMap[category] || "fa-shirt";
  
  return `
    <div class="item-row" data-item-id="${id}">
      <div class="item-left">
        <div class="item-icon">
          <i class="fa-solid ${icon}"></i>
        </div>
        <div class="item-details">
          <div class="fw-bold">${item.name}</div>
          <div class="small text-muted">
            <span class="badge badge-unit">${item.unit}</span>
            <span class="text-primary fw-bold ms-2">${formatINR(item.price)} / ${item.unit}</span>
          </div>
        </div>
      </div>
      <div class="item-controls">
        <div class="qty-controls">
          <button class="qty-btn" onclick="changeQuantity('${id}', -1)" ${qty <= 0 ? 'disabled' : ''}>
            <i class="fa-solid fa-minus"></i>
          </button>
          <input type="number" class="qty-input" value="${qty}" min="0" max="99" 
                 onchange="setQuantity('${id}', this.value)" />
          <button class="qty-btn" onclick="changeQuantity('${id}', 1)">
            <i class="fa-solid fa-plus"></i>
          </button>
        </div>
        <button class="add-btn" onclick="addToCart('${id}')" ${qty <= 0 ? 'disabled' : ''}>
          <i class="fa-solid fa-cart-plus me-1"></i>
          ${qty > 0 ? `Add ${qty}` : 'Add'}
        </button>
      </div>
    </div>
  `;
}

// Render category list
function renderList(elementId, items, category) {
  const element = document.getElementById(elementId);
  if (!element) return;
  
  element.innerHTML = items.map(item => renderItemRow(item, category)).join('');
}

// Render all categories
function renderAll() {
  renderList('list-laundry', PRICE_DATA.laundry, 'laundry');
  renderList('list-men', PRICE_DATA.men, 'men');
  renderList('list-women', PRICE_DATA.women, 'women');
  renderList('list-woolen', PRICE_DATA.woolen, 'woolen');
  renderList('list-household', PRICE_DATA.household, 'household');
}

// Get all items flattened with category info
function allItemsFlattened() {
  const out = [];
  Object.entries(PRICE_DATA).forEach(([category, items]) => {
    items.forEach(item => out.push({ ...item, category, id: generateId(item.name, category) }));
  });
  return out;
}

// Quantity Management
function changeQuantity(itemId, delta) {
  const currentQty = quantities[itemId] || 0;
  const newQty = Math.max(0, Math.min(99, currentQty + delta));
  setQuantity(itemId, newQty);
}

function setQuantity(itemId, qty) {
  const numQty = Math.max(0, Math.min(99, parseInt(qty) || 0));
  quantities[itemId] = numQty;
  
  // Update UI for this specific item
  const itemRow = document.querySelector(`[data-item-id="${itemId}"]`);
  if (itemRow) {
    const qtyInput = itemRow.querySelector('.qty-input');
    const minusBtn = itemRow.querySelector('.qty-btn:first-child');
    const addBtn = itemRow.querySelector('.add-btn');
    
    qtyInput.value = numQty;
    minusBtn.disabled = numQty <= 0;
    addBtn.disabled = numQty <= 0;
    addBtn.innerHTML = numQty > 0 
      ? `<i class="fa-solid fa-cart-plus me-1"></i>Add ${numQty}`
      : '<i class="fa-solid fa-cart-plus me-1"></i>Add';
  }
}

// Cart Management - Fixed version
function addToCart(itemId) {
  const qty = quantities[itemId];
  if (qty <= 0) return;
  
  const allItems = allItemsFlattened();
  const item = allItems.find(it => it.id === itemId);
  if (!item) return;
  
  // Check if item already exists in cart
  const existingIndex = cart.findIndex(cartItem => cartItem.id === itemId);
  
  if (existingIndex >= 0) {
    cart[existingIndex].quantity += qty;
  } else {
    cart.push({
      id: itemId,
      name: item.name,
      price: item.price,
      unit: item.unit,
      category: item.category,
      quantity: qty
    });
  }
  
  // Reset quantity and save cart
  setQuantity(itemId, 0);
  saveCart();
  updateCartDisplay();
  
  // Show success feedback
  showAddedToCartFeedback(item.name, qty);
}

// Fixed removeFromCart function
function removeFromCart(itemId) {
  console.log('Removing item:', itemId, 'Cart before:', cart.length);
  
  // Filter out the item
  cart = cart.filter(item => item.id !== itemId);
  
  console.log('Cart after removal:', cart.length);
  
  // Force save and update
  saveCart();
  updateCartDisplay();
  
  // Show feedback
  showNotification('Item removed from cart', 'info');
}

function updateCartItemQuantity(itemId, newQty) {
  const numQty = parseInt(newQty) || 0;
  const itemIndex = cart.findIndex(item => item.id === itemId);
  
  if (itemIndex >= 0) {
    if (numQty <= 0) {
      removeFromCart(itemId);
    } else {
      cart[itemIndex].quantity = Math.min(99, Math.max(1, numQty));
      saveCart();
      updateCartDisplay();
    }
  }
}

function clearCart() {
  cart = [];
  saveCart();
  updateCartDisplay();
  showNotification('Cart cleared', 'info');
}

// Fixed saveCart function
function saveCart() {
  try {
    localStorage.setItem('laundryCart', JSON.stringify(cart));
    console.log('Cart saved:', cart.length, 'items');
  } catch (error) {
    console.error('Error saving cart:', error);
  }
}

// Cart Display
function updateCartDisplay() {
  updateCartCounts();
  renderCartItems();
  updateCartSummary();
}

function updateCartCounts() {
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  
  const cartCountElement = document.getElementById('cartCount');
  const floatingBadge = document.getElementById('floatingCartBadge');
  
  if (cartCountElement) cartCountElement.textContent = totalItems;
  
  if (floatingBadge) {
    if (totalItems > 0) {
      floatingBadge.textContent = totalItems;
      floatingBadge.classList.remove('d-none');
    } else {
      floatingBadge.classList.add('d-none');
    }
  }
}

function renderCartItems() {
  if (!CART_ITEMS) return;
  
  if (cart.length === 0) {
    CART_ITEMS.innerHTML = `
      <div class="text-center text-muted py-4">
        <i class="fa-solid fa-shopping-cart fa-3x mb-3 opacity-25"></i>
        <p>Your cart is empty</p>
        <button class="btn btn-primary" onclick="toggleCart()">Continue Shopping</button>
      </div>
    `;
    if (CART_SUMMARY) CART_SUMMARY.classList.add('d-none');
    return;
  }
  
  CART_ITEMS.innerHTML = cart.map(item => `
    <div class="cart-item" data-cart-item="${item.id}">
      <div class="flex-grow-1">
        <div class="fw-bold">${item.name}</div>
        <div class="small text-muted">${formatINR(item.price)} / ${item.unit}</div>
      </div>
      <div class="d-flex align-items-center gap-2">
        <div class="qty-controls">
          <button class="qty-btn" onclick="updateCartItemQuantity('${item.id}', ${item.quantity - 1})">
            <i class="fa-solid fa-minus"></i>
          </button>
          <input type="number" class="qty-input" value="${item.quantity}" min="1" max="99"
                 onchange="updateCartItemQuantity('${item.id}', this.value)" />
          <button class="qty-btn" onclick="updateCartItemQuantity('${item.id}', ${item.quantity + 1})">
            <i class="fa-solid fa-plus"></i>
          </button>
        </div>
        <div class="text-end">
          <div class="fw-bold">${formatINR(item.price * item.quantity)}</div>
          <button class="btn btn-sm btn-outline-danger" onclick="removeFromCart('${item.id}')" 
                  title="Remove ${item.name}">
            <i class="fa-solid fa-trash"></i>
          </button>
        </div>
      </div>
    </div>
  `).join('');
  
  if (CART_SUMMARY) CART_SUMMARY.classList.remove('d-none');
}

// Updated cart summary with minimum order validation and no delivery charges
function updateCartSummary() {
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const deliveryCharge = DELIVERY_CHARGE; // Always 0
  const total = subtotal + deliveryCharge;
  
  // Update DOM elements safely
  const elements = {
    totalItems: document.getElementById('totalItems'),
    subtotalAmount: document.getElementById('subtotalAmount'),
    deliveryAmount: document.getElementById('deliveryAmount'),
    totalAmount: document.getElementById('totalAmount')
  };
  
  if (elements.totalItems) elements.totalItems.textContent = totalItems;
  if (elements.subtotalAmount) elements.subtotalAmount.textContent = formatINR(subtotal);
  if (elements.deliveryAmount) elements.deliveryAmount.textContent = 'FREE';
  if (elements.totalAmount) elements.totalAmount.textContent = formatINR(total);
  
  // Update checkout button based on minimum order value
  updateCheckoutButton(subtotal);
}

function updateCheckoutButton(subtotal) {
  const checkoutBtn = document.querySelector('[onclick="proceedToCheckout()"]');
  if (!checkoutBtn) return;
  
  if (subtotal < MIN_ORDER_VALUE) {
    const remaining = MIN_ORDER_VALUE - subtotal;
    checkoutBtn.disabled = true;
    checkoutBtn.innerHTML = `
      <i class="fa-solid fa-info-circle me-2"></i>
      Add ${formatINR(remaining)} more (Min: ${formatINR(MIN_ORDER_VALUE)})
    `;
    checkoutBtn.className = 'btn btn-warning btn-lg w-100 mt-3';
  } else {
    checkoutBtn.disabled = false;
    checkoutBtn.innerHTML = `
      <i class="fa-solid fa-credit-card me-2"></i>
      Proceed to Checkout
    `;
    checkoutBtn.className = 'btn btn-success btn-lg w-100 mt-3';
  }
}

// Cart Toggle
function toggleCart() {
  if (!CART_SIDEBAR || !CART_OVERLAY) return;
  
  const isOpen = CART_SIDEBAR.classList.contains('open');
  
  if (isOpen) {
    CART_SIDEBAR.classList.remove('open');
    CART_OVERLAY.classList.remove('show');
  } else {
    CART_SIDEBAR.classList.add('open');
    CART_OVERLAY.classList.add('show');
    updateCartDisplay();
  }
}

// Search Functionality
function doSearch(query) {
  const searchTerm = query.trim().toLowerCase();
  const allItems = allItemsFlattened();
  
  if (!searchTerm) {
    // Show category tabs, hide search results
    if (SEARCH_RESULTS_WRAP) SEARCH_RESULTS_WRAP.classList.add('d-none');
    if (CATEGORY_TABS) CATEGORY_TABS.classList.remove('d-none');
    if (NO_RESULTS) NO_RESULTS.classList.add('d-none');
    if (SEARCH_COUNT) SEARCH_COUNT.textContent = 'Showing all items';
    return;
  }
  
  const matches = allItems.filter(item =>
    item.name.toLowerCase().includes(searchTerm)
  );
  
  if (matches.length === 0) {
    // Show no results
    if (SEARCH_RESULTS_WRAP) SEARCH_RESULTS_WRAP.classList.add('d-none');
    if (CATEGORY_TABS) CATEGORY_TABS.classList.add('d-none');
    if (NO_RESULTS) NO_RESULTS.classList.remove('d-none');
    if (SEARCH_COUNT) SEARCH_COUNT.textContent = `No results for "${query}"`;
    return;
  }
  
  // Show search results with priority
  if (NO_RESULTS) NO_RESULTS.classList.add('d-none');
  if (CATEGORY_TABS) CATEGORY_TABS.classList.add('d-none');
  if (SEARCH_RESULTS_WRAP) SEARCH_RESULTS_WRAP.classList.remove('d-none');
  if (SEARCH_COUNT) SEARCH_COUNT.textContent = `${matches.length} result(s) for "${query}"`;
  
  // Render search results
  if (SEARCH_RESULTS) {
    SEARCH_RESULTS.innerHTML = matches.map(item => 
      renderItemRow(item, item.category)
    ).join('');
  }
}

function clearSearch() {
  if (SEARCH_INPUT) SEARCH_INPUT.value = '';
  doSearch('');
}

// Notification System
function showNotification(message, type = 'info') {
  // Remove existing notifications
  document.querySelectorAll('.custom-notification').forEach(n => n.remove());
  
  const notification = document.createElement('div');
  notification.className = `alert alert-${type === 'error' ? 'danger' : type} custom-notification position-fixed shadow-lg`;
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
  }, 4000);
}

// Feedback Functions
function showAddedToCartFeedback(itemName, quantity) {
  showNotification(`Added to cart: ${quantity} × ${itemName}`, 'success');
}

// Updated Checkout Function with minimum order validation
function proceedToCheckout() {
  if (cart.length === 0) {
    showNotification('Your cart is empty! Add some items first.', 'error');
    return;
  }
  
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  if (subtotal < MIN_ORDER_VALUE) {
    const remaining = MIN_ORDER_VALUE - subtotal;
    showNotification(
      `Minimum order value is ${formatINR(MIN_ORDER_VALUE)}. Please add ${formatINR(remaining)} more to proceed.`, 
      'error'
    );
    return;
  }
  
  // Save cart data for checkout page
  try {
    const checkoutData = {
      items: cart,
      timestamp: new Date().toISOString(),
      subtotal: subtotal,
      total: subtotal, // No delivery charges
      minOrderMet: true
    };
    
    localStorage.setItem('checkoutData', JSON.stringify(checkoutData));
    console.log('Checkout data saved:', checkoutData);
    
    // Redirect to order page
    window.location.href = 'order.html';
    
  } catch (error) {
    console.error('Error preparing checkout:', error);
    showNotification('Error preparing checkout. Please try again.', 'error');
  }
}

// Initialize Everything
document.addEventListener('DOMContentLoaded', () => {
  console.log('Initializing pricing page...');
  
  // Load cart first
  loadCart();
  
  // Initialize quantities
  initializeQuantities();
  
  // Render all items
  renderAll();
  
  // Update cart display
  updateCartDisplay();
  
  // Setup search if element exists
  if (SEARCH_INPUT) {
    SEARCH_INPUT.addEventListener('input', (e) => doSearch(e.target.value));
  }
  
  console.log('Pricing page initialized. Cart items:', cart.length);
});

// Global Functions (for onclick handlers)
window.changeQuantity = changeQuantity;
window.setQuantity = setQuantity;
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.updateCartItemQuantity = updateCartItemQuantity;
window.clearCart = clearCart;
window.toggleCart = toggleCart;
window.clearSearch = clearSearch;
window.proceedToCheckout = proceedToCheckout;