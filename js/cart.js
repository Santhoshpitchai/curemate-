// Cart Management System for Curemate Health Hub

// Global cart variables
let cart = JSON.parse(localStorage.getItem('shoppingCart')) || [];
let isCartOpen = false;

// Initialize cart when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing cart system...');
    initializeCart();
    setupQuantityControls();
    setupCartToggle();

    // Retry setup after a short delay if elements aren't found initially
    setTimeout(function() {
        if (!document.getElementById('cartIcon')) {
            console.log('Retrying cart setup...');
            setupCartToggle();
        }
    }, 500);
});

// Initialize cart system
function initializeCart() {
    updateCartDisplay();
    updateCartBadge();
    console.log('Cart initialized with', cart.length, 'items');
}

// Setup quantity control buttons
function setupQuantityControls() {
    // Setup all quantity increase buttons
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('quantity-btn') && e.target.textContent === '+') {
            const input = e.target.previousElementSibling;
            if (input && input.classList.contains('quantity-input')) {
                const currentValue = parseInt(input.value) || 1;
                const maxValue = parseInt(input.getAttribute('max')) || 10;
                if (currentValue < maxValue) {
                    input.value = currentValue + 1;
                }
            }
        }
        
        // Setup quantity decrease buttons
        if (e.target.classList.contains('quantity-btn') && e.target.textContent === '-') {
            const input = e.target.nextElementSibling;
            if (input && input.classList.contains('quantity-input')) {
                const currentValue = parseInt(input.value) || 1;
                const minValue = parseInt(input.getAttribute('min')) || 1;
                if (currentValue > minValue) {
                    input.value = currentValue - 1;
                }
            }
        }
    });
}

// Quantity control functions (called from HTML)
function increaseQuantity(inputId) {
    const input = document.getElementById(inputId);
    if (input) {
        const currentValue = parseInt(input.value) || 1;
        const maxValue = parseInt(input.getAttribute('max')) || 10;
        if (currentValue < maxValue) {
            input.value = currentValue + 1;
        }
    }
}

function decreaseQuantity(inputId) {
    const input = document.getElementById(inputId);
    if (input) {
        const currentValue = parseInt(input.value) || 1;
        const minValue = parseInt(input.getAttribute('min')) || 1;
        if (currentValue > minValue) {
            input.value = currentValue - 1;
        }
    }
}

// Add to cart with quantity
function addToCartWithQuantity(name, price, image, quantityInputId) {
    const quantityInput = document.getElementById(quantityInputId);
    const quantity = quantityInput ? parseInt(quantityInput.value) || 1 : 1;
    
    const product = {
        id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
        name: name,
        price: price,
        image: image,
        quantity: quantity
    };
    
    addToCart(product);
    
    // Reset quantity to 1 after adding
    if (quantityInput) {
        quantityInput.value = 1;
    }
    
    // Show success message
    showToast(`Added ${quantity}x ${name} to cart!`);
}

// Add product to cart
function addToCart(product) {
    // Check if product already exists in cart
    const existingItemIndex = cart.findIndex(item => item.name === product.name);
    
    if (existingItemIndex > -1) {
        // Update quantity of existing item
        cart[existingItemIndex].quantity += product.quantity;
    } else {
        // Add new item to cart
        cart.push(product);
    }
    
    saveCart();
    updateCartDisplay();
    updateCartBadge();
    
    console.log('Product added to cart:', product);
    console.log('Current cart:', cart);
}

// Remove item from cart
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    updateCartDisplay();
    updateCartBadge();
    showToast('Item removed from cart');
}

// Update item quantity in cart
function updateCartQuantity(productId, newQuantity) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        if (newQuantity <= 0) {
            removeFromCart(productId);
        } else {
            item.quantity = newQuantity;
            saveCart();
            updateCartDisplay();
            updateCartBadge();
        }
    }
}

// Clear entire cart
function clearCart() {
    cart = [];
    saveCart();
    updateCartDisplay();
    updateCartBadge();
    showToast('Cart cleared successfully');
}

// Save cart to localStorage
function saveCart() {
    localStorage.setItem('shoppingCart', JSON.stringify(cart));
}

// Setup cart toggle functionality
function setupCartToggle() {
    const cartIcon = document.getElementById('cartIcon');
    console.log('Setting up cart toggle, cartIcon found:', !!cartIcon);

    if (cartIcon) {
        // Remove any existing event listeners
        cartIcon.removeEventListener('click', toggleCartDropdown);
        // Add new event listener
        cartIcon.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Cart icon clicked!');
            toggleCartDropdown();
        });
        console.log('Cart icon event listener added successfully');
    } else {
        console.error('Cart icon not found! Make sure element with id="cartIcon" exists');
    }
}

// Toggle cart dropdown
function toggleCartDropdown() {
    console.log('toggleCartDropdown called, isCartOpen:', isCartOpen);

    const cartDropdown = document.getElementById('cartDropdown');
    console.log('Cart dropdown element found:', !!cartDropdown);

    if (!cartDropdown) {
        console.error('Cart dropdown not found! Make sure element with id="cartDropdown" exists');
        return;
    }

    if (isCartOpen) {
        console.log('Closing cart dropdown');
        cartDropdown.style.display = 'none';
        isCartOpen = false;
    } else {
        console.log('Opening cart dropdown');
        cartDropdown.style.display = 'block';
        isCartOpen = true;
        updateCartDropdownDisplay();
    }

    console.log('Cart dropdown display style:', cartDropdown.style.display);
}

// Update cart badge
function updateCartBadge() {
    const cartBadge = document.getElementById('cartBadge');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    if (cartBadge) {
        cartBadge.textContent = totalItems;
        cartBadge.style.display = totalItems > 0 ? 'inline-block' : 'none';
    }
}

// Update cart display (for modal/main cart view)
function updateCartDisplay() {
    updateCartDropdownDisplay();
    updateCartBadge();
}

// Update cart dropdown display
function updateCartDropdownDisplay() {
    console.log('Updating cart dropdown display...');

    const cartItemsList = document.getElementById('cartItemsList');
    const cartTotalAmount = document.getElementById('cartTotalAmount');
    const cartItemCount = document.getElementById('cartItemCount');

    console.log('Cart elements found:', {
        cartItemsList: !!cartItemsList,
        cartTotalAmount: !!cartTotalAmount,
        cartItemCount: !!cartItemCount
    });

    if (!cartItemsList || !cartTotalAmount) {
        console.error('Required cart elements not found!');
        return;
    }
    
    // Update item count
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    if (cartItemCount) {
        cartItemCount.textContent = `${totalItems} item${totalItems !== 1 ? 's' : ''}`;
    }
    
    // Calculate total
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartTotalAmount.textContent = total.toFixed(2);
    
    // Display cart items
    if (cart.length === 0) {
        cartItemsList.innerHTML = '<p class="text-center text-muted">Your cart is empty</p>';
    } else {
        cartItemsList.innerHTML = cart.map(item => `
            <div class="cart-item d-flex align-items-center mb-3 pb-3 border-bottom">
                <img src="${item.image}" alt="${item.name}" class="me-3" style="width: 50px; height: 50px; object-fit: cover; border-radius: 8px;">
                <div class="flex-grow-1">
                    <h6 class="mb-1 small">${item.name}</h6>
                    <div class="d-flex align-items-center justify-content-between">
                        <span class="text-muted small">₹${item.price} × ${item.quantity}</span>
                        <div class="d-flex align-items-center">
                            <button class="btn btn-sm btn-outline-secondary me-2" onclick="updateCartQuantity('${item.id}', ${item.quantity - 1})" style="width: 25px; height: 25px; padding: 0; font-size: 12px;">-</button>
                            <span class="mx-2 small">${item.quantity}</span>
                            <button class="btn btn-sm btn-outline-secondary me-2" onclick="updateCartQuantity('${item.id}', ${item.quantity + 1})" style="width: 25px; height: 25px; padding: 0; font-size: 12px;">+</button>
                            <button class="btn btn-sm btn-outline-danger" onclick="removeFromCart('${item.id}')" style="width: 25px; height: 25px; padding: 0; font-size: 12px;">×</button>
                        </div>
                    </div>
                    <div class="fw-bold small text-primary">₹${(item.price * item.quantity).toFixed(2)}</div>
                </div>
            </div>
        `).join('');
    }
}

// Proceed to checkout
function proceedToCheckout() {
    if (cart.length === 0) {
        showToast('Your cart is empty!', 'error');
        return;
    }
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    // For now, show a simple alert. In a real app, this would redirect to checkout page
    alert(`🛒 Proceeding to Checkout\n\nItems: ${itemCount}\nTotal: ₹${total.toFixed(2)}\n\nThis would redirect to the checkout page in a real application.`);
    
    // Close cart dropdown
    const cartDropdown = document.getElementById('cartDropdown');
    if (cartDropdown) {
        cartDropdown.style.display = 'none';
        isCartOpen = false;
    }
}

// Show toast notification
function showToast(message, type = 'success') {
    // Create toast container if it doesn't exist
    let toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3';
        toastContainer.style.zIndex = '9999';
        document.body.appendChild(toastContainer);
    }
    
    // Create toast element
    const toastEl = document.createElement('div');
    toastEl.className = `toast align-items-center text-white bg-${type === 'success' ? 'success' : 'danger'} border-0`;
    toastEl.setAttribute('role', 'alert');
    toastEl.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">${message}</div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
        </div>
    `;
    
    toastContainer.appendChild(toastEl);
    
    // Initialize and show toast
    const toast = new bootstrap.Toast(toastEl, { autohide: true, delay: 3000 });
    toast.show();
    
    // Remove toast element after it's hidden
    toastEl.addEventListener('hidden.bs.toast', function() {
        this.remove();
    });
}

// Close cart dropdown when clicking outside
document.addEventListener('click', function(event) {
    const cartIcon = document.getElementById('cartIcon');
    const cartDropdown = document.getElementById('cartDropdown');
    
    if (isCartOpen && cartIcon && cartDropdown) {
        if (!cartIcon.contains(event.target) && !cartDropdown.contains(event.target)) {
            cartDropdown.style.display = 'none';
            isCartOpen = false;
        }
    }
});

// Global fallback function for direct HTML calls
function openCart() {
    console.log('openCart() called as fallback');
    toggleCartDropdown();
}

// Manual test function to check if cart elements exist
function testCartElements() {
    console.log('=== CART ELEMENTS TEST ===');
    console.log('cartIcon:', document.getElementById('cartIcon'));
    console.log('cartBadge:', document.getElementById('cartBadge'));
    console.log('cartDropdown:', document.getElementById('cartDropdown'));
    console.log('cartItemsList:', document.getElementById('cartItemsList'));
    console.log('cartTotalAmount:', document.getElementById('cartTotalAmount'));
    console.log('cartItemCount:', document.getElementById('cartItemCount'));
    console.log('=== END TEST ===');
}

// Make functions globally available
window.increaseQuantity = increaseQuantity;
window.decreaseQuantity = decreaseQuantity;
window.addToCartWithQuantity = addToCartWithQuantity;
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.updateCartQuantity = updateCartQuantity;
window.clearCart = clearCart;
window.toggleCartDropdown = toggleCartDropdown;
window.openCart = openCart;
window.proceedToCheckout = proceedToCheckout;
window.testCartElements = testCartElements;

// Also try to setup cart immediately if DOM is already loaded
if (document.readyState === 'loading') {
    console.log('DOM still loading, waiting for DOMContentLoaded...');
} else {
    console.log('DOM already loaded, setting up cart immediately...');
    setTimeout(function() {
        initializeCart();
        setupQuantityControls();
        setupCartToggle();
    }, 100);
}

console.log('Cart system loaded successfully');
