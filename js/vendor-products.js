// Vendor Products Management
document.addEventListener('DOMContentLoaded', async function() {
    console.log('Vendor Products page loaded, initializing...');
    
    // Force cleanup of any invalid shop IDs before proceeding
    if (typeof window.supabaseService !== 'undefined') {
        window.supabaseService.forceCleanupAndRefresh();
    }
    
    // Clear any existing demo products from localStorage
    await clearDemoProducts();
    
    // Check if vendor is logged in
    const currentVendor = await getVendorWithShops();
    console.log('Vendor with shops loaded:', currentVendor);
    
    if (!currentVendor) {
        console.error('No vendor found, redirecting to auth');
        window.location.href = 'auth.html';
        return;
    }

    // Initialize page
    console.log('Initializing products page with vendor:', currentVendor);
    initializeProductsPage(currentVendor);
    
    // Try to find a valid shop ID from multiple sources
    let shopId = currentVendor.currentShopId || 
                 localStorage.getItem('currentShopId') || 
                 sessionStorage.getItem('currentShopId');
    
    // If we have shops but no current shop ID, use the first shop
    if (!shopId && currentVendor.shops && currentVendor.shops.length > 0) {
        shopId = currentVendor.shops[0].id;
        localStorage.setItem('currentShopId', shopId);
        sessionStorage.setItem('currentShopId', shopId);
        currentVendor.currentShopId = shopId;
        currentVendor.currentShop = currentVendor.shops[0];
        console.log('Auto-selected first shop as current shop:', shopId);
    }
    
    if (shopId) {
        console.log('Loading vendor products for shop ID:', shopId);
        loadVendorProducts(shopId);
    } else {
        console.log('No shop ID available, skipping product loading');
    }
    
    // loadSupplierProducts(); // Disabled - no demo supplier products needed
    
    // Event listeners
    setupEventListeners();
    
    console.log('Vendor Products page initialization complete');
});

// Get vendor with shops data
async function getVendorWithShops() {
    try {
        console.log('Getting vendor with shops...');
        
        // Try to get vendor with shops using Supabase service
        if (typeof window.supabaseService !== 'undefined') {
            console.log('Supabase service available, attempting to get vendor with shops...');
            try {
                const vendorWithShops = await window.supabaseService.getCurrentVendorWithShops();
                console.log('Vendor with shops from Supabase:', vendorWithShops);
                
                if (vendorWithShops && vendorWithShops.shops && Array.isArray(vendorWithShops.shops) && vendorWithShops.shops.length > 0) {
                    console.log(`Found ${vendorWithShops.shops.length} shops via Supabase service`);
                    return vendorWithShops;
                } else {
                    console.warn('Supabase service returned vendor but no shops or invalid shops data:', vendorWithShops);
                }
            } catch (error) {
                console.error('Error getting vendor with shops from Supabase service:', error);
            }
        } else {
            console.log('Supabase service not available');
        }
    } catch (error) {
        console.error('Error getting vendor with shops:', error);
    }
    
    // Fallback to local storage
    console.log('Falling back to local storage...');
    const vendor = getCurrentVendor();
    console.log('Vendor from local storage:', vendor);
    if (!vendor) return null;
    
    // Try to get shops from local storage
    try {
        const shops = JSON.parse(localStorage.getItem(`vendorShops_${vendor.id}`) || '[]');
        console.log('Shops from local storage:', shops);
        vendor.shops = shops;
        
        // Get current shop ID
        const currentShopId = localStorage.getItem('currentShopId') || 
                            sessionStorage.getItem('currentShopId');
        console.log('Current shop ID from storage:', currentShopId);
        
        if (currentShopId && shops.length > 0) {
            // Validate that the shop ID is a proper UUID format
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
            const isValidUUID = uuidRegex.test(currentShopId);
            
            if (isValidUUID) {
                const matchingShop = shops.find(shop => shop.id === currentShopId);
                if (matchingShop) {
                    vendor.currentShopId = currentShopId;
                    vendor.currentShop = matchingShop;
                    console.log('Set current shop ID to:', currentShopId);
                } else {
                    console.warn('Shop ID not found in available shops:', currentShopId);
                    // Use first shop as fallback
                    vendor.currentShopId = shops[0].id;
                    vendor.currentShop = shops[0];
                    localStorage.setItem('currentShopId', shops[0].id);
                    sessionStorage.setItem('currentShopId', shops[0].id);
                }
            } else {
                console.warn('Invalid shop ID format detected, cleaning up:', currentShopId);
                // Clean up invalid ID and use first shop
                localStorage.removeItem('currentShopId');
                sessionStorage.removeItem('currentShopId');
                if (shops.length > 0) {
                    vendor.currentShopId = shops[0].id;
                    vendor.currentShop = shops[0];
                    localStorage.setItem('currentShopId', shops[0].id);
                    sessionStorage.setItem('currentShopId', shops[0].id);
                    console.log('Set current shop to first available shop:', shops[0].id);
                }
            }
        } else if (shops.length > 0) {
            // No current shop ID but we have shops, use the first one
            vendor.currentShopId = shops[0].id;
            vendor.currentShop = shops[0];
            localStorage.setItem('currentShopId', shops[0].id);
            sessionStorage.setItem('currentShopId', shops[0].id);
            console.log('Auto-selected first shop as current shop:', shops[0].id);
        } else if (shops.length > 0) {
            vendor.currentShopId = shops[0].id;
            vendor.currentShop = shops[0];
            localStorage.setItem('currentShopId', shops[0].id);
            console.log('Set current shop ID to first shop:', shops[0].id);
        } else {
            console.log('No shops found for vendor');
            vendor.currentShopId = null;
            vendor.currentShop = null;
        }
        
        console.log('Final vendor object:', vendor);
        return vendor;
    } catch (error) {
        console.error('Error getting shops from local storage:', error);
        return vendor;
    }
}

function initializeProductsPage(vendor) {
    console.log('Initializing products page with vendor:', vendor);
    
    // Update vendor name in UI
    const vendorNameElements = document.querySelectorAll('#vendorName');
    vendorNameElements.forEach(element => {
        const displayName = vendor.business_name || vendor.businessName || "Vendor";
        element.textContent = displayName;
    });
    
    // Create shop selector
    if (vendor.shops && Array.isArray(vendor.shops) && vendor.shops.length > 0) {
        console.log(`Found ${vendor.shops.length} shops, creating shop selector`);
        createShopSelector(vendor);
        
        // Enable the Add Product button since we have shops
        const addProductBtn = document.querySelector('[data-bs-target="#addProductModal"]');
        if (addProductBtn) {
            addProductBtn.disabled = false;
            addProductBtn.classList.remove('disabled');
            addProductBtn.title = 'Add a new product to your store';
        }
    } else {
        console.log('No shops available, showing shop creation prompt');
        showShopCreationPrompt();
        
        // Disable the Add Product button since we have no shops
        const addProductBtn = document.querySelector('[data-bs-target="#addProductModal"]');
        if (addProductBtn) {
            addProductBtn.disabled = true;
            addProductBtn.classList.add('disabled');
            addProductBtn.title = 'You need to create a store first before adding products';
        }
    }
    
    // Note: Demo products initialization removed - only show user-added products
}

// Add shop selector to the products page
function createShopSelector(vendor) {
    // Create shop selector container
    const shopSelectorContainer = document.createElement('div');
    shopSelectorContainer.className = 'card mb-4';
    shopSelectorContainer.innerHTML = `
        <div class="card-header">
            <h5 class="card-title mb-0">Select Store</h5>
        </div>
        <div class="card-body">
            <select id="shopSelector" class="form-select">
                ${vendor.shops.map(shop => `
                    <option value="${shop.id}" ${shop.id === vendor.currentShopId ? 'selected' : ''}>
                        ${shop.name} - ${shop.city}, ${shop.state}
                    </option>
                `).join('')}
            </select>
        </div>
    `;
    
    // Insert after categories
    const categoriesCard = document.querySelector('.card');
    if (categoriesCard) {
        categoriesCard.parentNode.insertBefore(shopSelectorContainer, categoriesCard.nextSibling);
    } else {
        // Fallback to inserting at the beginning
        const mainContent = document.querySelector('.col-md-9.col-lg-10.p-4');
        if (mainContent) {
            mainContent.insertBefore(shopSelectorContainer, mainContent.firstChild);
        }
    }
    
    // Add event listener for shop change
    document.getElementById('shopSelector').addEventListener('change', function() {
        const selectedShopId = this.value;
        console.log('Shop selector changed to:', selectedShopId);
        switchShop(selectedShopId);
    });
}

// Show shop creation prompt when no shops exist
function showShopCreationPrompt() {
    const mainContent = document.querySelector('.col-md-9.col-lg-10.p-4');
    if (!mainContent) return;
    
    // Create shop creation prompt
    const shopPromptContainer = document.createElement('div');
    shopPromptContainer.className = 'card mb-4 border-warning';
    shopPromptContainer.innerHTML = `
        <div class="card-header bg-warning text-dark">
            <h5 class="card-title mb-0">
                <i class="fa-solid fa-store me-2"></i>No Stores Found
            </h5>
        </div>
        <div class="card-body text-center py-4">
            <i class="fa-solid fa-store-slash fa-3x text-warning mb-3"></i>
            <h5 class="text-warning">You need to create a store first!</h5>
            <p class="text-muted mb-3">
                Before you can add products, you need to create at least one store/pharmacy location. 
                This helps organize your products and manage inventory properly.
            </p>
            <div class="d-flex justify-content-center gap-2">
                <button class="btn btn-warning" onclick="window.location.href='vendor-dashboard.html'">
                    <i class="fa-solid fa-plus me-2"></i>Go to Dashboard to Add Store
                </button>
                <button class="btn btn-outline-secondary" onclick="refreshPage()">
                    <i class="fa-solid fa-refresh me-2"></i>Refresh Page
                </button>
                <button class="btn btn-info" onclick="forceRefreshVendorData()">
                    <i class="fa-solid fa-sync-alt me-2"></i>Force Refresh Data
                </button>
            </div>
        </div>
    `;
    
    // Insert at the beginning of main content
    mainContent.insertBefore(shopPromptContainer, mainContent.firstChild);
}

// Debug function to help identify store issues
async function debugStoreIssue() {
    try {
        console.log('=== DEBUGGING STORE ISSUE ===');
        
        // Get current vendor
        const vendor = getCurrentVendor();
        console.log('Current vendor from storage:', vendor);
        
        if (!vendor) {
            showToast('No vendor found in storage', 'danger');
            return;
        }
        
        // Check if Supabase service is available
        if (typeof window.supabaseService !== 'undefined') {
            console.log('Supabase service available');
            
            // Test connection
            try {
                const connected = await window.supabaseService.testConnection();
                console.log('Supabase connection test:', connected);
            } catch (error) {
                console.error('Supabase connection test failed:', error);
            }
            
            // Try to get shops directly
            try {
                console.log('Fetching shops for vendor ID:', vendor.id);
                const shops = await window.supabaseService.getShopsByVendorId(vendor.id);
                console.log('Shops from database:', shops);
                
                if (shops && shops.length > 0) {
                    showToast(`Found ${shops.length} stores in database! The issue might be with data retrieval.`, 'success');
                    
                    // Show shops in console
                    shops.forEach((shop, index) => {
                        console.log(`Shop ${index + 1}:`, shop);
                    });
                } else {
                    showToast('No stores found in database for this vendor', 'warning');
                }
            } catch (error) {
                console.error('Error fetching shops:', error);
                showToast(`Error fetching shops: ${error.message}`, 'danger');
            }
            
            // Check vendor profile
            try {
                const vendorProfile = await window.supabaseService.getCurrentVendor();
                console.log('Vendor profile from database:', vendorProfile);
            } catch (error) {
                console.error('Error fetching vendor profile:', error);
            }
        } else {
            console.log('Supabase service not available');
            showToast('Supabase service not available', 'warning');
        }
        
        // Check local storage
        console.log('=== LOCAL STORAGE DEBUG ===');
        console.log('localStorage currentVendor:', localStorage.getItem('currentVendor'));
        console.log('sessionStorage currentVendor:', sessionStorage.getItem('currentVendor'));
        console.log('localStorage currentShopId:', localStorage.getItem('currentShopId'));
        console.log('sessionStorage currentShopId:', sessionStorage.getItem('currentShopId'));
        
        if (vendor.id) {
            const localShops = localStorage.getItem(`vendorShops_${vendor.id}`);
            console.log(`localStorage vendorShops_${vendor.id}:`, localShops);
        }
        
        console.log('=== END DEBUG ===');
        
    } catch (error) {
        console.error('Error in debugStoreIssue:', error);
        showToast(`Debug error: ${error.message}`, 'danger');
    }
}

// Make function globally accessible
window.debugStoreIssue = debugStoreIssue;

// Force refresh vendor data and shops
async function forceRefreshVendorData() {
    try {
        console.log('Force refreshing vendor data...');
        
        // Clear cached data
        if (typeof window.supabaseService !== 'undefined') {
            window.supabaseService.forceCleanupAndRefresh();
        }
        
        // Get fresh vendor data
        const vendor = await getVendorWithShops();
        if (vendor) {
            console.log('Refreshed vendor data:', vendor);
            
            // Update UI
            initializeProductsPage(vendor);
            
            // Try to find a valid shop ID
            let shopId = vendor.currentShopId || 
                         localStorage.getItem('currentShopId') || 
                         sessionStorage.getItem('currentShopId');
            
            // If we have shops but no current shop ID, use the first shop
            if (!shopId && vendor.shops && vendor.shops.length > 0) {
                shopId = vendor.shops[0].id;
                localStorage.setItem('currentShopId', shopId);
                sessionStorage.setItem('currentShopId', shopId);
                vendor.currentShopId = shopId;
                vendor.currentShop = vendor.shops[0];
            }
            
            // Load products if we have a shop
            if (shopId) {
                loadVendorProducts(shopId);
            }
            
            showToast('Vendor data refreshed successfully');
            
            // If we now have shops, reload the page to update the UI completely
            if (vendor.shops && vendor.shops.length > 0) {
                setTimeout(() => {
                    window.location.reload();
                }, 1000);
            }
        } else {
            console.error('Failed to refresh vendor data');
            showToast('Failed to refresh vendor data', 'danger');
        }
    } catch (error) {
        console.error('Error refreshing vendor data:', error);
        showToast('Error refreshing vendor data', 'danger');
    }
}

// Make function globally accessible
window.forceRefreshVendorData = forceRefreshVendorData;

// Function to refresh the page
function refreshPage() {
    window.location.reload();
}

// Switch to a different shop
async function switchShop(shopId) {
    try {
        console.log('Switching to shop ID:', shopId);
        
        if (typeof window.supabaseService !== 'undefined') {
            console.log('Using Supabase service for shop switch...');
            // Store selected shop ID in session storage
            const storage = localStorage.getItem('currentVendor') ? localStorage : sessionStorage;
            storage.setItem('currentShopId', shopId);
            console.log('Shop ID stored in storage:', shopId);
            
            // Get updated vendor with shop data
            const vendor = await window.supabaseService.getCurrentVendorWithShops();
            console.log('Updated vendor data:', vendor);
            
            // Reload products for the new shop
            console.log('Reloading products for new shop...');
            loadVendorProducts(shopId);
            
            showToast(`Switched to ${vendor.currentShop ? vendor.currentShop.name : 'selected store'}`);
        } else {
            console.log('Using local storage fallback for shop switch...');
            // Fallback to local storage for demo
            const vendorId = getCurrentVendor().id;
            const shops = JSON.parse(localStorage.getItem(`vendorShops_${vendorId}`) || '[]');
            console.log('Shops from local storage:', shops);
            
            // Store selected shop ID
            localStorage.setItem('currentShopId', shopId);
            console.log('Shop ID stored in local storage:', shopId);
            
            // Reload products for the new shop
            console.log('Reloading products for new shop...');
            loadVendorProducts(shopId);
            
            const shopName = shops.find(shop => shop.id === shopId)?.name || 'selected store';
            showToast(`Switched to ${shopName}`);
        }
    } catch (error) {
        console.error('Error switching shop:', error);
        showToast('Failed to switch store. Please try again.', 'danger');
    }
}

function setupEventListeners() {
    // Category filter
    const categoryRadios = document.querySelectorAll('input[name="category"]');
    categoryRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            filterProducts(this.value);
        });
    });

    // Add product form
    const addProductForm = document.getElementById('addProductForm');
    if (addProductForm) {
        addProductForm.addEventListener('submit', handleAddProduct);
    }

    // Place order button
    const placeOrderBtn = document.getElementById('placeOrderBtn');
    if (placeOrderBtn) {
        placeOrderBtn.addEventListener('click', handlePlaceOrder);
    }

    // Add Product button - check if store exists before opening modal
    const addProductBtn = document.querySelector('[data-bs-target="#addProductModal"]');
    if (addProductBtn) {
        addProductBtn.addEventListener('click', function(e) {
            console.log('Add Product button clicked, checking for stores...');
            
            const currentVendor = getCurrentVendor();
            console.log('Current vendor:', currentVendor);
            
            // Check multiple ways to determine if we have a valid store
            const hasShops = currentVendor && currentVendor.shops && currentVendor.shops.length > 0;
            const hasCurrentShopId = currentVendor && currentVendor.currentShopId;
            const hasStoredShopId = localStorage.getItem('currentShopId') || sessionStorage.getItem('currentShopId');
            const hasShopSelector = document.querySelector('#shopSelector');
            
            console.log('Store detection results:', {
                hasShops,
                hasCurrentShopId,
                hasStoredShopId,
                hasShopSelector: !!hasShopSelector
            });
            
            // If we have any indication of a store, allow the modal to open
            if (!hasShops && !hasCurrentShopId && !hasStoredShopId && !hasShopSelector) {
                console.log('No stores detected, preventing modal and redirecting');
                e.preventDefault();
                showToast('You need to create a store first before adding products. Redirecting to dashboard...', 'warning');
                setTimeout(() => {
                    window.location.href = 'vendor-dashboard.html';
                }, 1500);
                return false;
            }
            
            console.log('Store detected, allowing modal to open');
        });
    }
}

async function loadVendorProducts(shopId) {
    try {
        console.log('Loading vendor products for shopId:', shopId);
        let products = [];
    const currentVendor = getCurrentVendor();
        console.log('Current vendor:', currentVendor);
        
        if (!shopId) {
            shopId = localStorage.getItem('currentShopId') || sessionStorage.getItem('currentShopId');
            console.log('Shop ID from storage:', shopId);
        }
        
        // Try to load products from Supabase
        if (typeof window.supabaseService !== 'undefined') {
            console.log('Supabase service available, attempting to load products...');
            try {
                if (shopId) {
                    console.log('Loading products by shop ID:', shopId);
                    products = await window.supabaseService.getProductsByShopId(shopId);
                    console.log('Products loaded from Supabase by shop:', products);
                } else {
                    console.log('Loading products by vendor ID:', currentVendor.id);
                    products = await window.supabaseService.getProductsByVendorId(currentVendor.id);
                    console.log('Products loaded from Supabase by vendor:', products);
                }
            } catch (supabaseError) {
                console.warn('Supabase loading failed, falling back to local storage:', supabaseError);
                products = getVendorProducts(currentVendor.id, shopId);
                console.log('Products loaded from local storage as fallback:', products);
            }
        } else {
            console.log('Supabase service not available, using local storage');
            // Fallback to local storage
            products = getVendorProducts(currentVendor.id, shopId);
            console.log('Products loaded from local storage:', products);
        }
        
        console.log('Final products array to display:', products);
        displayProducts(products);
    } catch (error) {
        console.error('Error loading vendor products:', error);
        showToast('Failed to load products', 'danger');
    }
}

function filterProducts(category) {
    try {
        console.log('Filtering products by category:', category);
        
        const currentVendor = getCurrentVendor();
        if (!currentVendor) {
            console.error('No current vendor found');
            return;
        }
        
        const shopId = localStorage.getItem('currentShopId') || sessionStorage.getItem('currentShopId');
        if (!shopId) {
            console.error('No shop ID found');
            return;
        }
        
        // Get vendor products from Supabase first, then fallback to localStorage
        let vendorProducts = [];
        
        if (typeof window.supabaseService !== 'undefined') {
            // Try to get products from Supabase
            window.supabaseService.getProductsByShopId(shopId)
                .then(supabaseProducts => {
                    if (supabaseProducts && supabaseProducts.length > 0) {
                        vendorProducts = supabaseProducts;
                    } else {
                        // Fallback to localStorage
                        vendorProducts = getVendorProducts(currentVendor.id, shopId);
                    }
                    
                    console.log('Products before filtering:', vendorProducts);
                    
                    if (category === 'all') {
                        displayProducts(vendorProducts);
                    } else {
                        const filteredProducts = vendorProducts.filter(product => product.category === category);
                        console.log('Filtered products:', filteredProducts);
                        displayProducts(filteredProducts);
                    }
                })
                .catch(error => {
                    console.error('Error getting products from Supabase:', error);
                    // Fallback to localStorage
                    vendorProducts = getVendorProducts(currentVendor.id, shopId);
                    
                    if (category === 'all') {
                        displayProducts(vendorProducts);
                    } else {
                        const filteredProducts = vendorProducts.filter(product => product.category === category);
                        displayProducts(filteredProducts);
                    }
                });
        } else {
            // No Supabase, use localStorage
            vendorProducts = getVendorProducts(currentVendor.id, shopId);
            
            console.log('Products before filtering:', vendorProducts);
            
            if (category === 'all') {
                displayProducts(vendorProducts);
            } else {
                const filteredProducts = vendorProducts.filter(product => product.category === category);
                console.log('Filtered products:', filteredProducts);
                displayProducts(filteredProducts);
            }
        }
    } catch (error) {
        console.error('Error filtering products:', error);
    }
}

function displayProducts(products) {
    const productsGrid = document.getElementById('productsGrid');
    
    if (products.length === 0) {
        productsGrid.innerHTML = `
            <div class="col-12">
                <div class="text-center py-5">
                    <i class="fa-solid fa-box-open fa-3x text-muted mb-3"></i>
                    <h5 class="text-muted">No products found</h5>
                    <p class="text-muted">Add your first product to get started</p>
                </div>
            </div>
        `;
        return;
    }

    // Helper function to get default image based on category
    function getDefaultImage(category) {
        const categoryImages = {
            'medicines': 'img/medicines.jpg.png',
            'supplements': 'img/multivitamin.jpg.png',
            'equipment': 'img/blood-pressure-monitor.jpg.png',
            'first aid': 'img/first-aid.jpg.png',
            'baby care': 'img/babycare.jpg.png',
            'wellness': 'img/wellness.jpg.png',
            'healthcare': 'img/healthcare.jpg.png'
        };
        return categoryImages[category?.toLowerCase()] || 'img/medicines.jpg.png';
    }

    // Helper function to validate and get image URL
    function getImageUrl(product) {
        if (product.image && product.image.trim() !== '') {
            return product.image;
        }
        return getDefaultImage(product.category);
    }

    productsGrid.innerHTML = products.map(product => `
        <div class="col-sm-6 col-md-4 col-lg-3 mb-4">
            <div class="card h-100 shadow-sm border-0" style="transition: transform 0.2s; border-radius: 12px;">
                <div class="position-relative">
                    <img src="${getImageUrl(product)}" 
                         class="card-img-top product-image" 
                         alt="${product.name}" 
                         style="height: 180px; object-fit: cover; border-radius: 12px 12px 0 0;"
                         onerror="this.src='${getDefaultImage(product.category)}'; this.onerror=null;">
                    <span class="position-absolute top-0 end-0 m-2 badge ${product.stock > 10 ? 'bg-success' : product.stock > 0 ? 'bg-warning text-dark' : 'bg-danger'}">
                        ${product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                    </span>
                </div>
                <div class="card-body d-flex flex-column p-3">
                    <h6 class="card-title fw-bold mb-2" style="font-size: 1rem; line-height: 1.3;">${product.name}</h6>
                    <p class="card-text text-muted small mb-3" style="font-size: 0.85rem; line-height: 1.4; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;">
                        ${product.description || 'No description available'}
                    </p>
                    <div class="mt-auto">
                        <div class="d-flex justify-content-between align-items-center mb-3">
                            <span class="h6 text-primary mb-0 fw-bold">₹${parseFloat(product.price).toLocaleString('en-IN')}</span>
                            <small class="text-muted">${product.category || 'General'}</small>
                        </div>
                        <div class="d-grid gap-1">
                            <div class="btn-group btn-group-sm">
                                <button class="btn btn-outline-primary" onclick="editProduct('${product.id}')" title="Edit Product">
                                    <i class="fa-solid fa-edit"></i>
                                </button>
                                <button class="btn btn-outline-danger" onclick="deleteProduct('${product.id}')" title="Delete Product">
                                    <i class="fa-solid fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
    
    // Add hover effects
    setTimeout(() => {
        const cards = document.querySelectorAll('.card');
        cards.forEach(card => {
            card.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-5px)';
                this.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
            });
            card.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0)';
                this.style.boxShadow = '';
            });
        });
    }, 100);
}

function loadSupplierProducts() {
    const supplierProducts = getSupplierProducts();
    displaySupplierProducts(supplierProducts);
}

function displaySupplierProducts(products) {
    const supplierProductsContainer = document.getElementById('supplierProducts');
    
    supplierProductsContainer.innerHTML = products.map(product => `
        <div class="col-md-6 mb-3">
            <div class="card">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start">
                        <div>
                            <h6 class="card-title">${product.name}</h6>
                            <p class="card-text small text-muted">${product.supplier}</p>
                            <p class="text-primary fw-bold">₹${product.price} per unit</p>
                        </div>
                        <div class="text-end">
                            <div class="input-group input-group-sm mb-2" style="width: 100px;">
                                <input type="number" class="form-control" id="qty-${product.id}" min="1" value="1">
                            </div>
                            <button class="btn btn-primary btn-sm" onclick="addToOrder('${product.id}')">
                                <i class="fa-solid fa-plus"></i> Add
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

let orderItems = [];

function addToOrder(productId) {
    const products = getSupplierProducts();
    const product = products.find(p => p.id === productId);
    const quantity = parseInt(document.getElementById(`qty-${productId}`).value);
    
    if (!product || quantity < 1) return;
    
    const existingItem = orderItems.find(item => item.id === productId);
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        orderItems.push({
            id: productId,
            name: product.name,
            price: product.price,
            supplier: product.supplier,
            quantity: quantity
        });
    }
    
    updateOrderSummary();
}

function updateOrderSummary() {
    const orderSummary = document.getElementById('orderSummary');
    const orderTotal = document.getElementById('orderTotal');
    const placeOrderBtn = document.getElementById('placeOrderBtn');
    
    if (orderItems.length === 0) {
        orderSummary.innerHTML = '<p class="text-muted">No items selected</p>';
        orderTotal.textContent = '0';
        placeOrderBtn.disabled = true;
        return;
    }
    
    const total = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    orderSummary.innerHTML = orderItems.map(item => `
        <div class="d-flex justify-content-between align-items-center mb-2">
            <div>
                <small class="fw-bold">${item.name}</small><br>
                <small class="text-muted">${item.supplier}</small>
            </div>
            <div class="text-end">
                <small>${item.quantity} × ₹${item.price}</small><br>
                <button class="btn btn-sm btn-outline-danger" onclick="removeFromOrder('${item.id}')">
                    <i class="fa-solid fa-times"></i>
                </button>
            </div>
        </div>
    `).join('');
    
    orderTotal.textContent = total.toFixed(2);
    placeOrderBtn.disabled = false;
}

function removeFromOrder(productId) {
    orderItems = orderItems.filter(item => item.id !== productId);
    updateOrderSummary();
}

async function handleAddProduct(e) {
    e.preventDefault();
    
    console.log('handleAddProduct called');
    
    const currentVendor = getCurrentVendor();
    console.log('Current vendor in handleAddProduct:', currentVendor);
    
    let shopId = currentVendor?.currentShopId || 
                 localStorage.getItem('currentShopId') || 
                 sessionStorage.getItem('currentShopId');
    
    console.log('Initial shop ID:', shopId);
    
    // If no shop ID but we have shops, use the first one
    if (!shopId && currentVendor?.shops && currentVendor.shops.length > 0) {
        shopId = currentVendor.shops[0].id;
        localStorage.setItem('currentShopId', shopId);
        sessionStorage.setItem('currentShopId', shopId);
        currentVendor.currentShopId = shopId;
        currentVendor.currentShop = currentVendor.shops[0];
        console.log('Used first available shop:', shopId);
    }
    
    // Try to get shop ID from the shop selector dropdown if it exists
    if (!shopId) {
        const shopSelector = document.querySelector('#shopSelector');
        if (shopSelector && shopSelector.value) {
            shopId = shopSelector.value;
            localStorage.setItem('currentShopId', shopId);
            sessionStorage.setItem('currentShopId', shopId);
            console.log('Got shop ID from selector:', shopId);
        }
    }
    
    // If we still don't have a shop ID, try to get it from Supabase
    if (!shopId && typeof window.supabaseService !== 'undefined') {
        try {
            const vendorWithShops = await window.supabaseService.getCurrentVendorWithShops();
            if (vendorWithShops?.shops && vendorWithShops.shops.length > 0) {
                shopId = vendorWithShops.shops[0].id;
                localStorage.setItem('currentShopId', shopId);
                sessionStorage.setItem('currentShopId', shopId);
                console.log('Got shop ID from Supabase:', shopId);
            }
        } catch (error) {
            console.warn('Error getting shop from Supabase:', error);
        }
    }
    
    if (!shopId) {
        console.log('No shop ID found, redirecting to dashboard');
        showToast('You need to create a store first before adding products. Please go to the dashboard to add a store.', 'warning');
        // Close the modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('addProductModal'));
        if (modal) {
            modal.hide();
        }
        // Redirect to dashboard after a short delay
        setTimeout(() => {
            window.location.href = 'vendor-dashboard.html';
        }, 2000);
        return;
    }
    
    console.log('Using shop ID for product creation:', shopId);
    
    const formData = {
        name: document.getElementById('productName').value,
        category: document.getElementById('productCategory').value,
        price: parseFloat(document.getElementById('productPrice').value),
        stock: parseInt(document.getElementById('productStock').value),
        description: document.getElementById('productDescription').value,
        image: document.getElementById('productImage').value
    };
    
    try {
        console.log('Attempting to add product with data:', formData);
        console.log('Current vendor:', currentVendor);
        console.log('Final shop ID for product creation:', shopId);
        
        if (typeof window.supabaseService !== 'undefined') {
            console.log('Supabase service available, creating product in Supabase...');
            // Create product in Supabase
            const productData = {
                vendorId: currentVendor.id,
                shopId: shopId,
                ...formData
            };
            
            console.log('Product data to send to Supabase:', productData);
            const createdProduct = await window.supabaseService.createProduct(productData);
            console.log('Product created in Supabase:', createdProduct);
            
            // Also save to local storage as backup
            try {
                const localProduct = {
                    id: createdProduct.id || Date.now().toString(),
                    vendorId: currentVendor.id,
                    shopId: shopId,
                    ...formData,
                    createdAt: new Date().toISOString()
                };
                saveVendorProducts(currentVendor.id, [localProduct]);
                console.log('Product also saved to local storage:', localProduct);
            } catch (localError) {
                console.warn('Failed to save to local storage:', localError);
            }
            
            // Close modal and refresh
            const modal = bootstrap.Modal.getInstance(document.getElementById('addProductModal'));
            modal.hide();
            
            // Reset form
            document.getElementById('addProductForm').reset();
            
            // Reload products
            console.log('Reloading products after successful creation...');
            loadVendorProducts(shopId);
            
            showToast('Product added successfully!');
        } else {
            // Fallback to local storage
    const newProduct = {
        id: Date.now().toString(),
        vendorId: currentVendor.id,
                shopId: shopId,
        ...formData,
        createdAt: new Date().toISOString()
    };
    
    // Save product
            saveVendorProducts(currentVendor.id, [newProduct]);
    
    // Close modal and refresh
    const modal = bootstrap.Modal.getInstance(document.getElementById('addProductModal'));
    modal.hide();
    
    // Reset form
    document.getElementById('addProductForm').reset();
    
    // Reload products
            loadVendorProducts(shopId);
    
    showToast('Product added successfully!');
        }
    } catch (error) {
        console.error('Error adding product:', error);
        showToast('Failed to add product', 'danger');
    }
}

function handlePlaceOrder() {
    if (orderItems.length === 0) return;
    
    const currentVendor = getCurrentVendor();
    const order = {
        id: Date.now().toString(),
        vendorId: currentVendor.id,
        items: orderItems,
        total: orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        status: 'pending',
        orderDate: new Date().toISOString()
    };
    
    // Save order
    const vendorOrders = getVendorOrders(currentVendor.id);
    vendorOrders.push(order);
    saveVendorOrders(currentVendor.id, vendorOrders);
    
    // Clear order
    orderItems = [];
    updateOrderSummary();
    
    // Close modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('orderProductsModal'));
    modal.hide();
    
    showToast('Order placed successfully! You can track it in the Orders section.');
}

// Helper functions
function getCurrentVendor() {
    const sessionVendor = sessionStorage.getItem('currentVendor');
    const localVendor = localStorage.getItem('currentVendor');
    
    let vendor = null;
    if (sessionVendor) {
        vendor = JSON.parse(sessionVendor);
    } else if (localVendor) {
        vendor = JSON.parse(localVendor);
    }
    
    // Clean up vendor object if it has invalid shop ID
    if (vendor && vendor.currentShopId) {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        const isValidUUID = uuidRegex.test(vendor.currentShopId);
        
        if (!isValidUUID) {
            console.warn('Invalid shop ID in vendor object, cleaning up:', vendor.currentShopId);
            delete vendor.currentShopId;
            delete vendor.currentShop;
        }
    }
    
    return vendor;
}

function getVendorProducts(vendorId, shopId) {
    let products = JSON.parse(localStorage.getItem(`vendorProducts_${vendorId}`) || '[]');
    
    // If shop ID is provided, filter products by shop
    if (shopId) {
        products = products.filter(product => 
            product.shopId === shopId || 
            // For backward compatibility with existing products without shopId
            (!product.shopId && shopId === localStorage.getItem('currentShopId'))
        );
    }
    
    return products;
}

function saveVendorProducts(vendorId, products) {
    // If we have existing products, we want to add or update only the new ones
    const existingProducts = JSON.parse(localStorage.getItem(`vendorProducts_${vendorId}`) || '[]');
    
    // For each product in the new list
    products.forEach(product => {
        // Find if it already exists
        const existingIndex = existingProducts.findIndex(p => p.id === product.id);
        
        if (existingIndex >= 0) {
            // Update existing product
            existingProducts[existingIndex] = product;
        } else {
            // Add new product
            existingProducts.push(product);
        }
    });
    
    localStorage.setItem(`vendorProducts_${vendorId}`, JSON.stringify(existingProducts));
}

function getVendorOrders(vendorId) {
    return JSON.parse(localStorage.getItem(`vendorOrders_${vendorId}`) || '[]');
}

function saveVendorOrders(vendorId, orders) {
    localStorage.setItem(`vendorOrders_${vendorId}`, JSON.stringify(orders));
}

function getSupplierProducts() {
    // No demo products - return empty array
    // This function is used for the "Order Products" modal, not for vendor's own products
    return [];
}

// Demo products initialization function removed
// Only user-added products will be displayed

// Function to clear demo products from localStorage
async function clearDemoProducts() {
    try {
        const currentVendor = getCurrentVendor();
        if (!currentVendor) return;
        
        console.log('Clearing demo products from localStorage...');
        
        // Get existing products
        let products = JSON.parse(localStorage.getItem(`vendorProducts_${currentVendor.id}`) || '[]');
        
        // Filter out demo products (products with IDs starting with 'vp', 'sp', or common demo names)
        const demoProductNames = [
            'Vitamin C Tablets',
            'Digital Thermometer', 
            'Rainbow Multivitamin',
            'Multivitamin Tablets',
            'Blood Pressure Monitor',
            'Paracetamol 500mg',
            'Vitamin D3 Drops',
            'Bandage Roll',
            'RAINBOW',
            'Rainbow',
            'VITAMIN C TABLETS',
            'DIGITAL THERMOMETER'
        ];
        
        const originalCount = products.length;
        products = products.filter(product => {
            // Remove products with demo IDs or demo names
            const isDemoId = product.id && (product.id.startsWith('vp') || product.id.startsWith('sp'));
            const isDemoName = demoProductNames.some(demoName => 
                product.name && (
                    product.name.toLowerCase().includes(demoName.toLowerCase()) ||
                    demoName.toLowerCase().includes(product.name.toLowerCase())
                )
            );
            return !isDemoId && !isDemoName;
        });
        
        const removedCount = originalCount - products.length;
        if (removedCount > 0) {
            console.log(`Removed ${removedCount} demo products`);
            localStorage.setItem(`vendorProducts_${currentVendor.id}`, JSON.stringify(products));
            
            // Force refresh the products display
            const currentShopId = localStorage.getItem('currentShopId') || sessionStorage.getItem('currentShopId');
            if (currentShopId) {
                // Also clear from Supabase if available
                if (typeof window.supabaseService !== 'undefined') {
                    try {
                        const supabaseProducts = await window.supabaseService.getProductsByShopId(currentShopId);
                        if (supabaseProducts && supabaseProducts.length > 0) {
                            // Remove demo products from Supabase as well
                            for (const product of supabaseProducts) {
                                if (demoProductNames.includes(product.name) || 
                                    (product.id && (product.id.startsWith('vp') || product.id.startsWith('sp')))) {
                                    await window.supabaseService.deleteProduct(product.id);
                                    console.log('Deleted demo product from Supabase:', product.name);
                                }
                            }
                        }
                    } catch (error) {
                        console.error('Error clearing demo products from Supabase:', error);
                    }
                }
                
                setTimeout(() => {
                    loadVendorProducts(currentShopId);
                }, 200);
            }
        }
        
        // Also clear any supplier products from localStorage
        localStorage.removeItem('supplierProducts');
        
        // Clear any other demo product storage keys
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && (key.includes('demoProducts') || key.includes('supplierProducts'))) {
                keysToRemove.push(key);
            }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key));
        
    } catch (error) {
        console.error('Error clearing demo products:', error);
    }
}

function editProduct(productId) {
    console.log('Edit product:', productId);
    
    // Get current vendor
    const currentVendor = getCurrentVendor();
    if (!currentVendor) {
        showToast('Please login to edit products', 'error');
        return;
    }

    // Get products
    const products = getVendorProducts(currentVendor.id, currentVendor.currentShopId);
    const product = products.find(p => p.id === productId);
    
    if (!product) {
        showToast('Product not found', 'error');
        return;
    }

    // Create edit modal
    const modalHTML = `
        <div class="modal fade" id="editProductModal" tabindex="-1" aria-labelledby="editProductModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="editProductModalLabel">
                            <i class="fa-solid fa-edit me-2"></i>Edit Product
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <form id="editProductForm">
                            <input type="hidden" id="editProductId" value="${product.id}">
                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label for="editProductName" class="form-label">Product Name *</label>
                                    <input type="text" class="form-control" id="editProductName" value="${product.name}" required>
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label for="editProductCategory" class="form-label">Category *</label>
                                    <select class="form-select" id="editProductCategory" required>
                                        <option value="medicines" ${product.category === 'medicines' ? 'selected' : ''}>Medicines</option>
                                        <option value="supplements" ${product.category === 'supplements' ? 'selected' : ''}>Supplements</option>
                                        <option value="equipment" ${product.category === 'equipment' ? 'selected' : ''}>Equipment</option>
                                        <option value="firstaid" ${product.category === 'firstaid' ? 'selected' : ''}>First Aid</option>
                                        <option value="babycare" ${product.category === 'babycare' ? 'selected' : ''}>Baby Care</option>
                                    </select>
                                </div>
                            </div>
                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label for="editProductPrice" class="form-label">Price (₹) *</label>
                                    <input type="number" class="form-control" id="editProductPrice" value="${product.price}" min="0" step="0.01" required>
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label for="editProductStock" class="form-label">Stock Quantity *</label>
                                    <input type="number" class="form-control" id="editProductStock" value="${product.stock}" min="0" required>
                                </div>
                            </div>
                            <div class="mb-3">
                                <label for="editProductDescription" class="form-label">Description</label>
                                <textarea class="form-control" id="editProductDescription" rows="3">${product.description || ''}</textarea>
                            </div>
                            <div class="mb-3">
                                <label for="editProductImage" class="form-label">Product Image URL</label>
                                <input type="url" class="form-control" id="editProductImage" value="${product.image || ''}" placeholder="https://example.com/product-image.jpg">
                                <div class="form-text">
                                    <small class="text-muted">
                                        <i class="fa-solid fa-info-circle me-1"></i>
                                        Optional: Provide a valid image URL. If left blank, a default image will be used based on the product category.
                                    </small>
                                </div>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="submit" form="editProductForm" class="btn btn-primary">Save Changes</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Add modal to body
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Create and show modal
    const modal = new bootstrap.Modal(document.getElementById('editProductModal'));
    modal.show();
    
    // Handle form submission
    document.getElementById('editProductForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        await handleEditProduct();
    });
    
    // Clean up modal after it's hidden
    document.getElementById('editProductModal').addEventListener('hidden.bs.modal', function() {
        this.remove();
    });
}

function deleteProduct(productId) {
    if (confirm('Are you sure you want to delete this product?')) {
        console.log('Deleting product:', productId);
        
        const currentVendor = getCurrentVendor();
        if (!currentVendor) {
            showToast('Please login to delete products', 'error');
            return;
        }

        try {
            let products = getVendorProducts(currentVendor.id, currentVendor.currentShopId);
            const initialCount = products.length;
            
            // Filter out the product to delete
            products = products.filter(p => p.id !== productId);
            
            if (products.length === initialCount) {
                showToast('Product not found', 'error');
                return;
            }

            // Save updated products
            saveVendorProducts(currentVendor.id, products);

            // Update Supabase if available
            if (typeof window.supabaseService !== 'undefined') {
                window.supabaseService.deleteProduct(productId)
                    .then(() => console.log('Product deleted from Supabase'))
                    .catch(err => console.warn('Error deleting from Supabase:', err));
            }

            showToast('Product deleted successfully', 'success');
            
            // Reload products display
            setTimeout(() => {
                loadVendorProducts(currentVendor.currentShopId);
            }, 500);

        } catch (error) {
            console.error('Error deleting product:', error);
            showToast('Error deleting product', 'error');
        }
    }
}

async function handleEditProduct() {
    console.log('Handling edit product form submission');
    
    const currentVendor = getCurrentVendor();
    if (!currentVendor) {
        showToast('Please login to edit products', 'error');
        return;
    }

    const shopId = currentVendor.currentShopId;
    if (!shopId) {
        showToast('No shop selected', 'error');
        return;
    }

    const productId = document.getElementById('editProductId').value;
    const formData = {
        name: document.getElementById('editProductName').value,
        category: document.getElementById('editProductCategory').value,
        price: parseFloat(document.getElementById('editProductPrice').value),
        stock: parseInt(document.getElementById('editProductStock').value),
        description: document.getElementById('editProductDescription').value,
        image: document.getElementById('editProductImage').value
    };

    try {
        console.log('Updating product with data:', formData);

        // Get existing products
        let products = getVendorProducts(currentVendor.id, shopId);
        const productIndex = products.findIndex(p => p.id === productId);
        
        if (productIndex === -1) {
            showToast('Product not found', 'error');
            return;
        }

        // Update product data
        products[productIndex] = {
            ...products[productIndex],
            ...formData,
            updatedAt: new Date().toISOString()
        };

        // Save updated products
        saveVendorProducts(currentVendor.id, products);

        // Update Supabase if available
        if (typeof window.supabaseService !== 'undefined') {
            const updateData = {
                ...formData,
                vendorId: currentVendor.id,
                shopId: shopId
            };
            
            await window.supabaseService.updateProduct(productId, updateData);
            console.log('Product updated in Supabase');
        }

        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('editProductModal'));
        modal.hide();

        showToast('Product updated successfully', 'success');
        
        // Reload products display
        setTimeout(() => {
            loadVendorProducts(shopId);
        }, 500);

    } catch (error) {
        console.error('Error updating product:', error);
        showToast('Error updating product', 'error');
    }
}

function vendorLogout() {
    sessionStorage.removeItem('currentVendor');
    sessionStorage.removeItem('currentShopId');
    localStorage.removeItem('currentVendor');
    localStorage.removeItem('currentShopId');
    
    // Use Supabase service if available
    if (typeof window.supabaseService !== 'undefined') {
        window.supabaseService.clearSession();
    }
    
    showToast('You have been logged out successfully');
    setTimeout(() => {
        window.location.href = 'auth.html';
    }, 1500);
}

// Toast notification function
function showToast(message, type = 'success') {
    let toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3';
        document.body.appendChild(toastContainer);
    }

    const toastEl = document.createElement('div');
    const bgClass = type === 'success' ? 'bg-success' : type === 'warning' ? 'bg-warning' : type === 'info' ? 'bg-info' : 'bg-danger';
    toastEl.className = `toast align-items-center text-white ${bgClass} border-0`;
    toastEl.setAttribute('role', 'alert');
    toastEl.setAttribute('aria-live', 'assertive');
    toastEl.setAttribute('aria-atomic', 'true');

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

    const toast = new bootstrap.Toast(toastEl, {
        autohide: true,
        delay: 3000
    });
    toast.show();

    toastEl.addEventListener('hidden.bs.toast', function() {
        this.remove();
    });
}

// Make functions globally accessible
window.filterProducts = filterProducts;
window.addProduct = addProduct;
window.editProduct = editProduct;
window.deleteProduct = deleteProduct;
window.refreshPage = refreshPage;
window.forceRefreshVendorData = forceRefreshVendorData;
window.debugStoreIssue = debugStoreIssue;
window.clearDemoProducts = clearDemoProducts;

// Force clear demo products on page load
window.addEventListener('load', async () => {
    console.log('Page loaded, force clearing demo products...');
    await clearDemoProducts();
});
