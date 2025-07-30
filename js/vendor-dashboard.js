// Vendor Dashboard JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Check if vendor is logged in
    const currentVendor = getCurrentVendor();
    if (!currentVendor) {
        // Redirect to login if not authenticated
        window.location.href = 'vendor-login.html';
        return;
    }

    // Initialize dashboard
    initializeDashboard(currentVendor);
});

function initializeDashboard(vendor) {
    // Update vendor name in UI
    const vendorNameElements = document.querySelectorAll('#vendorName, #dashboardVendorName');
    vendorNameElements.forEach(element => {
        element.textContent = vendor.businessName;
    });

    // Load dashboard data
    loadDashboardStats();
    loadRecentOrders();
}

function loadDashboardStats() {
    // In a real application, this would fetch data from an API
    // For demo purposes, we'll use static data
    
    // You can expand this to show real vendor-specific data
    console.log('Dashboard stats loaded');
}

function loadRecentOrders() {
    // In a real application, this would fetch vendor's orders from an API
    // For demo purposes, the orders are already in the HTML
    
    console.log('Recent orders loaded');
}

function getCurrentVendor() {
    // Check session storage first, then local storage
    const sessionVendor = sessionStorage.getItem('currentVendor');
    const localVendor = localStorage.getItem('currentVendor');
    
    if (sessionVendor) {
        return JSON.parse(sessionVendor);
    } else if (localVendor) {
        return JSON.parse(localVendor);
    }
    
    return null;
}

function vendorLogout() {
    // Clear vendor session
    sessionStorage.removeItem('currentVendor');
    localStorage.removeItem('currentVendor');
    
    // Show logout message
    showToast('You have been logged out successfully');
    
    // Redirect to login page
    setTimeout(() => {
        window.location.href = 'vendor-login.html';
    }, 1500);
}

// Toast notification function
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
    const bgClass = type === 'success' ? 'bg-success' : type === 'warning' ? 'bg-warning' : 'bg-danger';
    toastEl.className = `toast align-items-center text-white ${bgClass} border-0`;
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
