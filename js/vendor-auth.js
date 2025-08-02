// Vendor Authentication System
document.addEventListener('DOMContentLoaded', function() {
    // Initialize vendor authentication
    initializeVendorAuth();
    
    // Password toggle functionality
    const togglePassword = document.getElementById('togglePassword');
    if (togglePassword) {
        togglePassword.addEventListener('click', function() {
            const passwordInput = document.getElementById('vendorPassword');
            const icon = this.querySelector('i');
            
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                passwordInput.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        });
    }
});

function initializeVendorAuth() {
    // Check if user is already logged in as vendor
    const currentVendor = getCurrentVendor();
    if (currentVendor) {
        // Redirect to vendor dashboard
        window.location.href = 'vendor-dashboard.html';
        return;
    }

    // Initialize demo vendors if none exist
    initializeDemoVendors();

    // Vendor login form handler
    const vendorLoginForm = document.getElementById('vendorLoginForm');
    if (vendorLoginForm) {
        vendorLoginForm.addEventListener('submit', handleVendorLogin);
    }

    // Vendor signup form handler
    const vendorSignupForm = document.getElementById('vendorSignupForm');
    if (vendorSignupForm) {
        vendorSignupForm.addEventListener('submit', handleVendorSignup);
        
        // Password confirmation validation
        const confirmPassword = document.getElementById('confirmVendorPassword');
        const password = document.getElementById('vendorPassword');
        if (confirmPassword && password) {
            confirmPassword.addEventListener('input', function() {
                if (this.value !== password.value) {
                    this.setCustomValidity('Passwords do not match');
                } else {
                    this.setCustomValidity('');
                }
            });
        }
    }
}

function handleVendorLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('vendorEmail').value;
    const password = document.getElementById('vendorPassword').value;
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
        
        // Show success message
        showToast(`Welcome back, ${vendor.businessName}!`, 'success');
        
        // Redirect to vendor dashboard
        setTimeout(() => {
            window.location.href = 'vendor-dashboard.html';
        }, 1500);
        
    } else {
        showToast('Invalid email or password. Please try again.', 'error');
    }
}

function handleVendorSignup(e) {
    e.preventDefault();
    
    const formData = {
        businessName: document.getElementById('businessName').value,
        businessType: document.getElementById('businessType').value,
        contactPerson: document.getElementById('contactPerson').value,
        phoneNumber: document.getElementById('phoneNumber').value,
        email: document.getElementById('businessEmail').value,
        address: document.getElementById('businessAddress').value,
        licenseNumber: document.getElementById('licenseNumber').value,
        gstNumber: document.getElementById('gstNumber').value,
        password: document.getElementById('vendorPassword').value,
        confirmPassword: document.getElementById('confirmVendorPassword').value
    };
    
    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
        showToast('Passwords do not match', 'error');
        return;
    }
    
    // Check if vendor already exists
    const vendors = getStoredVendors();
    if (vendors.find(v => v.email === formData.email)) {
        showToast('A vendor account with this email already exists', 'error');
        return;
    }
    
    // Create new vendor
    const newVendor = {
        id: Date.now().toString(),
        businessName: formData.businessName,
        businessType: formData.businessType,
        contactPerson: formData.contactPerson,
        phoneNumber: formData.phoneNumber,
        email: formData.email,
        address: formData.address,
        licenseNumber: formData.licenseNumber,
        gstNumber: formData.gstNumber,
        password: formData.password, // In real app, this would be hashed
        status: 'pending', // pending, approved, rejected
        createdAt: new Date().toISOString(),
        approvedAt: null
    };
    
    // Store vendor
    vendors.push(newVendor);
    localStorage.setItem('vendors', JSON.stringify(vendors));
    
    // Show success message
    showToast('Vendor account created successfully! Your application is under review. You will be notified once approved.', 'success');
    
    // Redirect to login page after delay
    setTimeout(() => {
        window.location.href = 'vendor-login.html';
    }, 3000);
}

// Helper functions
function getCurrentVendor() {
    const sessionVendor = sessionStorage.getItem('currentVendor');
    const localVendor = localStorage.getItem('currentVendor');
    
    if (sessionVendor) {
        return JSON.parse(sessionVendor);
    } else if (localVendor) {
        return JSON.parse(localVendor);
    }
    
    return null;
}

function getStoredVendors() {
    return JSON.parse(localStorage.getItem('vendors') || '[]');
}

function initializeDemoVendors() {
    const vendors = getStoredVendors();
    if (vendors.length === 0) {
        const demoVendors = [
            {
                id: '1',
                businessName: 'HealthCare Pharmacy',
                businessType: 'pharmacy',
                contactPerson: 'Dr. Smith',
                phoneNumber: '+1234567890',
                email: 'vendor@test.com',
                address: '123 Health Street, Medical District',
                licenseNumber: 'PH12345',
                gstNumber: 'GST123456789',
                password: 'password123',
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
                email: 'admin@healthcare-pharmacy.com',
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
        delay: type === 'warning' ? 5000 : 3000
    });
    toast.show();
    
    // Remove toast element after it's hidden
    toastEl.addEventListener('hidden.bs.toast', function() {
        this.remove();
    });
}
