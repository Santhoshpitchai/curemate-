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
}); 