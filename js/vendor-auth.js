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

async function handleVendorLogin(e) {
    e.preventDefault();

    const email = document.getElementById('vendorEmail').value;
    const password = document.getElementById('vendorPassword').value;
    const rememberMe = document.getElementById('vendorRememberMe').checked;

    try {
        // Show loading state
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin me-2"></i>Logging in...';
        submitBtn.disabled = true;

        // Authenticate with Supabase
        const result = await window.supabaseService.authenticateVendor(email, password);

        if (result.success) {
            // Store vendor session
            window.supabaseService.setVendorSession(result.vendor, rememberMe);

            // Show success message
            const vendorName = result.vendor.first_name || result.vendor.email;
            showToast(`Welcome back, ${vendorName}!`, 'success');

            // Redirect to vendor dashboard
            setTimeout(() => {
                window.location.href = 'vendor-dashboard.html';
            }, 1500);

        } else {
            showToast(result.message || 'Invalid email or password. Please try again.', 'error');
        }

        // Restore button state
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;

    } catch (error) {
        console.error('Vendor login error:', error);
        showToast('Login failed. Please try again.', 'error');

        // Restore button state
        const submitBtn = e.target.querySelector('button[type="submit"]');
        submitBtn.innerHTML = '<i class="fa-solid fa-sign-in-alt me-2"></i>Login to Dashboard';
        submitBtn.disabled = false;
    }
}

async function handleVendorSignup(e) {
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

    try {
        // Show loading state
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin me-2"></i>Creating account...';
        submitBtn.disabled = true;

        // Check if vendor already exists
        const existingVendor = await window.supabaseService.getVendorByEmail(formData.email);
        if (existingVendor) {
            showToast('A vendor account with this email already exists', 'error');
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
            return;
        }

        // Create new vendor in Supabase
        const vendorData = {
            email: formData.email,
            contactPerson: formData.contactPerson,
            phoneNumber: formData.phoneNumber,
            businessName: formData.businessName,
            businessType: formData.businessType,
            address: formData.address,
            licenseNumber: formData.licenseNumber,
            gstNumber: formData.gstNumber,
            password: formData.password // Note: In production, implement proper password hashing
        };

        const newVendor = await window.supabaseService.createVendor(vendorData);

        // Show success message
        showToast('Vendor account created successfully! You can now login with your credentials.', 'success');

        // Redirect to login page after delay
        setTimeout(() => {
            window.location.href = 'vendor-login.html';
        }, 3000);

        // Restore button state
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;

    } catch (error) {
        console.error('Vendor signup error:', error);
        showToast('Account creation failed. Please try again.', 'error');

        // Restore button state
        const submitBtn = e.target.querySelector('button[type="submit"]');
        submitBtn.innerHTML = '<i class="fa-solid fa-user-plus me-2"></i>Create Vendor Account';
        submitBtn.disabled = false;
    }
}

// Helper functions
function getCurrentVendor() {
    return window.supabaseService ? window.supabaseService.getCurrentVendor() : null;
}

async function getStoredVendors() {
    if (window.supabaseService) {
        return await window.supabaseService.getAllVendors();
    }
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
