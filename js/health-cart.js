// Health Concern Pages Cart System (Same as Home Page)

// Global cart variables with localStorage persistence
let myCart = [];
let isCartOpen = false;

// Load cart from localStorage on page load
function loadCartFromStorage() {
  try {
    const cureMateCart = localStorage.getItem('cureMateCart');
    const shoppingCart = localStorage.getItem('shoppingCart');

    if (cureMateCart) {
      const parsedCart = JSON.parse(cureMateCart);
      if (Array.isArray(parsedCart) && parsedCart.every(item =>
        item.name && typeof item.price === 'number' && typeof item.quantity === 'number'
      )) {
        myCart = parsedCart;
      } else {
        localStorage.removeItem('cureMateCart');
        myCart = [];
      }
    } else if (shoppingCart) {
      const parsedCart = JSON.parse(shoppingCart);
      if (Array.isArray(parsedCart) && parsedCart.every(item =>
        item.name && typeof item.price === 'number' && typeof item.quantity === 'number'
      )) {
        myCart = parsedCart;
        saveCartToStorage();
        localStorage.removeItem('shoppingCart');
      } else {
        localStorage.removeItem('shoppingCart');
        myCart = [];
      }
    } else {
      myCart = [];
    }
  } catch (error) {
    localStorage.removeItem('cureMateCart');
    localStorage.removeItem('shoppingCart');
    myCart = [];
  }
}

// Save cart to localStorage
function saveCartToStorage() {
  try {
    localStorage.setItem('cureMateCart', JSON.stringify(myCart));
  } catch (error) {
    // Silent error handling
  }
}

// Main cart toggle function
function toggleCartDropdown() {
  const dropdown = document.getElementById('cartDropdown');
  
  if (!dropdown) {
    return;
  }

  if (isCartOpen) {
    dropdown.style.display = 'none';
    isCartOpen = false;
  } else {
    dropdown.style.display = 'block';
    isCartOpen = true;
    loadCartFromStorage();
    updateCartDisplay();
  }
}

// Add item to cart function
function addToSimpleCart(name, price, image) {
  try {
    const existingItem = myCart.find(item => item.name === name);
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      myCart.push({
        name: name,
        price: parseFloat(price),
        image: image || 'img/placeholder.jpg',
        quantity: 1
      });
    }

    updateCartBadge();
    updateCartDisplay();
    saveCartToStorage();
    showSuccessMessage('Added ' + name + ' to cart!');
  } catch (error) {
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

  try {
    const existingItem = myCart.find(item => item.name === name);
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      myCart.push({
        name: name,
        price: parseFloat(price),
        image: image || 'img/placeholder.jpg',
        quantity: quantity
      });
    }

    updateCartBadge();
    updateCartDisplay();
    saveCartToStorage();

    if (quantityInput) {
      quantityInput.value = 1;
    }

    showSuccessMessage(`Added ${quantity} x ${name} to cart!`);
  } catch (error) {
    showErrorMessage('Error adding to cart');
  }
}

// Update cart badge
function updateCartBadge() {
  const badge = document.getElementById('cartBadge');
  if (!badge) {
    return;
  }

  const totalItems = myCart.reduce((sum, item) => sum + item.quantity, 0);
  badge.textContent = totalItems;
  badge.style.display = totalItems > 0 ? 'flex' : 'none';

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

  if (!cartList || !cartTotal) {
    return;
  }

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
    cartTotal.textContent = '0.00';
    // Update footer even when empty to ensure proper state
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
              onclick="event.stopPropagation(); removeFromCart(${index})"
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
                onclick="event.stopPropagation(); decreaseCartQuantity(${index})"
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
                onclick="increaseCartQuantity(${index})"
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

    // Direct DOM update
    cartList.innerHTML = html;
    
    cartTotal.textContent = total.toFixed(2);

    // Update cart footer with buttons
    updateCartFooter(total);
  }
}

// Update cart footer with total and buttons
function updateCartFooter(total) {
  const cartFooter = document.querySelector('#cartDropdown > div:last-child');

  if (!cartFooter) {
    return;
  }

  // Update the footer content
  cartFooter.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
      <strong style="color: #334155; font-size: 16px;">Total: ₹<span id="cartTotalAmount">${total.toFixed(2)}</span></strong>
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
function increaseCartQuantity(index) {
  if (index >= 0 && index < myCart.length) {
    myCart[index].quantity += 1;
    updateCartBadge();
    updateCartDisplay();
    saveCartToStorage();
    showSuccessMessage(`Increased ${myCart[index].name} quantity to ${myCart[index].quantity}`);
  }
}

function decreaseCartQuantity(index) {
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

// Remove item from cart - FIXED: No auto-close behavior
function removeFromCart(index) {
  if (index >= 0 && index < myCart.length) {
    const removedItem = myCart[index];
    myCart.splice(index, 1);
    
    updateCartBadge();
    updateCartDisplay();
    saveCartToStorage();
    
    // REMOVED: Auto-close behavior - cart stays open for better UX
    // Users can manually close the cart when they want to
    
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
  
  // Auto-close cart after clearing
  setTimeout(() => {
    const cartDropdown = document.getElementById('cartDropdown');
    if (cartDropdown && isCartOpen) {
      cartDropdown.style.display = 'none';
      isCartOpen = false;
    }
  }, 1000);
  
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

  showSuccessMessage(`🛒 Proceeding to checkout with ${itemCount} items (₹${total.toFixed(2)})`);

  // Close cart dropdown
  const cartDropdown = document.getElementById('cartDropdown');
  if (cartDropdown) {
    cartDropdown.style.display = 'none';
    isCartOpen = false;
  }
}

// Success and error message functions
function showSuccessMessage(message) {
  showToast(message, 'success');
}

function showErrorMessage(message) {
  showToast(message, 'error');
}

// Simple toast notification system
function showToast(message, type = 'success') {
  // Remove any existing toast
  const existingToast = document.getElementById('cartToast');
  if (existingToast) {
    existingToast.remove();
  }

  // Create toast element
  const toast = document.createElement('div');
  toast.id = 'cartToast';
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${type === 'success' ? '#10b981' : '#ef4444'};
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    z-index: 10000;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    transform: translateX(100%);
    transition: transform 0.3s ease;
    max-width: 300px;
    word-wrap: break-word;
  `;
  
  toast.textContent = message;
  document.body.appendChild(toast);

  // Animate in
  setTimeout(() => {
    toast.style.transform = 'translateX(0)';
  }, 10);

  // Animate out and remove
  setTimeout(() => {
    toast.style.transform = 'translateX(100%)';
    setTimeout(() => {
      if (toast.parentNode) {
        toast.remove();
      }
    }, 300);
  }, 3000);
}



// Initialize cart on page load
document.addEventListener('DOMContentLoaded', function() {
  loadCartFromStorage();
  updateCartBadge();
  updateCartDisplay();

  // FIXED: Close cart when clicking outside (improved logic)
  document.addEventListener('click', function(event) {
    if (!isCartOpen) return; // Don't do anything if cart is already closed
    
    const cartIcon = document.getElementById('cartIcon');
    const cartDropdown = document.getElementById('cartDropdown');
    
    if (!cartIcon || !cartDropdown) return;

    // Check if the click is inside the cart dropdown or on the cart icon
    const clickedInsideCart = cartDropdown.contains(event.target);
    const clickedOnCartIcon = cartIcon.contains(event.target);
    
    // Only close if clicked completely outside both cart and icon
    if (!clickedInsideCart && !clickedOnCartIcon) {
      isCartOpen = false;
      cartDropdown.style.display = 'none';
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
