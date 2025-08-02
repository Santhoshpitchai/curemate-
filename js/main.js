// Curemate Health Hub - Main JavaScript

// Import Supabase client
import { createClient } from 'https://cdn.skypack.dev/@supabase/supabase-js@2'

// Initialize Supabase client
const supabaseUrl = 'https://vahhmwunmhkudepqxrir.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZhaGhtd3VubWhrdWRlcHF4cmlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5NDYyNDQsImV4cCI6MjA2OTUyMjI0NH0.SYiCgyv24BPrQfOT3JzkypsNT_fdrthwRMIdunrdLqg'
const supabase = createClient(supabaseUrl, supabaseKey)

// Make supabase available globally
window.supabase = supabase

document.addEventListener('DOMContentLoaded', function() {
  // Initialize tooltips
  const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
  tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl);
  });

  // Initialize popovers
  const popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
  popoverTriggerList.map(function (popoverTriggerEl) {
    return new bootstrap.Popover(popoverTriggerEl);
  });

  // Initialize cart
  initializeCart();

  // Setup cart icon click handler
  setupCartIcon();

  // Add direct event listener to cart button as backup
  const cartButton = document.getElementById('cartButton');
  if (cartButton) {
    cartButton.addEventListener('click', function() {
      console.log('Cart button clicked via event listener!');
      openCartModal();
    });
  }

  // Add to Cart functionality - Wait for DOM to be fully loaded
  setTimeout(() => {
    setupAddToCartButtons();
  }, 100);

  // Mobile menu toggle
  const navbarToggler = document.querySelector('.navbar-toggler');
  if (navbarToggler) {
    navbarToggler.addEventListener('click', function() {
      this.classList.toggle('active');
    });
  }

  // Carousel auto-play configuration
  const carousels = document.querySelectorAll('.carousel');
  carousels.forEach(carousel => {
    new bootstrap.Carousel(carousel, {
      interval: 5000,
      wrap: true
    });
  });

  // Scroll animations
  const animatedElements = document.querySelectorAll('.animate-fade-in, .animate-slide-up, .animate-bounce-in');
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  
  animatedElements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
  });

  // Newsletter subscription
  const newsletterForm = document.querySelector('.footer .input-group');
  if (newsletterForm) {
    const subscribeButton = newsletterForm.querySelector('button');
    const emailInput = newsletterForm.querySelector('input[type="email"]');
    
    subscribeButton.addEventListener('click', function() {
      if (emailInput.value && isValidEmail(emailInput.value)) {
        showToast('Thank you for subscribing to our newsletter!');
        emailInput.value = '';
      } else {
        showToast('Please enter a valid email address', 'error');
      }
    });
  }

  // Search functionality placeholder
  const searchForm = document.querySelector('.search-form');
  if (searchForm) {
    searchForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const searchInput = this.querySelector('input').value;
      if (searchInput.trim() !== '') {
        showToast(`Searching for: ${searchInput}`);
      }
    });
  }

  // Helper function to show toast notifications
  function showToast(message, type = 'success') {
    // Create toast container if it doesn't exist
    let toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) {
      toastContainer = document.createElement('div');
      toastContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3';
      document.body.appendChild(toastContainer);
    }
    
    // Create toast element
    const toastEl = document.createElement('div');
    toastEl.className = `toast align-items-center text-white bg-${type === 'success' ? 'primary' : 'danger'} border-0`;
    toastEl.setAttribute('role', 'alert');
    toastEl.setAttribute('aria-live', 'assertive');
    toastEl.setAttribute('aria-atomic', 'true');
    
    // Create toast body
    const toastBody = document.createElement('div');
    toastBody.className = 'd-flex';
    
    const toastBodyContent = document.createElement('div');
    toastBodyContent.className = 'toast-body';
    toastBodyContent.textContent = message;
    
    const closeButton = document.createElement('button');
    closeButton.type = 'button';
    closeButton.className = 'btn-close btn-close-white me-2 m-auto';
    closeButton.setAttribute('data-bs-dismiss', 'toast');
    closeButton.setAttribute('aria-label', 'Close');
    
    toastBody.appendChild(toastBodyContent);
    toastBody.appendChild(closeButton);
    toastEl.appendChild(toastBody);
    toastContainer.appendChild(toastEl);
    
    // Initialize and show toast
    const toast = new bootstrap.Toast(toastEl, {
      autohide: true,
      delay: 3000
    });
    toast.show();
    
    // Remove toast element after it's hidden
    toastEl.addEventListener('hidden.bs.toast', function() {
      this.remove();
    });
  }

  // Helper function to validate email
  function isValidEmail(email) {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  }

  // Fix for :contains selector which jQuery has but vanilla JS doesn't
  function addContainsSelector() {
    // Polyfill for :contains selector
    if (!Element.prototype.matches) {
      Element.prototype.matches = Element.prototype.msMatchesSelector || Element.prototype.webkitMatchesSelector;
    }
    
    document.querySelectorAll = (function(querySelectorAll) {
      return function(selector) {
        if (selector.includes(':contains(')) {
          const match = selector.match(/:contains\(["']([^"']*)["']\)/);
          if (match) {
            const text = match[1];
            const newSelector = selector.replace(/:contains\(["'][^"']*["']\)/, '');
            const elements = querySelectorAll.call(this, newSelector);
            return Array.from(elements).filter(el => el.textContent.includes(text));
          }
        }
        return querySelectorAll.call(this, selector);
      };
    })(document.querySelectorAll);
  }
  
  // Try to add the contains selector, but fallback gracefully if it fails
  try {
    addContainsSelector();
  } catch (e) {
    console.warn('Could not add :contains selector. Some functionality might be limited.');

    // Setup Add to Cart buttons
    setupAddToCartButtons();
  }

  // Authentication functionality
  initializeAuth();

  // Initialize demo data
  initializeDemoUsers();

  // Setup click outside to close cart
  document.addEventListener('click', function(event) {
    const cartIcon = document.getElementById('cartIcon');
    const cartDropdown = document.getElementById('cartDropdown');

    if (isCartOpen && cartIcon && cartDropdown) {
      if (!cartIcon.contains(event.target) && !cartDropdown.contains(event.target)) {
        isCartOpen = false;
        cartDropdown.style.display = 'none';
      }
    }
  });

  // Test cart functionality
  console.log('Simple cart system initialized');
  console.log('Cart button element:', document.getElementById('cartButton'));
  console.log('Cart dropdown element:', document.getElementById('cartDropdown'));
});

// Function to close modal (used by vendor signup link)
function closeModal() {
  const loginModal = bootstrap.Modal.getInstance(document.getElementById('loginModal'));
  if (loginModal) {
    loginModal.hide();
  }
}

// Function to switch from login to signup modal
function switchToSignup() {
  const loginModal = bootstrap.Modal.getInstance(document.getElementById('loginModal'));
  const signupModal = new bootstrap.Modal(document.getElementById('signupModal'));

  if (loginModal) {
    loginModal.hide();
  }

  setTimeout(() => {
    signupModal.show();
  }, 300);
}

// Function to switch from signup to login modal
function switchToLogin() {
  const signupModal = bootstrap.Modal.getInstance(document.getElementById('signupModal'));
  const loginModal = new bootstrap.Modal(document.getElementById('loginModal'));

  if (signupModal) {
    signupModal.hide();
  }

  setTimeout(() => {
    loginModal.show();
  }, 300);
}

// Authentication System
function initializeAuth() {
  // Check if user is already logged in
  const currentUser = getCurrentUser();
  if (currentUser) {
    updateUIForLoggedInUser(currentUser);
  }

  // Login type switching
  const loginTypeRadios = document.querySelectorAll('input[name="loginType"]');
  loginTypeRadios.forEach(radio => {
    radio.addEventListener('change', function() {
      const customerForm = document.getElementById('customerLoginForm');
      const vendorForm = document.getElementById('vendorLoginForm');

      if (this.value === 'customer') {
        customerForm.style.display = 'block';
        vendorForm.style.display = 'none';
      } else {
        customerForm.style.display = 'none';
        vendorForm.style.display = 'block';
      }
    });
  });

  // Customer login form handler
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }

  // Vendor login form handler (from modal)
  const vendorLoginFormModal = document.getElementById('vendorLoginFormModal');
  if (vendorLoginFormModal) {
    vendorLoginFormModal.addEventListener('submit', handleVendorLoginModal);
  }

  // Signup form handler
  const signupForm = document.getElementById('signupForm');
  if (signupForm) {
    signupForm.addEventListener('submit', handleSignup);
  }

  // Password confirmation validation
  const confirmPassword = document.getElementById('confirmPassword');
  const signupPassword = document.getElementById('signupPassword');
  if (confirmPassword && signupPassword) {
    confirmPassword.addEventListener('input', function() {
      if (this.value !== signupPassword.value) {
        this.setCustomValidity('Passwords do not match');
      } else {
        this.setCustomValidity('');
      }
    });
  }
}

async function handleLogin(e) {
  e.preventDefault();

  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;
  const rememberMe = document.getElementById('rememberMe').checked;

  try {
    // Show loading state
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin me-2"></i>Logging in...';
    submitBtn.disabled = true;

    // Authenticate with Supabase
    const result = await window.supabaseService.authenticateUser(email, password);

    if (result.success) {
      // Store user session
      window.supabaseService.setUserSession(result.user, rememberMe);

      // Update UI
      updateUIForLoggedInUser(result.user);

      // Close modal
      const loginModal = bootstrap.Modal.getInstance(document.getElementById('loginModal'));
      loginModal.hide();

      // Show success message
      const userName = result.user.first_name || result.user.email;
      showToast(`Welcome back, ${userName}!`);

      // Reset form
      document.getElementById('loginForm').reset();
    } else {
      showToast(result.message || 'Invalid email or password. Please try again.', 'error');
    }

    // Restore button state
    submitBtn.innerHTML = originalText;
    submitBtn.disabled = false;

  } catch (error) {
    console.error('Login error:', error);
    showToast('Login failed. Please try again.', 'error');

    // Restore button state
    const submitBtn = e.target.querySelector('button[type="submit"]');
    submitBtn.innerHTML = '<i class="fa-solid fa-sign-in-alt me-2"></i>Login';
    submitBtn.disabled = false;
  }
}

async function handleSignup(e) {
  e.preventDefault();

  const name = document.getElementById('signupName').value;
  const email = document.getElementById('signupEmail').value;
  const password = document.getElementById('signupPassword').value;
  const confirmPassword = document.getElementById('confirmPassword').value;

  // Validate passwords match
  if (password !== confirmPassword) {
    showToast('Passwords do not match', 'error');
    return;
  }

  try {
    // Show loading state
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin me-2"></i>Creating account...';
    submitBtn.disabled = true;

    // Check if user already exists
    const existingUser = await window.supabaseService.getUserByEmail(email);
    if (existingUser) {
      showToast('An account with this email already exists', 'error');
      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;
      return;
    }

    // Create new user in Supabase
    const userData = {
      name: name,
      firstName: name.split(' ')[0],
      lastName: name.split(' ').slice(1).join(' '),
      email: email,
      password: password // Note: In production, implement proper password hashing
    };

    const newUser = await window.supabaseService.createUser(userData);

    // Auto-login the new user
    window.supabaseService.setUserSession(newUser, false);

    // Update UI
    updateUIForLoggedInUser(newUser);

    // Close modal
    const signupModal = bootstrap.Modal.getInstance(document.getElementById('signupModal'));
    signupModal.hide();

    // Show success message
    const userName = newUser.first_name || newUser.email;
    showToast(`Welcome to Curemate, ${userName}!`);

    // Reset form
    document.getElementById('signupForm').reset();

    // Restore button state
    submitBtn.innerHTML = originalText;
    submitBtn.disabled = false;

  } catch (error) {
    console.error('Signup error:', error);
    showToast('Account creation failed. Please try again.', 'error');

    // Restore button state
    const submitBtn = e.target.querySelector('button[type="submit"]');
    submitBtn.innerHTML = '<i class="fa-solid fa-user-plus me-2"></i>Create Account';
    submitBtn.disabled = false;
  }
}

function handleVendorLoginModal(e) {
  e.preventDefault();

  const email = document.getElementById('vendorLoginEmail').value;
  const password = document.getElementById('vendorLoginPassword').value;
  const rememberMe = document.getElementById('vendorRememberMe').checked;

  // Get stored vendors
  const vendors = getStoredVendors();
  const vendor = vendors.find(v => v.email === email && v.password === password);

  if (vendor) {
    // Check if vendor is approved
    if (vendor.status !== 'approved') {
      showToast('Your vendor account is pending approval. Please wait for admin verification.', 'warning');
      return;
    }

    // Store vendor session
    if (rememberMe) {
      localStorage.setItem('currentVendor', JSON.stringify(vendor));
    } else {
      sessionStorage.setItem('currentVendor', JSON.stringify(vendor));
    }

    // Close modal
    const loginModal = bootstrap.Modal.getInstance(document.getElementById('loginModal'));
    loginModal.hide();

    // Show success message
    showToast(`Welcome back, ${vendor.businessName}!`, 'success');

    // Redirect to vendor dashboard
    setTimeout(() => {
      window.location.href = 'vendor-dashboard.html';
    }, 1500);

    // Reset form
    document.getElementById('vendorLoginFormModal').reset();
  } else {
    showToast('Invalid vendor email or password. Please try again.', 'error');
  }
}

// Helper functions for authentication
function getCurrentUser() {
  return window.supabaseService ? window.supabaseService.getCurrentUser() : null;
}

function getCurrentVendor() {
  return window.supabaseService ? window.supabaseService.getCurrentVendor() : null;
}

async function getStoredUsers() {
  if (window.supabaseService) {
    return await window.supabaseService.getAllUsers();
  }
  return JSON.parse(localStorage.getItem('users') || '[]');
}

async function getStoredVendors() {
  if (window.supabaseService) {
    return await window.supabaseService.getAllVendors();
  }
  return JSON.parse(localStorage.getItem('vendors') || '[]');
}

function updateUIForLoggedInUser(user) {
  const userAuthSection = document.getElementById('userAuthSection');
  if (userAuthSection) {
    const userName = user.first_name || user.name || user.email;
    userAuthSection.innerHTML = `
      <div class="dropdown">
        <button class="btn btn-primary dropdown-toggle d-flex align-items-center" type="button" data-bs-toggle="dropdown" aria-expanded="false">
          <i class="fa-solid fa-user me-2"></i> ${userName}
        </button>
        <ul class="dropdown-menu">
          <li><a class="dropdown-item" href="#"><i class="fa-solid fa-user me-2"></i>Profile</a></li>
          <li><a class="dropdown-item" href="#"><i class="fa-solid fa-clock me-2"></i>Order History</a></li>
          <li><a class="dropdown-item" href="#"><i class="fa-solid fa-heart me-2"></i>Wishlist</a></li>
          <li><hr class="dropdown-divider"></li>
          <li><a class="dropdown-item" href="#" onclick="logout()"><i class="fa-solid fa-sign-out-alt me-2"></i>Logout</a></li>
        </ul>
      </div>
    `;
  }
}

function logout() {
  // Clear user session
  if (window.supabaseService) {
    window.supabaseService.clearSession();
  } else {
    sessionStorage.removeItem('currentUser');
    localStorage.removeItem('currentUser');
    sessionStorage.removeItem('currentVendor');
    localStorage.removeItem('currentVendor');
  }

  // Reset UI
  const userAuthSection = document.getElementById('userAuthSection');
  if (userAuthSection) {
    userAuthSection.innerHTML = `
      <a href="#" class="btn btn-primary d-flex align-items-center" id="loginBtn" data-bs-toggle="modal" data-bs-target="#loginModal">
        <i class="fa-solid fa-user me-2"></i> Login
      </a>
    `;
  }

  // Show logout message
  showToast('You have been logged out successfully');
}

// Initialize demo users if none exist
function initializeDemoUsers() {
  const users = getStoredUsers();
  if (users.length === 0) {
    const demoUsers = [
      {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        type: 'customer',
        createdAt: new Date().toISOString()
      },
      {
        id: '2',
        name: 'Jane Smith',
        email: 'jane@example.com',
        password: 'password123',
        type: 'customer',
        createdAt: new Date().toISOString()
      }
    ];
    localStorage.setItem('users', JSON.stringify(demoUsers));
  }

  // Initialize demo vendors
  const vendors = getStoredVendors();
  if (vendors.length === 0) {
    const demoVendors = [
      {
        id: '1',
        businessName: 'HealthCare Pharmacy',
        businessType: 'pharmacy',
        contactPerson: 'Dr. Smith',
        phoneNumber: '+1234567890',
        email: 'admin@healthcare-pharmacy.com',
        address: '123 Health Street, Medical District',
        licenseNumber: 'PH12345',
        gstNumber: 'GST123456789',
        password: 'vendor123',
        status: 'approved',
        createdAt: new Date().toISOString(),
        approvedAt: new Date().toISOString()
      },
      {
        id: '2',
        businessName: 'City Medical Clinic',
        businessType: 'clinic',
        contactPerson: 'Dr. Johnson',
        phoneNumber: '+1234567891',
        email: 'info@citymedical.com',
        address: '456 Clinic Avenue, Downtown',
        licenseNumber: 'CL67890',
        gstNumber: 'GST987654321',
        password: 'vendor123',
        status: 'approved',
        createdAt: new Date().toISOString(),
        approvedAt: new Date().toISOString()
      }
    ];
    localStorage.setItem('vendors', JSON.stringify(demoVendors));
  }
}

// Initialize demo users when page loads
document.addEventListener('DOMContentLoaded', function() {
  initializeDemoUsers();
});

// Simple Cart Modal Functions
function openCartModal() {
  console.log('Opening cart modal...'); // Debug log
  alert('Cart button clicked!'); // Test alert

  const cartModal = document.getElementById('cartModal');
  if (cartModal) {
    // Try Bootstrap modal first
    try {
      const modal = new bootstrap.Modal(cartModal);
      modal.show();
      console.log('Bootstrap modal opened successfully'); // Debug log
    } catch (error) {
      console.log('Bootstrap failed, using manual method'); // Debug log
      // Manual modal opening
      cartModal.style.display = 'block';
      cartModal.classList.add('show', 'd-block');
      document.body.classList.add('modal-open');

      // Add backdrop
      let backdrop = document.getElementById('cart-modal-backdrop');
      if (!backdrop) {
        backdrop = document.createElement('div');
        backdrop.className = 'modal-backdrop fade show';
        backdrop.id = 'cart-modal-backdrop';
        backdrop.onclick = closeCartModal;
        document.body.appendChild(backdrop);
      }
    }
  } else {
    console.error('Cart modal not found!');
  }
}

function closeCartModal() {
  console.log('Closing cart modal...'); // Debug log

  const cartModal = document.getElementById('cartModal');
  const backdrop = document.getElementById('cart-modal-backdrop');

  if (cartModal) {
    cartModal.style.display = 'none';
    cartModal.classList.remove('show', 'd-block');
    document.body.classList.remove('modal-open');
  }

  if (backdrop) {
    backdrop.remove();
  }
}

// Setup Cart Icon (simplified)
function setupCartIcon() {
  console.log('Setting up cart icon...'); // Debug log

  // Setup modal close handlers
  const cartModal = document.getElementById('cartModal');
  if (cartModal) {
    // Close button handler
    const closeButtons = cartModal.querySelectorAll('[data-bs-dismiss="modal"], .btn-close');
    closeButtons.forEach(button => {
      button.addEventListener('click', function() {
        closeCartModal();
      });
    });

    // Click outside to close
    cartModal.addEventListener('click', function(e) {
      if (e.target === cartModal) {
        closeCartModal();
      }
    });
  }
}

// Setup Add to Cart Buttons
function setupAddToCartButtons() {
  console.log('Setting up Add to Cart buttons...'); // Debug log

  // Find all "Add to Cart" buttons
  const allButtons = document.querySelectorAll('button');
  console.log('Total buttons found:', allButtons.length); // Debug log

  let addToCartCount = 0;
  allButtons.forEach(button => {
    if (button.textContent.trim().includes('Add to Cart')) {
      addToCartCount++;
      console.log('Found Add to Cart button:', button.textContent.trim()); // Debug log

      // Remove existing event listeners to prevent duplicates
      button.removeEventListener('click', handleAddToCart);
      // Add new event listener
      button.addEventListener('click', handleAddToCart);
    }
  });

  console.log('Total Add to Cart buttons set up:', addToCartCount); // Debug log
}

function handleAddToCart(e) {
  e.preventDefault();

  console.log('Add to cart clicked!'); // Debug log

  // Try multiple ways to find the product container
  let productContainer = this.closest('.product-card');
  if (!productContainer) {
    productContainer = this.closest('.card');
  }
  if (!productContainer) {
    productContainer = this.closest('.col-md-4');
  }
  if (!productContainer) {
    productContainer = this.closest('.col-md-3');
  }
  if (!productContainer) {
    productContainer = this.closest('.col-6');
  }
  if (!productContainer) {
    // Try going up to find any container with product info
    let parent = this.parentElement;
    while (parent && !productContainer) {
      if (parent.querySelector('.card-title') && parent.querySelector('.price')) {
        productContainer = parent;
        break;
      }
      parent = parent.parentElement;
    }
  }

  console.log('Product container found:', productContainer); // Debug log

  if (!productContainer) {
    showToast('Error: Could not find product information', 'error');
    return;
  }

  const productName = productContainer.querySelector('.card-title')?.textContent?.trim() || 'Unknown Product';
  const productPriceElement = productContainer.querySelector('.price');
  const productImage = productContainer.querySelector('img')?.src || 'img/placeholder-product.jpg';

  console.log('Product details:', { productName, productPriceElement, productImage }); // Debug log

  if (!productPriceElement) {
    showToast('Error: Could not find product price', 'error');
    return;
  }

  const productPriceText = productPriceElement.textContent;
  const productPrice = parseFloat(productPriceText.replace('₹', '').replace(',', ''));

  if (isNaN(productPrice)) {
    showToast('Error: Invalid product price', 'error');
    return;
  }

  // Create product object
  const product = {
    id: Date.now().toString() + Math.random().toString(36).substring(2, 11),
    name: productName,
    price: productPrice,
    image: productImage,
    quantity: 1
  };

  console.log('Adding product to cart:', product); // Debug log

  // Add to cart
  addToCart(product);

  // Show success notification
  showToast(`Added ${productName} to cart`);
}

// Simple function to add products to cart (called from HTML buttons)
function addProductToCart(name, price, image) {
  console.log('Adding product:', name, price, image);

  const product = {
    id: Date.now().toString(),
    name: name,
    price: price,
    image: image || 'img/placeholder-product.jpg',
    quantity: 1
  };

  addToCart(product);
  showToast(`Added ${name} to cart!`);
}

// Very Simple Cart System
let myCart = [];
let isCartOpen = false;

// Show/Hide Cart Dropdown - Simple Version
function showCartDropdown() {
  console.log('Cart icon clicked!');
  const dropdown = document.getElementById('cartDropdown');

  if (!dropdown) {
    alert('Cart dropdown not found!');
    return;
  }

  if (isCartOpen) {
    dropdown.style.display = 'none';
    isCartOpen = false;
    console.log('Cart closed');
  } else {
    dropdown.style.display = 'block';
    isCartOpen = true;
    updateCartDisplay();
    console.log('Cart opened');
  }
}

// Add item to cart
function addToSimpleCart(name, price, image) {
  console.log('Adding to cart:', name, price);

  // Check if item already exists
  const existingItem = myCart.find(item => item.name === name);
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    myCart.push({
      name: name,
      price: price,
      image: image,
      quantity: 1
    });
  }

  // Update cart badge
  updateCartBadge();

  // Show success message
  alert(`✅ Added ${name} to cart!`);
}

// Update cart badge number
function updateCartBadge() {
  const badge = document.getElementById('cartBadge');
  const totalItems = myCart.reduce((sum, item) => sum + item.quantity, 0);
  badge.textContent = totalItems;
  badge.style.display = totalItems > 0 ? 'flex' : 'none';
}

// Update cart display
function updateCartDisplay() {
  const cartList = document.getElementById('cartItemsList');
  const cartTotal = document.getElementById('cartTotalAmount');

  if (myCart.length === 0) {
    cartList.innerHTML = '<p style="color: #666; text-align: center;">Your cart is empty</p>';
    cartTotal.textContent = '0';
  } else {
    let total = 0;
    let html = '';

    myCart.forEach((item, index) => {
      const itemTotal = item.price * item.quantity;
      total += itemTotal;

      html += `
        <div style="border: 1px solid #eee; padding: 10px; margin: 5px 0; border-radius: 4px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
              <strong>${item.name}</strong><br>
              <small>₹${item.price} × ${item.quantity}</small>
            </div>
            <div style="text-align: right;">
              <div><strong>₹${itemTotal}</strong></div>
              <button
                onclick="removeFromCart(${index})"
                style="
                  background: #dc3545;
                  color: white;
                  border: none;
                  border-radius: 3px;
                  padding: 2px 6px;
                  cursor: pointer;
                  font-size: 12px;
                "
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      `;
    });

    cartList.innerHTML = html;
    cartTotal.textContent = total.toFixed(2);
  }
}

// Remove item from cart
function removeFromCart(index) {
  myCart.splice(index, 1);
  updateCartBadge();
  updateCartDisplay();
}

// Checkout function
function proceedToCheckout() {
  if (myCart.length === 0) {
    alert('Your cart is empty!');
    return;
  }

  const total = myCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  alert(`🛒 Checkout\nTotal: ₹${total.toFixed(2)}\nItems: ${myCart.length}`);
}

// Make functions available globally
window.showCartDropdown = showCartDropdown;
window.addToSimpleCart = addToSimpleCart;
window.removeFromCart = removeFromCart;
window.proceedToCheckout = proceedToCheckout;

// Shopping Cart Functions
let cart = [];

function initializeCart() {
  // Load cart from localStorage
  const savedCart = localStorage.getItem('shoppingCart');
  if (savedCart) {
    cart = JSON.parse(savedCart);
  }
  updateCartDisplay();
}

function addToCart(product) {
  console.log('addToCart called with:', product); // Debug log
  console.log('Current cart before adding:', cart); // Debug log

  // Check if product already exists in cart
  const existingItem = cart.find(item => item.name === product.name);

  if (existingItem) {
    existingItem.quantity += 1;
    console.log('Updated existing item quantity:', existingItem); // Debug log
  } else {
    cart.push(product);
    console.log('Added new item to cart'); // Debug log
  }

  console.log('Cart after adding:', cart); // Debug log

  saveCart();
  updateCartDisplay();
}

function removeFromCart(productId) {
  cart = cart.filter(item => item.id !== productId);
  saveCart();
  updateCartDisplay();
}

function updateQuantity(productId, newQuantity) {
  const item = cart.find(item => item.id === productId);
  if (item) {
    if (newQuantity <= 0) {
      removeFromCart(productId);
    } else {
      item.quantity = newQuantity;
      saveCart();
      updateCartDisplay();
    }
  }
}

function clearCart() {
  cart = [];
  saveCart();
  updateCartDisplay();
  showToast('Cart cleared successfully');
}

function saveCart() {
  localStorage.setItem('shoppingCart', JSON.stringify(cart));
}

function updateCartDisplay() {
  console.log('Updating cart display, cart contents:', cart); // Debug log

  const cartCount = document.getElementById('cartCount');
  const cartItems = document.getElementById('cartItems');
  const cartTotal = document.getElementById('cartTotal');
  const emptyCartMessage = document.getElementById('emptyCartMessage');
  const checkoutBtn = document.getElementById('checkoutBtn');

  // Update cart count
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  console.log('Total items in cart:', totalItems); // Debug log

  if (cartCount) {
    cartCount.textContent = totalItems;
    console.log('Updated cart count display to:', totalItems); // Debug log
  }

  // Update cart items display
  if (cart.length === 0) {
    if (emptyCartMessage) emptyCartMessage.style.display = 'block';
    if (cartItems) cartItems.style.display = 'none';
    if (cartTotal) cartTotal.textContent = '0.00';
    if (checkoutBtn) checkoutBtn.disabled = true;
  } else {
    if (emptyCartMessage) emptyCartMessage.style.display = 'none';
    if (cartItems) cartItems.style.display = 'block';
    if (checkoutBtn) checkoutBtn.disabled = false;

    // Calculate total
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    if (cartTotal) cartTotal.textContent = total.toFixed(2);

    // Display cart items
    if (cartItems) {
      cartItems.innerHTML = cart.map(item => `
        <div class="cart-item border-bottom pb-3 mb-3">
          <div class="row align-items-center">
            <div class="col-2">
              <img src="${item.image}" alt="${item.name}" class="img-fluid rounded" style="max-height: 60px; object-fit: cover;">
            </div>
            <div class="col-5">
              <h6 class="mb-1">${item.name}</h6>
              <small class="text-muted">₹${item.price.toFixed(2)} each</small>
            </div>
            <div class="col-3">
              <div class="input-group input-group-sm">
                <button class="btn btn-outline-secondary" type="button" onclick="updateQuantity('${item.id}', ${item.quantity - 1})">-</button>
                <input type="text" class="form-control text-center" value="${item.quantity}" readonly>
                <button class="btn btn-outline-secondary" type="button" onclick="updateQuantity('${item.id}', ${item.quantity + 1})">+</button>
              </div>
            </div>
            <div class="col-2 text-end">
              <div class="fw-bold">₹${(item.price * item.quantity).toFixed(2)}</div>
              <button class="btn btn-sm btn-outline-danger mt-1" onclick="removeFromCart('${item.id}')">
                <i class="fa-solid fa-trash"></i>
              </button>
            </div>
          </div>
        </div>
      `).join('');
    }
  }
}