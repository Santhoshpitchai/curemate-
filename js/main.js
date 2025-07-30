// Curemate Health Hub - Main JavaScript

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

  // Add to Cart functionality
  const addToCartButtons = document.querySelectorAll('.btn-primary:contains("Add to Cart")');
  addToCartButtons.forEach(button => {
    button.addEventListener('click', function(e) {
      e.preventDefault();
      
      // Get product info
      const productCard = this.closest('.product-card');
      const productName = productCard.querySelector('.card-title').textContent;
      const productPrice = productCard.querySelector('.price').textContent;
      
      // Update cart count
      const cartBadge = document.querySelector('.fa-cart-shopping + .badge');
      if (cartBadge) {
        const currentCount = parseInt(cartBadge.textContent);
        cartBadge.textContent = currentCount + 1;
      }
      
      // Show toast notification
      showToast(`Added ${productName} (${productPrice}) to cart`);
    });
  });

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

    // Alternative approach for "Add to Cart" buttons
    const allButtons = document.querySelectorAll('.btn-primary');
    allButtons.forEach(button => {
      if (button.textContent.includes('Add to Cart')) {
        button.addEventListener('click', function(e) {
          e.preventDefault();

          // Get product info
          const productCard = this.closest('.product-card');
          const productName = productCard.querySelector('.card-title').textContent;
          const productPrice = productCard.querySelector('.price').textContent;

          // Update cart count
          const cartBadge = document.querySelector('.fa-cart-shopping + .badge');
          if (cartBadge) {
            const currentCount = parseInt(cartBadge.textContent);
            cartBadge.textContent = currentCount + 1;
          }

          // Show toast notification
          showToast(`Added ${productName} (${productPrice}) to cart`);
        });
      }
    });
  }

  // Authentication functionality
  initializeAuth();
});

// Function to close modal (used by vendor signup link)
function closeModal() {
  const loginModal = bootstrap.Modal.getInstance(document.getElementById('loginModal'));
  if (loginModal) {
    loginModal.hide();
  }
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

function handleLogin(e) {
  e.preventDefault();

  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;
  const rememberMe = document.getElementById('rememberMe').checked;

  // Simulate authentication (in real app, this would be an API call)
  const users = getStoredUsers();
  const user = users.find(u => u.email === email && u.password === password);

  if (user) {
    // Store user session
    if (rememberMe) {
      localStorage.setItem('currentUser', JSON.stringify(user));
    } else {
      sessionStorage.setItem('currentUser', JSON.stringify(user));
    }

    // Update UI
    updateUIForLoggedInUser(user);

    // Close modal
    const loginModal = bootstrap.Modal.getInstance(document.getElementById('loginModal'));
    loginModal.hide();

    // Show success message
    showToast(`Welcome back, ${user.name}!`);

    // Reset form
    document.getElementById('loginForm').reset();
  } else {
    showToast('Invalid email or password. Please try again.', 'error');
  }
}

function handleSignup(e) {
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

  // Check if user already exists
  const users = getStoredUsers();
  if (users.find(u => u.email === email)) {
    showToast('An account with this email already exists', 'error');
    return;
  }

  // Create new user
  const newUser = {
    id: Date.now().toString(),
    name: name,
    email: email,
    password: password, // In real app, this would be hashed
    type: 'customer',
    createdAt: new Date().toISOString()
  };

  // Store user
  users.push(newUser);
  localStorage.setItem('users', JSON.stringify(users));

  // Auto-login the new user
  sessionStorage.setItem('currentUser', JSON.stringify(newUser));

  // Update UI
  updateUIForLoggedInUser(newUser);

  // Close modal
  const signupModal = bootstrap.Modal.getInstance(document.getElementById('signupModal'));
  signupModal.hide();

  // Show success message
  showToast(`Welcome to Curemate, ${newUser.name}!`);

  // Reset form
  document.getElementById('signupForm').reset();
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
  // Check session storage first, then local storage
  const sessionUser = sessionStorage.getItem('currentUser');
  const localUser = localStorage.getItem('currentUser');

  if (sessionUser) {
    return JSON.parse(sessionUser);
  } else if (localUser) {
    return JSON.parse(localUser);
  }

  return null;
}

function getStoredUsers() {
  return JSON.parse(localStorage.getItem('users') || '[]');
}

function getStoredVendors() {
  return JSON.parse(localStorage.getItem('vendors') || '[]');
}

function updateUIForLoggedInUser(user) {
  const userAuthSection = document.getElementById('userAuthSection');
  if (userAuthSection) {
    userAuthSection.innerHTML = `
      <div class="dropdown">
        <button class="btn btn-primary dropdown-toggle d-flex align-items-center" type="button" data-bs-toggle="dropdown" aria-expanded="false">
          <i class="fa-solid fa-user me-2"></i> ${user.name}
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
  sessionStorage.removeItem('currentUser');
  localStorage.removeItem('currentUser');

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