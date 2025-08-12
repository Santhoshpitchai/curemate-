// Health Concern Pages Cart System (Same as Home Page)

// Global cart variables with localStorage persistence
let myCart = [];
let isCartOpen = false;

// Load cart from localStorage on page load
function loadCartFromStorage() {
  try {
    // Check both possible localStorage keys and merge if needed
    const cureMateCart = localStorage.getItem('cureMateCart');
    const shoppingCart = localStorage.getItem('shoppingCart');

    console.log('🔍 Checking localStorage...');
    console.log('cureMateCart:', cureMateCart);
    console.log('shoppingCart:', shoppingCart);

    if (cureMateCart) {
      const parsedCart = JSON.parse(cureMateCart);
      // Validate cart data
      if (Array.isArray(parsedCart) && parsedCart.every(item =>
        item.name && typeof item.price === 'number' && typeof item.quantity === 'number'
      )) {
        myCart = parsedCart;
        console.log('✅ Valid cart loaded from cureMateCart:', myCart.length, 'items');
      } else {
        console.warn('⚠️ Invalid cart data in cureMateCart, clearing...');
        localStorage.removeItem('cureMateCart');
        myCart = [];
      }
    } else if (shoppingCart) {
      const parsedCart = JSON.parse(shoppingCart);
      // Validate and migrate from old cart system
      if (Array.isArray(parsedCart) && parsedCart.every(item =>
        item.name && typeof item.price === 'number' && typeof item.quantity === 'number'
      )) {
        myCart = parsedCart;
        console.log('✅ Migrated cart from shoppingCart:', myCart.length, 'items');
        // Save to new key and remove old key
        saveCartToStorage();
        localStorage.removeItem('shoppingCart');
      } else {
        console.warn('⚠️ Invalid cart data in shoppingCart, clearing...');
        localStorage.removeItem('shoppingCart');
        myCart = [];
      }
    } else {
      myCart = [];
      console.log('ℹ️ No cart data found, starting with empty cart');
    }
  } catch (error) {
    console.error('❌ Error loading cart from storage:', error);
    // Clear corrupted data
    localStorage.removeItem('cureMateCart');
    localStorage.removeItem('shoppingCart');
    myCart = [];
  }
}

// Save cart to localStorage
function saveCartToStorage() {
  try {
    localStorage.setItem('cureMateCart', JSON.stringify(myCart));
    console.log('✅ Cart saved to storage:', myCart.length, 'items');
  } catch (error) {
    console.error('❌ Error saving cart to storage:', error);
  }
}

// Main cart toggle function
function toggleCartDropdown() {
  console.log('🛒 Cart icon clicked!');

  const dropdown = document.getElementById('cartDropdown');
  console.log('Cart dropdown element:', dropdown);

  if (!dropdown) {
    console.error('❌ Cart dropdown not found!');
    alert('Cart dropdown not found! Please refresh the page.');
    return;
  }

  console.log('Current cart state - isCartOpen:', isCartOpen);
  console.log('Current dropdown display:', dropdown.style.display);

  if (isCartOpen) {
    dropdown.style.display = 'none';
    isCartOpen = false;
    console.log('✅ Cart closed');
  } else {
    dropdown.style.display = 'block';
    isCartOpen = true;
    updateCartDisplay();
    console.log('✅ Cart opened - dropdown should be visible now');
    console.log('Final dropdown display style:', dropdown.style.display);
  }
}

// Add item to cart function
function addToSimpleCart(name, price, image) {
  console.log('🛒 Adding to cart:', name, 'Price:', price);

  try {
    // Check if item already exists
    const existingItem = myCart.find(item => item.name === name);
    if (existingItem) {
      existingItem.quantity += 1;
      console.log('✅ Increased quantity for:', name);
    } else {
      myCart.push({
        name: name,
        price: parseFloat(price),
        image: image || 'img/placeholder.jpg',
        quantity: 1
      });
      console.log('✅ Added new item:', name);
    }

    updateCartBadge();
    updateCartDisplay();
    saveCartToStorage();

    // Show success message
    showSuccessMessage('Added ' + name + ' to cart!');

  } catch (error) {
    console.error('❌ Error adding to cart:', error);
    showErrorMessage('Error adding to cart');
  }
}

// Quantity control functions for product selectors
function increaseQuantity(productId) {
  const input = document.getElementById(productId);
  if (input) {
    const currentValue = parseInt(input.value);
    const maxValue = parseInt(input.max);
    if (currentValue < maxValue) {
      input.value = currentValue + 1;
    }
  }
}

function decreaseQuantity(productId) {
  const input = document.getElementById(productId);
  if (input) {
    const currentValue = parseInt(input.value);
    const minValue = parseInt(input.min);
    if (currentValue > minValue) {
      input.value = currentValue - 1;
    }
  }
}

// Add item to cart function with quantity
function addToCartWithQuantity(name, price, image, quantityInputId) {
  const quantityInput = document.getElementById(quantityInputId);
  const quantity = quantityInput ? parseInt(quantityInput.value) : 1;

  console.log('🛒 Adding to cart:', name, 'Price:', price, 'Quantity:', quantity);

  try {
    // Check if item already exists
    const existingItem = myCart.find(item => item.name === name);
    if (existingItem) {
      existingItem.quantity += quantity;
      console.log('✅ Increased quantity for:', name, 'New total:', existingItem.quantity);
    } else {
      myCart.push({
        name: name,
        price: parseFloat(price),
        image: image || 'img/placeholder.jpg',
        quantity: quantity
      });
      console.log('✅ Added new item:', name, 'Quantity:', quantity);
    }

    updateCartBadge();
    updateCartDisplay();
    saveCartToStorage();

    // Reset quantity to 1
    if (quantityInput) {
      quantityInput.value = 1;
    }

    // Show success message
    showSuccessMessage(`Added ${quantity} x ${name} to cart!`);

  } catch (error) {
    console.error('❌ Error adding to cart:', error);
    showErrorMessage('Error adding to cart');
  }
}

// Update cart badge
function updateCartBadge() {
  const badge = document.getElementById('cartBadge');
  if (!badge) {
    console.error('❌ Cart badge element not found!');
    return;
  }

  const totalItems = myCart.reduce((sum, item) => sum + item.quantity, 0);
  console.log('🔄 Updating badge to:', totalItems);

  badge.textContent = totalItems;
  badge.style.display = totalItems > 0 ? 'flex' : 'none';

  // Add animation
  if (totalItems > 0) {
    badge.classList.add('cart-badge-animate');
    setTimeout(() => badge.classList.remove('cart-badge-animate'), 300);
  }
}

// Update cart display with quantity controls
function updateCartDisplay() {
  const cartList = document.getElementById('cartItemsList');
  const cartTotal = document.getElementById('cartTotalAmount');
  const cartItemCount = document.getElementById('cartItemCount');

  if (!cartList) {
    console.error('❌ Cart items list element not found!');
    return;
  }

  console.log('🔄 Updating cart display...', {
    cartList: !!cartList,
    cartTotal: !!cartTotal,
    cartItemCount: !!cartItemCount,
    cartLength: myCart.length,
    cartContents: myCart
  });

  const totalItems = myCart.reduce((sum, item) => sum + item.quantity, 0);

  // Update item count in cart header
  if (cartItemCount) {
    if (totalItems > 0) {
      cartItemCount.textContent = `${totalItems} item${totalItems !== 1 ? 's' : ''}`;
      cartItemCount.style.display = 'block';
    } else {
      cartItemCount.style.display = 'none';
    }
  }

  if (myCart.length === 0) {
    cartList.innerHTML = '<p style="color: #64748b; text-align: center; padding: 20px; margin: 0;">Your cart is empty</p>';
    if (cartTotal) cartTotal.textContent = '0.00';
    // Update footer with zero total when cart is empty
    updateCartFooter(0);
  } else {
    let total = 0;
    let html = '';

    myCart.forEach((item, index) => {
      const itemTotal = item.price * item.quantity;
      total += itemTotal;

      html += `
        <div style="border-bottom: 1px solid #e2e8f0; padding: 15px 0; margin: 0;">
          <!-- Product Info Row -->
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <div style="flex: 1;">
              <strong style="color: #334155; font-size: 14px; display: block; margin-bottom: 2px;">${item.name}</strong>
              <span style="color: #00BFB3; font-size: 16px; font-weight: bold;">₹${itemTotal.toFixed(2)}</span>
            </div>
            <button
              onclick="removeFromCart(${index}, event)"
              style="
                background: #ef4444;
                color: white;
                border: none;
                border-radius: 4px;
                padding: 6px 8px;
                cursor: pointer;
                font-size: 12px;
                transition: all 0.2s ease;
                min-width: 24px;
                height: 24px;
                display: flex;
                align-items: center;
                justify-content: center;
              "
              onmouseover="this.style.background='#dc2626'"
              onmouseout="this.style.background='#ef4444'"
              title="Remove item from cart"
            >
              🗑️
            </button>
          </div>

          <!-- Price per unit -->
          <div style="margin-bottom: 8px;">
            <small style="color: #64748b;">₹${item.price.toFixed(2)} each</small>
          </div>

          <!-- Quantity Controls Row -->
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="color: #64748b; font-size: 14px;">Quantity:</span>
              <button
                onclick="decreaseCartQuantity(${index}, event)"
                style="
                  background: #f8f9fa;
                  border: 1px solid #dee2e6;
                  color: #6c757d;
                  width: 24px;
                  height: 24px;
                  border-radius: 4px;
                  cursor: pointer;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  font-weight: bold;
                  font-size: 14px;
                  transition: all 0.2s ease;
                "
                onmouseover="this.style.background='#e9ecef'"
                onmouseout="this.style.background='#f8f9fa'"
              >
                -
              </button>
              <span style="
                background: #fff;
                border: 1px solid #dee2e6;
                padding: 2px 8px;
                border-radius: 4px;
                font-weight: 600;
                color: #334155;
                min-width: 30px;
                text-align: center;
                font-size: 14px;
              ">
                ${item.quantity}
              </span>
              <button
                onclick="increaseCartQuantity(${index}, event)"
                style="
                  background: #f8f9fa;
                  border: 1px solid #dee2e6;
                  color: #6c757d;
                  width: 24px;
                  height: 24px;
                  border-radius: 4px;
                  cursor: pointer;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  font-weight: bold;
                  font-size: 14px;
                  transition: all 0.2s ease;
                "
                onmouseover="this.style.background='#e9ecef'"
                onmouseout="this.style.background='#f8f9fa'"
              >
                +
              </button>
            </div>
            <span style="color: #64748b; font-size: 14px;">${item.quantity} × ₹${item.price.toFixed(2)}</span>
          </div>
        </div>
      `;
    });

    cartList.innerHTML = html;
    if (cartTotal) cartTotal.textContent = total.toFixed(2);

    // Update cart footer with buttons
    updateCartFooter(total);
  }
}

// Update cart footer with total and buttons
function updateCartFooter(total) {
  console.log('🔄 Updating cart footer with total:', total);

  // Find the cart footer element (the div that contains the total and buttons)
  const cartFooter = document.querySelector('#cartDropdown > div:last-child');

  if (!cartFooter) {
    console.error('❌ Cart footer element not found!');
    return;
  }

  // Update the footer content
  cartFooter.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
      <strong style="color: #334155; font-size: 16px;">Total: ₹${total.toFixed(2)}</strong>
    </div>
    <div style="display: grid; gap: 8px;">
      <button
        onclick="clearCart()"
        style="
          width: 100%;
          background: #ef4444;
          color: white;
          border: none;
          border-radius: 6px;
          padding: 12px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        "
        onmouseover="this.style.background='#dc2626'"
        onmouseout="this.style.background='#ef4444'"
      >
        🗑️ Clear All
      </button>
      <button
        onclick="proceedToCheckout()"
        style="
          width: 100%;
          background: #00BFB3;
          color: white;
          border: none;
          border-radius: 6px;
          padding: 12px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        "
        onmouseover="this.style.background='#00A693'"
        onmouseout="this.style.background='#00BFB3'"
      >
        🛒 Proceed to Checkout
      </button>
    </div>
  `;
}

// Cart quantity control functions
function increaseCartQuantity(index, event) {
  // Prevent event bubbling to avoid closing cart
  if (event) {
    event.stopPropagation();
    event.preventDefault();
  }

  if (index >= 0 && index < myCart.length) {
    myCart[index].quantity += 1;
    updateCartBadge();
    updateCartDisplay();
    saveCartToStorage();
    showSuccessMessage(`Increased ${myCart[index].name} quantity to ${myCart[index].quantity}`);
  }
}

function decreaseCartQuantity(index, event) {
  // Prevent event bubbling to avoid closing cart
  if (event) {
    event.stopPropagation();
    event.preventDefault();
  }

  if (index >= 0 && index < myCart.length) {
    if (myCart[index].quantity > 1) {
      myCart[index].quantity -= 1;
      updateCartBadge();
      updateCartDisplay();
      saveCartToStorage();
      showSuccessMessage(`Decreased ${myCart[index].name} quantity to ${myCart[index].quantity}`);
    } else {
      removeFromCart(index);
    }
  }
}

// Remove item from cart
function removeFromCart(index, event) {
  // Prevent event bubbling to avoid closing cart
  if (event) {
    event.stopPropagation();
    event.preventDefault();
  }

  if (index >= 0 && index < myCart.length) {
    const removedItem = myCart[index];
    myCart.splice(index, 1);
    updateCartBadge();
    updateCartDisplay();
    saveCartToStorage();
    showSuccessMessage('Removed ' + removedItem.name + ' from cart');
  }
}

// Clear entire cart
function clearCart() {
  if (myCart.length === 0) {
    showErrorMessage('Cart is already empty');
    return;
  }

  myCart = [];
  updateCartBadge();
  updateCartDisplay();
  saveCartToStorage();

  // Force update all total displays to 0
  const cartTotalElements = document.querySelectorAll('#cartTotalAmount, [id*="cartTotal"], [id*="total"]');
  cartTotalElements.forEach(element => {
    if (element) element.textContent = '0.00';
  });

  showSuccessMessage('Cart cleared successfully!');
}

// Checkout function
function proceedToCheckout() {
  if (myCart.length === 0) {
    showErrorMessage('Your cart is empty! Add some items first.');
    return;
  }

  const total = myCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const itemCount = myCart.reduce((sum, item) => sum + item.quantity, 0);

  showSuccessMessage(`Proceeding to checkout with ${itemCount} items (₹${total.toFixed(2)})`);

  // Close cart dropdown
  const cartDropdown = document.getElementById('cartDropdown');
  if (cartDropdown) {
    cartDropdown.style.display = 'none';
    isCartOpen = false;
  }
}

// Success and error message functions
function showSuccessMessage(message) {
  console.log('✅', message);
  showToast(message, 'success');
}

function showErrorMessage(message) {
  console.log('❌', message);
  showToast(message, 'error');
}

// Toast notification function
function showToast(message, type = 'success') {
  // Create toast element
  const toast = document.createElement('div');
  const bgColor = type === 'success' ? '#22c55e' : type === 'error' ? '#ef4444' : '#3b82f6';
  const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️';

  toast.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${bgColor};
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 10000;
    font-weight: 500;
    max-width: 300px;
    word-wrap: break-word;
    display: flex;
    align-items: center;
    gap: 8px;
    animation: slideInRight 0.3s ease;
    font-family: 'Inter', sans-serif;
  `;

  toast.innerHTML = `
    <span style="font-size: 16px;">${icon}</span>
    <span>${message}</span>
  `;

  // Add animation keyframes if not already added
  if (!document.getElementById('toast-animation-styles')) {
    const style = document.createElement('style');
    style.id = 'toast-animation-styles';
    style.textContent = `
      @keyframes slideInRight {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      @keyframes slideOutRight {
        from {
          transform: translateX(0);
          opacity: 1;
        }
        to {
          transform: translateX(100%);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);
  }

  document.body.appendChild(toast);

  // Auto-remove after 3 seconds with slide out animation
  setTimeout(() => {
    toast.style.animation = 'slideOutRight 0.3s ease';
    setTimeout(() => {
      if (toast.parentNode) {
        toast.remove();
      }
    }, 300);
  }, 3000);
}

// Test function to manually open cart
function testOpenCart() {
  console.log('🧪 Testing cart open...');
  const dropdown = document.getElementById('cartDropdown');
  if (dropdown) {
    dropdown.style.display = 'block';
    isCartOpen = true;
    updateCartDisplay();
    console.log('✅ Cart manually opened for testing');
  } else {
    console.error('❌ Cart dropdown not found for testing');
  }
}

// Debug function to check cart state
function debugCartState() {
  console.log('=== CART DEBUG INFO ===');
  console.log('myCart array:', myCart);
  console.log('myCart length:', myCart.length);
  console.log('localStorage cureMateCart:', localStorage.getItem('cureMateCart'));
  console.log('localStorage shoppingCart:', localStorage.getItem('shoppingCart'));
  console.log('Total items in myCart:', myCart.reduce((sum, item) => sum + item.quantity, 0));

  // Check all total display elements
  const totalElements = document.querySelectorAll('#cartTotalAmount, [id*="cartTotal"], [id*="total"]');
  console.log('Total display elements found:', totalElements.length);
  totalElements.forEach((element, index) => {
    console.log(`Total element ${index}:`, element.id, '=', element.textContent);
  });

  console.log('========================');
}

// Function to clear all cart data (for debugging)
function clearAllCartData() {
  console.log('🗑️ Clearing all cart data...');
  myCart = [];
  localStorage.removeItem('cureMateCart');
  localStorage.removeItem('shoppingCart');
  updateCartBadge();
  updateCartDisplay();
  console.log('✅ All cart data cleared');
}

// Function to force refresh cart display and badge
function forceRefreshCart() {
  console.log('🔄 Force refreshing cart...');
  loadCartFromStorage();
  updateCartBadge();
  updateCartDisplay();
  debugCartState();
}

// Initialize cart on page load
document.addEventListener('DOMContentLoaded', function() {
  console.log('🛒 Health Cart system initialized');
  console.log('📄 Current page:', window.location.pathname);

  loadCartFromStorage();
  updateCartBadge();
  updateCartDisplay();

  // Debug cart state
  debugCartState();

  // Test cart elements
  console.log('🔍 Testing cart elements...');
  console.log('cartIcon:', document.getElementById('cartIcon'));
  console.log('cartDropdown:', document.getElementById('cartDropdown'));
  console.log('cartBadge:', document.getElementById('cartBadge'));
  console.log('cartItemsList:', document.getElementById('cartItemsList'));
  console.log('cartTotalAmount:', document.getElementById('cartTotalAmount'));
  console.log('cartItemCount:', document.getElementById('cartItemCount'));

  // Close cart when clicking outside
  document.addEventListener('click', function(event) {
    const cartIcon = document.getElementById('cartIcon');
    const cartDropdown = document.getElementById('cartDropdown');

    if (isCartOpen && cartIcon && cartDropdown) {
      if (!cartIcon.contains(event.target) && !cartDropdown.contains(event.target)) {
        isCartOpen = false;
        cartDropdown.style.display = 'none';
        console.log('🔒 Cart closed by clicking outside');
      }
    }
  });
});

// Make functions globally available
window.toggleCartDropdown = toggleCartDropdown;
window.addToSimpleCart = addToSimpleCart;
window.addToCartWithQuantity = addToCartWithQuantity;
window.increaseQuantity = increaseQuantity;
window.decreaseQuantity = decreaseQuantity;
window.increaseCartQuantity = increaseCartQuantity;
window.decreaseCartQuantity = decreaseCartQuantity;
window.removeFromCart = removeFromCart;
window.clearCart = clearCart;
window.proceedToCheckout = proceedToCheckout;
window.testOpenCart = testOpenCart;
window.debugCartState = debugCartState;
window.clearAllCartData = clearAllCartData;
window.forceRefreshCart = forceRefreshCart;
