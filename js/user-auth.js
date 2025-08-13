// User Authentication System using Supabase
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Supabase
    initSupabase();
    
    // Initialize user authentication - ensure this runs first
    setTimeout(() => {
        initializeUserAuth();
    }, 0);
    
    // Password toggle functionality
    const togglePassword = document.getElementById('togglePassword');
    if (togglePassword) {
        togglePassword.addEventListener('click', function() {
            const passwordInput = document.getElementById('password');
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
    
    // Forgot password functionality
    const forgotPasswordLink = document.getElementById('forgotPassword');
    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', function(e) {
            e.preventDefault();
            handleForgotPassword();
        });
    }
});

async function initializeUserAuth() {
    // Set a flag to indicate user-auth.js is handling the UI update
    window.userAuthHandlingUI = true;
    
    console.log('Initializing user auth UI...');
    
    // Check if user is already logged in
    const isUserLoggedIn = await isLoggedIn();
    const isUserVendor = await isVendor();
    
    // If on login page and already logged in, redirect appropriately
    if (isUserLoggedIn && window.location.pathname.includes('user-login.html')) {
        if (isUserVendor) {
            window.location.href = 'vendor-dashboard.html';
        } else {
            window.location.href = 'index.html'; // Or user dashboard when created
        }
        return;
    }

    // User login form handler
    const userLoginForm = document.getElementById('userLoginForm');
    if (userLoginForm) {
        userLoginForm.addEventListener('submit', handleUserLogin);
    }

    // User signup form handler
    const userSignupForm = document.getElementById('userSignupForm');
    if (userSignupForm) {
        userSignupForm.addEventListener('submit', handleUserSignup);
        
        // Password confirmation validation
        const confirmPassword = document.getElementById('confirmPassword');
        const password = document.getElementById('password');
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
    
    // Update UI based on authentication status
    updateAuthUI(isUserLoggedIn, isUserVendor);
}

async function handleUserLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    try {
        // Show loading state
        const submitButton = this.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.innerHTML;
        submitButton.disabled = true;
        submitButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Logging in...';
        
        // Sign in with Supabase
        const { session, user, error } = await userAuth.signIn(email, password);
        
        if (error) {
            showToast(error.message, 'error');
            submitButton.disabled = false;
            submitButton.innerHTML = originalButtonText;
            return;
        }
        
        // Show success message
        showToast('Login successful!', 'success');
        
        // Redirect to home page or dashboard
        setTimeout(() => {
            window.location.href = 'index.html'; // Or user dashboard when created
        }, 1500);
        
    } catch (err) {
        console.error('Login error:', err);
        showToast('An error occurred during login. Please try again.', 'error');
        
        // Reset button state
        const submitButton = this.querySelector('button[type="submit"]');
        submitButton.disabled = false;
        submitButton.innerHTML = '<i class="fa-solid fa-sign-in-alt me-2"></i>Login';
    }
}

async function handleUserSignup(e) {
    e.preventDefault();
    
    const formData = {
        firstName: document.getElementById('firstName').value,
        lastName: document.getElementById('lastName').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        password: document.getElementById('password').value,
        confirmPassword: document.getElementById('confirmPassword').value
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
        const { user, error } = await userAuth.signUp(
            formData.email,
            formData.password,
            formData.firstName,
            formData.lastName,
            formData.phone
        );
        
        if (error) {
            showToast(error.message, 'error');
            submitButton.disabled = false;
            submitButton.innerHTML = originalButtonText;
            return;
        }
        
        // Show success message
        showToast('Account created successfully! Please check your email to confirm your account.', 'success');
        
        // Redirect to login page after delay
        setTimeout(() => {
            window.location.href = 'user-login.html';
        }, 3000);
        
    } catch (err) {
        console.error('Signup error:', err);
        showToast('An error occurred during signup. Please try again.', 'error');
        
        // Reset button state
        const submitButton = this.querySelector('button[type="submit"]');
        submitButton.disabled = false;
        submitButton.innerHTML = '<i class="fa-solid fa-user-plus me-2"></i>Create Account';
    }
}

async function handleForgotPassword() {
    const email = document.getElementById('email').value;
    
    if (!email) {
        showToast('Please enter your email address first', 'warning');
        document.getElementById('email').focus();
        return;
    }
    
    try {
        const { error } = await userAuth.resetPassword(email);
        
        if (error) {
            showToast(error.message, 'error');
            return;
        }
        
        showToast('Password reset instructions have been sent to your email', 'success');
        
    } catch (err) {
        console.error('Password reset error:', err);
        showToast('An error occurred. Please try again later.', 'error');
    }
}

async function updateAuthUI(isLoggedIn, isVendor) {
    // Update navigation links based on authentication status
    // First try to find the dedicated auth container
    let authContainer = document.getElementById('authContainer');
    
    if (!authContainer) {
        // Fallback to old method
        const navbarNav = document.querySelector('.navbar-nav');
        if (!navbarNav) return;
        
        // Find or create auth container
        authContainer = document.querySelector('.auth-links');
        if (!authContainer) {
            authContainer = document.createElement('div');
            authContainer.className = 'auth-links ms-lg-auto d-flex align-items-center';
            navbarNav.appendChild(authContainer);
        }
    }
    
    if (isLoggedIn) {
        // User is logged in
        const user = await getCurrentUser();
        const profile = isVendor ? 
            await vendorAuth.getProfile() : 
            await userAuth.getProfile();
        
        const displayName = profile?.profile?.first_name || user?.email || 'User';
        
        authContainer.innerHTML = `
            <div class="dropdown">
                <button class="btn btn-link text-decoration-none p-1" type="button" id="userDropdown" data-bs-toggle="dropdown" aria-expanded="false">
                    <div class="user-avatar-circle">
                        <i class="fa-solid fa-user"></i>
                    </div>
                </button>
                <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
                    <li class="dropdown-header">${displayName}</li>
                    ${isVendor ? 
                        '<li><a class="dropdown-item" href="vendor-dashboard.html"><i class="fa-solid fa-gauge me-2"></i>Dashboard</a></li>' : 
                        '<li><a class="dropdown-item" href="#"><i class="fa-solid fa-user me-2"></i>My Profile</a></li>'
                    }
                    <li><a class="dropdown-item" href="#"><i class="fa-solid fa-shopping-bag me-2"></i>My Orders</a></li>
                    <li><hr class="dropdown-divider"></li>
                    <li><a class="dropdown-item" href="#" id="logoutBtn"><i class="fa-solid fa-sign-out-alt me-2"></i>Logout</a></li>
                </ul>
            </div>
        `;
        
        // Add logout functionality
        document.getElementById('logoutBtn').addEventListener('click', async function(e) {
            e.preventDefault();
            
            try {
                const { error } = isVendor ? 
                    await vendorAuth.signOut() : 
                    await userAuth.signOut();
                
                if (error) {
                    showToast(error.message, 'error');
                    return;
                }
                
                showToast('Logged out successfully', 'success');

                // Reset authContainer immediately
                const authContainer = document.getElementById('authContainer');
                if (authContainer) {
                    authContainer.innerHTML = `
                        <div class="d-flex">
                          <a href="auth.html?action=login" class="btn btn-outline-primary me-2">
                            <i class="fa-solid fa-sign-in-alt me-1"></i> Login
                          </a>
                          <a href="auth.html?action=signup" class="btn btn-primary">
                            <i class="fa-solid fa-user-plus me-1"></i> Sign Up
                          </a>
                        </div>
                    `;
                }

                // Redirect after delay
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1500);
                
            } catch (err) {
                console.error('Logout error:', err);
                showToast('An error occurred during logout', 'error');
            }
        });
        
    } else {
        // User is not logged in - Use the Account button as shown in the reference image
        authContainer.innerHTML = `
            <a href="auth.html" class="btn btn-primary">
                <i class="fa-solid fa-user-circle me-1"></i> Account
            </a>
        `;
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
