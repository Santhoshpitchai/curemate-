// Vendor Dashboard JavaScript
document.addEventListener('DOMContentLoaded', async function() {
    console.log('Vendor dashboard initializing...');
    
    // Check if we're in a redirect loop
    const redirectCount = parseInt(sessionStorage.getItem('vendorRedirectCount') || '0');
    if (redirectCount > 2) {
        console.warn('Detected possible redirect loop, staying on dashboard page');
        sessionStorage.setItem('vendorRedirectCount', '0');
        showToast('Authentication issue detected. Please try logging in again.', 'warning');
        return;
    }

    // Check if there's a Supabase session first
    try {
        // If Supabase is available, try to check authentication that way
        if (window.supabase && window.isVendor) {
            const isUserVendor = await isVendor();
            if (isUserVendor) {
                // We have a valid vendor in Supabase, load dashboard
                const vendorData = await getCurrentVendorData();
                if (vendorData) {
                    console.log('Valid vendor authenticated via Supabase');
                    initializeDashboard(vendorData);
                    // Reset redirect counter
                    sessionStorage.setItem('vendorRedirectCount', '0');
                    return;
                }
            }
        }
    } catch (error) {
        console.error('Error checking Supabase vendor authentication:', error);
    }
    
    // Fallback to legacy authentication
    const currentVendor = getCurrentVendor();
    if (currentVendor) {
        console.log('Valid vendor authenticated via legacy storage');
        initializeDashboard(currentVendor);
        // Reset redirect counter
        sessionStorage.setItem('vendorRedirectCount', '0');
        return;
    }
    
    // No valid vendor authentication found, redirect to login
    console.log('No valid vendor authentication, redirecting to login');
    sessionStorage.setItem('vendorRedirectCount', (redirectCount + 1).toString());
    window.location.href = 'auth.html';
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

async function getCurrentVendorData() {
    // First check if we have Supabase authentication
    try {
        if (typeof supabase !== 'undefined' && typeof vendorAuth !== 'undefined') {
            // Check if user is logged in and is a vendor
            const user = await getCurrentUser();
            if (!user) return null;
            
            const isVendorUser = await isVendor();
            if (!isVendorUser) return null;
            
            // Get vendor profile from Supabase
            const { profile, error } = await vendorAuth.getProfile();
            if (error || !profile) {
                console.error('Error getting vendor profile:', error);
                return null;
            }
            
            // Format the vendor data 
            return {
                id: profile.id,
                email: profile.email,
                businessName: profile.business_name,
                firstName: profile.first_name,
                lastName: profile.last_name,
                phone: profile.phone
            };
        }
    } catch (err) {
        console.error('Error in getCurrentVendorData:', err);
    }
    
    // Fallback to session/local storage (legacy approach)
    const sessionVendor = sessionStorage.getItem('currentVendor');
    const localVendor = localStorage.getItem('currentVendor');
    
    if (sessionVendor) {
        return JSON.parse(sessionVendor);
    } else if (localVendor) {
        return JSON.parse(localVendor);
    }
    
    return null;
}

// Helper function to get vendor synchronously (for backward compatibility)
function getCurrentVendor() {
    // For backward compatibility, if we have a cached version, return it immediately
    const sessionVendor = sessionStorage.getItem('currentVendor');
    const localVendor = localStorage.getItem('currentVendor');
    
    if (sessionVendor) {
        return JSON.parse(sessionVendor);
    } else if (localVendor) {
        return JSON.parse(localVendor);
    }
    
    // Otherwise we should return null and the caller should redirect to login
    return null;
}

function vendorLogout() {
    // Clear vendor session
    sessionStorage.removeItem('currentVendor');
    localStorage.removeItem('currentVendor');
    
    // Show logout message
    showToast('You have been logged out successfully');
    
    // Redirect to universal login page
    setTimeout(() => {
        window.location.href = 'auth.html';
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
