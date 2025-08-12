// Vendor Authentication System using Supabase
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Supabase
    initSupabase();
    
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

async function initializeVendorAuth() {
    console.log('Initializing vendor authentication...');
    
    // Check if we're in a redirect loop
    const redirectCount = parseInt(sessionStorage.getItem('vendorLoginRedirectCount') || '0');
    if (redirectCount > 2) {
        console.warn('Detected possible redirect loop, staying on login page');
        sessionStorage.setItem('vendorLoginRedirectCount', '0');
        showToast('Authentication issue detected. Please try logging in again.', 'warning');
        return;
    }
    
    try {
        // Check if user is already logged in as vendor
        const isVendorUser = await isVendor();
        if (isVendorUser) {
            // Increment redirect counter before redirecting
            sessionStorage.setItem('vendorLoginRedirectCount', (redirectCount + 1).toString());
            // Redirect to vendor dashboard
            window.location.href = 'vendor-dashboard.html';
            return;
        }
        
        // Reset redirect counter if we're staying on this page
        sessionStorage.setItem('vendorLoginRedirectCount', '0');
    } catch (error) {
        console.error('Error checking vendor authentication:', error);
        // Reset redirect counter if there's an error
        sessionStorage.setItem('vendorLoginRedirectCount', '0');
    }

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
    
    try {
        // Show loading state
        const submitButton = this.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.innerHTML;
        submitButton.disabled = true;
        submitButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Logging in...';
        
        // Sign in with Supabase
        const { session, user, error, vendor } = await vendorAuth.signIn(email, password);
        
        if (error) {
            showToast(error.message, 'error');
            submitButton.disabled = false;
            submitButton.innerHTML = originalButtonText;
            return;
        }
        
        // Show success message
        showToast(`Welcome back, ${vendor.business_name}!`, 'success');
        
        // Store vendor data in session for backwards compatibility
        sessionStorage.setItem('currentVendor', JSON.stringify({
            id: vendor.id || user.id,
            email: email,
            businessName: vendor.business_name || 'Vendor',
            firstName: vendor.first_name || '',
            lastName: vendor.last_name || ''
        }));
        
        // Reset any redirect counters
        sessionStorage.setItem('vendorLoginRedirectCount', '0');
        sessionStorage.setItem('vendorRedirectCount', '0');
        
        // Redirect to vendor dashboard with a delay
        setTimeout(() => {
            window.location.href = 'vendor-dashboard.html';
        }, 1500);
        
    } catch (err) {
        console.error('Login error:', err);
        showToast('An error occurred during login. Please try again.', 'error');
        
        // Reset button state
        const submitButton = this.querySelector('button[type="submit"]');
        submitButton.disabled = false;
        submitButton.innerHTML = '<i class="fa-solid fa-sign-in-alt me-2"></i>Login to Dashboard';
    }
}

async function handleVendorSignup(e) {
    e.preventDefault();
    
    const formData = {
        businessName: document.getElementById('businessName').value,
        firstName: document.getElementById('contactPersonFirstName').value,
        lastName: document.getElementById('contactPersonLastName').value,
        phone: document.getElementById('phoneNumber').value,
        email: document.getElementById('businessEmail').value,
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
        const submitButton = this.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.innerHTML;
        submitButton.disabled = true;
        submitButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Creating account...';
        
        // Sign up with Supabase
        const { user, error } = await vendorAuth.signUp(
            formData.email,
            formData.password,
            formData.firstName,
            formData.lastName,
            formData.businessName,
            formData.phone
        );
        
        if (error) {
            showToast(error.message, 'error');
            submitButton.disabled = false;
            submitButton.innerHTML = originalButtonText;
            return;
        }
        
        // Show success message
        showToast('Vendor account created successfully! Please check your email to confirm your account.', 'success');
        
        // Redirect to login page after delay
        setTimeout(() => {
            window.location.href = 'vendor-login.html';
        }, 3000);
        
    } catch (err) {
        console.error('Signup error:', err);
        showToast('An error occurred during signup. Please try again.', 'error');
        
        // Reset button state
        const submitButton = this.querySelector('button[type="submit"]');
        submitButton.disabled = false;
        submitButton.innerHTML = '<i class="fa-solid fa-user-plus me-2"></i>Create Vendor Account';
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