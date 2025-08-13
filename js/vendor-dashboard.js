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

    // Check if Supabase service is available
    if (typeof window.supabaseService !== 'undefined') {
        try {
            // Force cleanup of any invalid shop IDs before proceeding
            window.supabaseService.forceCleanupAndRefresh();
            
            // Get vendor with their shops
            const vendorWithShops = await window.supabaseService.getCurrentVendorWithShops();
            if (vendorWithShops) {
                console.log('Valid vendor authenticated via Supabase');
                initializeDashboard(vendorWithShops);
                // Reset redirect counter
                sessionStorage.setItem('vendorRedirectCount', '0');
                return;
            }
        } catch (error) {
            console.error('Error getting vendor with shops:', error);
        }
    }
    
    // Check if there's a Supabase session as fallback
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
    console.log('Initializing dashboard with vendor data:', vendor);
    const vendorNameElements = document.querySelectorAll('#vendorName, #dashboardVendorName');
    vendorNameElements.forEach(element => {
        // Use business_name or businessName depending on which one exists
        const displayName = vendor.business_name || vendor.businessName || "Vendor";
        console.log('Setting vendor name to:', displayName);
        element.textContent = displayName;
    });

    // Initialize shop selector if vendor has shops
    if (vendor.shops && Array.isArray(vendor.shops)) {
        initializeShopSelector(vendor);
    } else {
        // If no shops defined yet, we should prompt to create a shop
        showCreateShopPrompt();
    }

    // Load dashboard data for the current shop
    loadDashboardStats(vendor.currentShopId);
    loadRecentOrders(vendor.currentShopId);
}

function initializeShopSelector(vendor) {
    console.log('Initializing shop selector with vendor data:', vendor);
    
    // Find or create the shop selector container
    let shopSelectorContainer = document.getElementById('shopSelectorContainer');
    
    if (!shopSelectorContainer) {
        // Create the shop selector container if it doesn't exist
        shopSelectorContainer = document.createElement('div');
        shopSelectorContainer.id = 'shopSelectorContainer';
        shopSelectorContainer.className = 'mb-4';
        
        // Find the right place to insert it (after the welcome section)
        const welcomeSection = document.querySelector('.d-flex.justify-content-between.align-items-center.mb-4');
        if (welcomeSection) {
            welcomeSection.insertAdjacentElement('afterend', shopSelectorContainer);
        } else {
            // Fallback to inserting at the beginning of the main content
            const mainContent = document.querySelector('.col-md-9.col-lg-10.p-4');
            if (mainContent) {
                mainContent.insertAdjacentElement('afterbegin', shopSelectorContainer);
            }
        }
    }
    
    // Clear existing content
    shopSelectorContainer.innerHTML = '';
    
    // Create the shop selector card
    const shopSelectorCard = document.createElement('div');
    shopSelectorCard.className = 'card';
    
    // Create card header
    const cardHeader = document.createElement('div');
    cardHeader.className = 'card-header d-flex justify-content-between align-items-center';
    cardHeader.innerHTML = `
        <h5 class="card-title mb-0">Your Stores/Pharmacies</h5>
        <button id="addShopButton" class="btn btn-sm btn-primary">
            <i class="fa-solid fa-plus me-1"></i> Add New Store
        </button>
    `;
    
    // Create card body
    const cardBody = document.createElement('div');
    cardBody.className = 'card-body';
    
    // Check if shops array exists and has items
    if (!vendor.shops || !Array.isArray(vendor.shops) || vendor.shops.length === 0) {
        console.warn('No shops found for vendor or shops array is invalid:', vendor.shops);
        
        // Add a message when no shops are available
        cardBody.innerHTML = `
            <div class="alert alert-info mb-0">
                <i class="fa-solid fa-info-circle me-2"></i>
                No stores found. Click "Add New Store" to add your first store.
            </div>
        `;
    } else {
        console.log(`Adding ${vendor.shops.length} shops to selector`);
        
        // Create shop pills/buttons
        const shopPillsContainer = document.createElement('div');
        shopPillsContainer.className = 'nav nav-pills';
        
        // Add each shop as a pill button
        vendor.shops.forEach(shop => {
            console.log('Adding shop to selector:', shop);
            const pillBtn = document.createElement('button');
            pillBtn.className = `nav-link ${shop.id === vendor.currentShopId ? 'active' : ''}`;
            pillBtn.setAttribute('data-shop-id', shop.id);
            
            // Get shop type icon
            const typeIcon = getShopTypeIcon(shop.type);
            
            pillBtn.innerHTML = `
                <i class="${typeIcon} me-1"></i> ${shop.name || 'Unnamed Store'}
            `;
            
            // Add click event to switch shops
            pillBtn.addEventListener('click', function() {
                switchShop(shop.id);
            });
            
            shopPillsContainer.appendChild(pillBtn);
        });
        
        cardBody.appendChild(shopPillsContainer);
    }
    
    // Assemble the card
    shopSelectorCard.appendChild(cardHeader);
    shopSelectorCard.appendChild(cardBody);
    shopSelectorContainer.appendChild(shopSelectorCard);
    
    // Add event listener for adding a new shop
    document.getElementById('addShopButton').addEventListener('click', showAddShopModal);
}

function showCreateShopPrompt() {
    // Find the right place to insert the prompt
    const mainContent = document.querySelector('.col-md-9.col-lg-10.p-4');
    if (!mainContent) return;
    
    // Clear existing content
    const dashboardCards = document.querySelector('.row.mb-4');
    if (dashboardCards) {
        dashboardCards.style.display = 'none';
    }
    
    const recentOrdersCard = document.querySelector('.card.recent-orders');
    if (recentOrdersCard) {
        recentOrdersCard.style.display = 'none';
    }
    
    // Create the welcome prompt card
    const promptCard = document.createElement('div');
    promptCard.className = 'card mb-4 welcome-card';
    promptCard.innerHTML = `
        <div class="card-body text-center py-5">
            <div class="welcome-animation mb-4">
                <i class="fa-solid fa-store fa-4x text-primary mb-3"></i>
            </div>
            <h3>Welcome to Curemate Vendor Portal!</h3>
            <p class="text-muted mb-4">To get started, you need to add your first store or pharmacy location.</p>
            
            <div class="row justify-content-center">
                <div class="col-md-8">
                    <div class="card bg-light border-0 mb-4">
                        <div class="card-body">
                            <h5 class="mb-3"><i class="fa-solid fa-lightbulb text-warning me-2"></i> Why add a store?</h5>
                            <ul class="text-start">
                                <li>Display your products to nearby customers</li>
                                <li>Manage inventory for each location separately</li>
                                <li>Track orders and sales by location</li>
                                <li>Appear in customer's local search results</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
            
            <button id="createFirstShopButton" class="btn btn-primary btn-lg mt-2">
                <i class="fa-solid fa-plus me-1"></i> Add Your First Store
            </button>
        </div>
    `;
    
    // Add some CSS for the animation
    const style = document.createElement('style');
    style.textContent = `
        .welcome-animation {
            animation: bounce 2s infinite;
        }
        @keyframes bounce {
            0%, 20%, 50%, 80%, 100% {transform: translateY(0);}
            40% {transform: translateY(-20px);}
            60% {transform: translateY(-10px);}
        }
    `;
    document.head.appendChild(style);
    
    // Insert at the beginning of main content
    mainContent.insertAdjacentElement('afterbegin', promptCard);
    
    // Add event listener
    document.getElementById('createFirstShopButton').addEventListener('click', showAddShopModal);
}

function showAddShopModal() {
    // Create modal if it doesn't exist
    let addShopModal = document.getElementById('addShopModal');
    
    if (!addShopModal) {
        const modalHTML = `
            <div class="modal fade" id="addShopModal" tabindex="-1" aria-labelledby="addShopModalLabel" aria-hidden="true">
                <div class="modal-dialog modal-xl">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="addShopModalLabel">
                                <i class="fa-solid fa-store me-2"></i>Add New Store/Pharmacy
                            </h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <div class="row">
                                <div class="col-md-6">
                                    <form id="addShopForm">
                                        <div class="row">
                                            <div class="col-md-6 mb-3">
                                                <label for="shopName" class="form-label">Store Name *</label>
                                                <input type="text" class="form-control" id="shopName" required>
                                            </div>
                                            <div class="col-md-6 mb-3">
                                                <label for="shopType" class="form-label">Store Type *</label>
                                                <select class="form-select" id="shopType" required>
                                                    <option value="pharmacy">Pharmacy</option>
                                                    <option value="hospital">Hospital</option>
                                                    <option value="clinic">Clinic</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div class="mb-3">
                                            <label for="shopPhone" class="form-label">Phone Number</label>
                                            <input type="tel" class="form-control" id="shopPhone">
                                        </div>
                                        <div class="mb-3">
                                            <label for="shopAddress" class="form-label">Street Address *</label>
                                            <input type="text" class="form-control" id="shopAddress" required>
                                        </div>
                                        <div class="row">
                                            <div class="col-md-6 mb-3">
                                                <label for="shopCity" class="form-label">City *</label>
                                                <input type="text" class="form-control" id="shopCity" required>
                                            </div>
                                            <div class="col-md-3 mb-3">
                                                <label for="shopState" class="form-label">State *</label>
                                                <input type="text" class="form-control" id="shopState" required>
                                            </div>
                                            <div class="col-md-3 mb-3">
                                                <label for="shopPostalCode" class="form-label">Postal Code *</label>
                                                <input type="text" class="form-control" id="shopPostalCode" required>
                                            </div>
                                        </div>
                                        <div class="row">
                                            <div class="col-md-6 mb-3">
                                                <label for="shopLatitude" class="form-label">Latitude</label>
                                                <input type="number" step="0.000001" class="form-control" id="shopLatitude" readonly>
                                            </div>
                                            <div class="col-md-6 mb-3">
                                                <label for="shopLongitude" class="form-label">Longitude</label>
                                                <input type="number" step="0.000001" class="form-control" id="shopLongitude" readonly>
                                            </div>
                                        </div>
                                        <p class="text-muted">* Click on the map to select your store location</p>
                                    </form>
                                </div>
                                <div class="col-md-6">
                                    <div class="card">
                                        <div class="card-header">
                                            <h6 class="mb-0">Select Location on Map</h6>
                                        </div>
                                        <div class="card-body p-0">
                                            <div id="shopLocationMap" style="height: 400px; width: 100%;"></div>
                                        </div>
                                        <div class="card-footer">
                                            <div class="d-flex justify-content-between">
                                                <button type="button" class="btn btn-sm btn-outline-primary" id="findMyLocationBtn">
                                                    <i class="fa-solid fa-location-crosshairs me-1"></i> Use My Location
                                                </button>
                                                <button type="button" class="btn btn-sm btn-outline-secondary" id="searchLocationBtn">
                                                    <i class="fa-solid fa-search me-1"></i> Search Location
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                            <button type="button" class="btn btn-primary" id="saveShopButton">Add Store</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Append modal to body
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        addShopModal = document.getElementById('addShopModal');
        
        // Add event listeners
        document.getElementById('saveShopButton').addEventListener('click', handleAddShop);
        document.getElementById('findMyLocationBtn').addEventListener('click', findMyLocation);
        document.getElementById('searchLocationBtn').addEventListener('click', showLocationSearch);
        
        // Initialize map when modal is shown
        addShopModal.addEventListener('shown.bs.modal', initializeShopLocationMap);
    }
    
    // Show the modal
    const modal = new bootstrap.Modal(addShopModal);
    modal.show();
}

// Utility function for toast notifications
window.showToast = function(message, type = 'success') {
    // Create toast container if it doesn't exist
    let toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3';
        document.body.appendChild(toastContainer);
    }
    
    // Create toast element
    const toastId = `toast-${Date.now()}`;
    const toastHTML = `
        <div id="${toastId}" class="toast" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="toast-header ${type === 'success' ? 'bg-success text-white' : 
                                      type === 'warning' ? 'bg-warning text-dark' : 
                                      type === 'danger' ? 'bg-danger text-white' : 
                                      'bg-info text-white'}">
                <strong class="me-auto">${type === 'success' ? 'Success' : 
                                        type === 'warning' ? 'Warning' : 
                                        type === 'danger' ? 'Error' : 
                                        'Information'}</strong>
                <button type="button" class="btn-close ${type === 'warning' ? '' : 'btn-close-white'}" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
            <div class="toast-body">
                ${message}
            </div>
        </div>
    `;
    
    // Add toast to container
    toastContainer.insertAdjacentHTML('beforeend', toastHTML);
    
    // Initialize and show toast
    const toastElement = document.getElementById(toastId);
    const toast = new bootstrap.Toast(toastElement, {
        autohide: true,
        delay: 3000
    });
    
    toast.show();
    
    // Remove toast after it's hidden
    toastElement.addEventListener('hidden.bs.toast', function() {
        toastElement.remove();
    });
}

// Map variables
let shopLocationMap = null;
let shopMarker = null;
let defaultCenter = [20.5937, 78.9629]; // India center

// Get icon for shop type
function getShopTypeIcon(type) {
    switch (type?.toLowerCase()) {
        case 'hospital':
            return 'fa-solid fa-hospital';
        case 'clinic':
            return 'fa-solid fa-clinic-medical';
        case 'pharmacy':
        default:
            return 'fa-solid fa-prescription-bottle-medical';
    }
}

// Initialize map for shop location selection
function initializeShopLocationMap() {
    // If map already initialized, return
    if (shopLocationMap) return;
    
    // Initialize map
    shopLocationMap = L.map('shopLocationMap').setView(defaultCenter, 5);
    
    // Add OpenStreetMap tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(shopLocationMap);
    
    // Add click event to map
    shopLocationMap.on('click', function(e) {
        setShopLocation(e.latlng.lat, e.latlng.lng);
    });
    
    // Try to get user's location
    findMyLocation();
}

// Set shop location on map and form
function setShopLocation(lat, lng) {
    // Update form inputs
    document.getElementById('shopLatitude').value = lat;
    document.getElementById('shopLongitude').value = lng;
    
    // Update or create marker
    if (shopMarker) {
        shopMarker.setLatLng([lat, lng]);
    } else {
        shopMarker = L.marker([lat, lng], {
            draggable: true
        }).addTo(shopLocationMap);
        
        // Add dragend event to update form
        shopMarker.on('dragend', function() {
            const position = shopMarker.getLatLng();
            setShopLocation(position.lat, position.lng);
        });
    }
    
    // Center map on marker
    shopLocationMap.setView([lat, lng], 15);
    
    // Get address from coordinates (reverse geocoding)
    reverseGeocode(lat, lng);
}

// Use user's current location
function findMyLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            function(position) {
                setShopLocation(position.coords.latitude, position.coords.longitude);
            },
            function(error) {
                console.error('Error getting location:', error);
                showToast('Unable to get your location. Please select on the map.', 'warning');
            }
        );
    } else {
        showToast('Geolocation is not supported by your browser', 'warning');
    }
}

// Show location search interface
function showLocationSearch() {
    // Create a search input at the top of the map
    const searchControl = document.createElement('div');
    searchControl.className = 'leaflet-control-search';
    searchControl.style.position = 'absolute';
    searchControl.style.zIndex = '1000';
    searchControl.style.top = '10px';
    searchControl.style.left = '10px';
    searchControl.style.right = '10px';
    
    searchControl.innerHTML = `
        <div class="input-group">
            <input type="text" class="form-control" id="locationSearchInput" placeholder="Search for a location...">
            <button class="btn btn-primary" id="searchButton" type="button">
                <i class="fa-solid fa-search"></i>
            </button>
            <button class="btn btn-secondary" id="closeSearchButton" type="button">
                <i class="fa-solid fa-times"></i>
            </button>
        </div>
    `;
    
    document.getElementById('shopLocationMap').appendChild(searchControl);
    
    // Focus on the input
    const searchInput = document.getElementById('locationSearchInput');
    searchInput.focus();
    
    // Add event listeners
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchLocation(searchInput.value);
        }
    });
    
    document.getElementById('searchButton').addEventListener('click', function() {
        searchLocation(searchInput.value);
    });
    
    document.getElementById('closeSearchButton').addEventListener('click', function() {
        searchControl.remove();
    });
}

// Search for a location using Nominatim
async function searchLocation(query) {
    if (!query) return;
    
    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`);
        const data = await response.json();
        
        if (data.length > 0) {
            const result = data[0];
            setShopLocation(parseFloat(result.lat), parseFloat(result.lon));
            
            // Fill in address fields if they're empty
            if (!document.getElementById('shopAddress').value) {
                document.getElementById('shopAddress').value = result.display_name.split(',')[0] || '';
            }
            
            if (!document.getElementById('shopCity').value) {
                const addressParts = result.display_name.split(',');
                document.getElementById('shopCity').value = addressParts[1]?.trim() || '';
            }
            
            if (!document.getElementById('shopState').value) {
                const addressParts = result.display_name.split(',');
                document.getElementById('shopState').value = addressParts[addressParts.length - 2]?.trim() || '';
            }
            
            // Close search interface
            const searchControl = document.querySelector('.leaflet-control-search');
            if (searchControl) searchControl.remove();
        } else {
            showToast('Location not found. Try a different search term.', 'warning');
        }
    } catch (error) {
        console.error('Error searching location:', error);
        showToast('Failed to search location. Please try again.', 'danger');
    }
}

// Reverse geocode coordinates to get address
async function reverseGeocode(lat, lng) {
    try {
        // Show loading indicator
        showReverseGeocodingStatus('Loading location details...');
        
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1&namedetails=1`
        );
        
        const data = await response.json();
        console.log('Reverse geocoding data:', data);
        
        if (data && data.address) {
            // Extract store name from the location if possible
            let possibleName = '';
            if (data.namedetails && data.namedetails.name) {
                possibleName = data.namedetails.name;
            } else if (data.name) {
                possibleName = data.name;
            } else if (data.address.amenity) {
                possibleName = data.address.amenity;
            } else if (data.address.shop) {
                possibleName = data.address.shop;
            } else if (data.address.healthcare) {
                possibleName = data.address.healthcare;
            }
            
            // Detect store type based on OSM tags
            let storeType = 'pharmacy'; // default
            if (data.address.healthcare === 'hospital' || 
                data.address.amenity === 'hospital' ||
                (possibleName && possibleName.toLowerCase().includes('hospital'))) {
                storeType = 'hospital';
            } else if (data.address.healthcare === 'clinic' || 
                      data.address.amenity === 'clinic' ||
                      (possibleName && possibleName.toLowerCase().includes('clinic'))) {
                storeType = 'clinic';
            } else if (data.address.amenity === 'pharmacy' || 
                      data.address.shop === 'pharmacy' ||
                      (possibleName && possibleName.toLowerCase().includes('pharma'))) {
                storeType = 'pharmacy';
            }
            
            // Address components with fallbacks
            const addressInputs = {
                'shopName': possibleName,
                'shopType': storeType,
                'shopAddress': data.address.road || data.address.street || data.address.pedestrian || data.address.footway || data.address.suburb || '',
                'shopCity': data.address.city || data.address.town || data.address.village || data.address.county || '',
                'shopState': data.address.state || '',
                'shopPostalCode': data.address.postcode || '',
                'shopPhone': '' // OSM doesn't provide phone numbers
            };
            
            // Update form inputs with smart fallback (only if empty or if it's a new selection)
            for (const [inputId, value] of Object.entries(addressInputs)) {
                const input = document.getElementById(inputId);
                if (input) {
                    // For select elements
                    if (input.tagName === 'SELECT' && value) {
                        // Find the option that matches the value
                        const optionExists = Array.from(input.options).some(option => 
                            option.value.toLowerCase() === value.toLowerCase()
                        );
                        
                        if (optionExists) {
                            input.value = value;
                        }
                    } 
                    // For input elements - only update if empty
                    else if (value && (!input.value || input.getAttribute('data-autofilled') === 'true')) {
                        input.value = value;
                        input.setAttribute('data-autofilled', 'true');
                    }
                }
            }
            
            showReverseGeocodingStatus('Location details loaded', 'success');
            
            // Check for nearby stores to prevent duplicate registrations
            checkNearbyStores(lat, lng);
        } else {
            showReverseGeocodingStatus('No address details found for this location', 'warning');
        }
    } catch (error) {
        console.error('Error reverse geocoding:', error);
        showReverseGeocodingStatus('Failed to get location details', 'danger');
    }
}

// Show status message for reverse geocoding
function showReverseGeocodingStatus(message, type = 'info') {
    // Find or create status container
    let statusContainer = document.getElementById('geocodingStatus');
    if (!statusContainer) {
        statusContainer = document.createElement('div');
        statusContainer.id = 'geocodingStatus';
        statusContainer.className = 'mt-2 small';
        document.querySelector('#shopLocationMap').insertAdjacentElement('afterend', statusContainer);
    }
    
    // Set message with appropriate styling
    statusContainer.innerHTML = `<i class="fa-solid ${type === 'success' ? 'fa-check-circle' : 
                                                    type === 'warning' ? 'fa-exclamation-triangle' :
                                                    type === 'danger' ? 'fa-times-circle' : 
                                                    'fa-info-circle'}"></i> ${message}`;
    statusContainer.className = `mt-2 small text-${type}`;
    
    // Clear message after 5 seconds if it's a success
    if (type === 'success') {
        setTimeout(() => {
            statusContainer.innerHTML = '';
        }, 5000);
    }
}

// Check for nearby stores to prevent duplicate registrations
async function checkNearbyStores(lat, lng) {
    try {
        // Get current vendor
        const vendor = getCurrentVendor();
        
        if (!vendor) return;
        
        // Check for nearby stores if Supabase service is available and initialized
        if (typeof window.supabaseService !== 'undefined' && window.supabaseService.supabase) {
            try {
                // Get all shops
                const allShops = await window.supabaseService.getAllShops();
                
                if (!Array.isArray(allShops)) {
                    console.warn('No shops data available for proximity check');
                    return;
                }
                
                // Calculate distance to each shop
                const nearbyShops = allShops.filter(shop => {
                    if (!shop.latitude || !shop.longitude) return false;
                    
                    // Skip shops owned by current vendor
                    if (shop.vendor_id === vendor.id) return false;
                    
                    // Calculate distance in meters
                    const distance = calculateDistance(
                        lat, lng, 
                        shop.latitude, shop.longitude
                    );
                    
                    // Flag if within 50 meters
                    return distance < 50;
                });
                
                if (nearbyShops.length > 0) {
                    showReverseGeocodingStatus(
                        `Warning: There ${nearbyShops.length === 1 ? 'is' : 'are'} ${nearbyShops.length} existing ${nearbyShops.length === 1 ? 'store' : 'stores'} within 50 meters of this location. Please verify this is your store.`, 
                        'warning'
                    );
                }
            } catch (error) {
                console.warn('Error checking nearby stores:', error);
                // Continue with store creation even if proximity check fails
            }
        }
    } catch (error) {
        console.error('Error in checkNearbyStores:', error);
        // Continue with store creation even if proximity check fails
    }
}

// Calculate distance between two points in meters using Haversine formula
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;
    
    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    
    return R * c; // Distance in meters
}

async function handleAddShop() {
    // Check if location is selected
    const latitude = document.getElementById('shopLatitude').value;
    const longitude = document.getElementById('shopLongitude').value;
    
    if (!latitude || !longitude) {
        showToast('Please select a location on the map', 'warning');
        return;
    }
    
    // Get form values
    const shopNameEl = document.getElementById('shopName');
    const shopAddressEl = document.getElementById('shopAddress');
    const shopCityEl = document.getElementById('shopCity');
    const shopStateEl = document.getElementById('shopState');
    const shopPostalEl = document.getElementById('shopPostalCode');
    
    // Validate required fields
    if (!shopNameEl.value.trim()) {
        showToast('Please enter a store name', 'warning');
        shopNameEl.focus();
        return;
    }
    
    if (!shopAddressEl.value.trim()) {
        showToast('Please enter a street address', 'warning');
        shopAddressEl.focus();
        return;
    }
    
    if (!shopCityEl.value.trim()) {
        showToast('Please enter a city', 'warning');
        shopCityEl.focus();
        return;
    }
    
    if (!shopStateEl.value.trim()) {
        showToast('Please enter a state', 'warning');
        shopStateEl.focus();
        return;
    }
    
    // Create shop data object
    const shopData = {
        vendorId: getCurrentVendor().id,
        name: shopNameEl.value.trim(),
        type: document.getElementById('shopType').value,
        address: shopAddressEl.value.trim(),
        city: shopCityEl.value.trim(),
        state: shopStateEl.value.trim(),
        postalCode: shopPostalEl.value.trim(),
        phone: document.getElementById('shopPhone').value,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude)
    };
    
    // Show loading state
    const saveButton = document.getElementById('saveShopButton');
    const originalBtnText = saveButton.innerHTML;
    saveButton.disabled = true;
    saveButton.innerHTML = '<i class="fa-solid fa-spinner fa-spin me-1"></i> Adding Store...';
    
    try {
        // Check for possible duplicate stores
        if (typeof window.supabaseService !== 'undefined' && window.supabaseService.supabase) {
            try {
                // Check for existing stores with very similar name or address
                const allShops = await window.supabaseService.getAllShops();
                
                if (Array.isArray(allShops)) {
                    // Check for name similarity
                    const nameSimilarity = allShops.some(shop => 
                        shop.vendor_id !== shopData.vendorId && 
                        (shop.name.toLowerCase() === shopData.name.toLowerCase() ||
                         shop.name.toLowerCase().includes(shopData.name.toLowerCase()) ||
                         shopData.name.toLowerCase().includes(shop.name.toLowerCase())) &&
                        calculateDistance(shop.latitude, shop.longitude, shopData.latitude, shopData.longitude) < 500
                    );
                    
                    // Check for address similarity
                    const addressSimilarity = allShops.some(shop =>
                        shop.vendor_id !== shopData.vendorId &&
                        shop.address.toLowerCase() === shopData.address.toLowerCase() &&
                        shop.city.toLowerCase() === shopData.city.toLowerCase() &&
                        calculateDistance(shop.latitude, shop.longitude, shopData.latitude, shopData.longitude) < 100
                    );
                    
                    // If potential duplicate, ask for confirmation
                    if (nameSimilarity || addressSimilarity) {
                        saveButton.disabled = false;
                        saveButton.innerHTML = originalBtnText;
                        
                        if (!confirm('There appears to be a similar store already registered in this area. Are you sure you want to add this store?')) {
                            return;
                        }
                    }
                }
            } catch (error) {
                console.warn('Error checking for duplicate stores:', error);
                // Continue with store creation even if duplicate check fails
            }
        }
        
        // Check if Supabase is properly initialized
        let useSupabase = false;
        if (typeof window.supabaseService !== 'undefined' && window.supabaseService.supabase) {
            try {
                // Test connection
                const connected = await window.supabaseService.testConnection();
                useSupabase = connected;
            } catch (error) {
                console.warn('Supabase connection test failed:', error);
                useSupabase = false;
            }
        }
        
        // Save to Supabase if available and connected
        if (useSupabase) {
            try {
                const newShop = await window.supabaseService.createShop(shopData);
                
                // Update session with new shop
                const vendor = await window.supabaseService.getCurrentVendorWithShops();
                
                // Clean up map
                if (shopLocationMap) {
                    shopLocationMap.remove();
                    shopLocationMap = null;
                    shopMarker = null;
                }
                
                // Close modal
                const modal = bootstrap.Modal.getInstance(document.getElementById('addShopModal'));
                modal.hide();
                
                // Reinitialize dashboard with updated vendor data
                initializeDashboard(vendor);
                
                // Set the new shop as current shop if it's the first one
                if (vendor.shops && vendor.shops.length === 1) {
                    const newShop = vendor.shops[0];
                    localStorage.setItem('currentShopId', newShop.id);
                    sessionStorage.setItem('currentShopId', newShop.id);
                    
                    // Update vendor object with current shop info
                    vendor.currentShopId = newShop.id;
                    vendor.currentShop = newShop;
                    
                    // Update stored vendor data
                    localStorage.setItem('currentVendor', JSON.stringify(vendor));
                    sessionStorage.setItem('currentVendor', JSON.stringify(vendor));
                }
                
                showToast(`${shopData.name} store added successfully! You can now add products.`);
                
                // Small delay to ensure UI updates, then refresh the page to show new store
                setTimeout(() => {
                    window.location.reload();
                }, 1500);
            } catch (error) {
                console.error('Error saving to Supabase:', error);
                // Fall back to local storage
                saveToLocalStorage();
            }
        } else {
            // Fallback to local storage for demo
            saveToLocalStorage();
        }
        
        // Helper function to save to localStorage
        function saveToLocalStorage() {
            // Don't save to local storage if we have Supabase available
            // This prevents storing invalid timestamp-based IDs that conflict with UUID format
            console.warn('Supabase not available, but local storage fallback is disabled to prevent UUID conflicts');
            showToast('Store creation failed. Please check your connection and try again.', 'danger');
            
            // Reset button
            saveButton.disabled = false;
            saveButton.innerHTML = originalBtnText;
            return;
        }
    } catch (error) {
        console.error('Error adding shop:', error);
        showToast('Failed to add store. Please try again.', 'danger');
        
        // Reset button
        saveButton.disabled = false;
        saveButton.innerHTML = originalBtnText;
    }
}

async function switchShop(shopId) {
    try {
        if (typeof window.supabaseService !== 'undefined') {
            // Store selected shop ID in session storage
            const storage = localStorage.getItem('currentVendor') ? localStorage : sessionStorage;
            storage.setItem('currentShopId', shopId);
            
            // Get updated vendor with shop data
            const vendor = await window.supabaseService.getCurrentVendorWithShops();
            
            // Update dashboard with new shop data
            loadDashboardStats(shopId);
            loadRecentOrders(shopId);
            
            // Update shop selection UI
            updateShopSelectionUI(shopId);
            
            showToast(`Switched to ${vendor.currentShop ? vendor.currentShop.name : 'selected store'}`);
        } else {
            // Fallback to local storage for demo
            const vendorId = getCurrentVendor().id;
            const shops = JSON.parse(localStorage.getItem(`vendorShops_${vendorId}`) || '[]');
            
            // Store selected shop ID
            localStorage.setItem('currentShopId', shopId);
            
            // Get current vendor and update shop data
            const vendor = getCurrentVendor();
            vendor.shops = shops;
            vendor.currentShopId = shopId;
            vendor.currentShop = shops.find(shop => shop.id === shopId) || null;
            
            // Update dashboard
            loadDashboardStats(shopId);
            loadRecentOrders(shopId);
            
            // Update shop selection UI
            updateShopSelectionUI(shopId);
            
            showToast(`Switched to ${vendor.currentShop ? vendor.currentShop.name : 'selected store'}`);
        }
    } catch (error) {
        console.error('Error switching shop:', error);
        showToast('Failed to switch store. Please try again.', 'danger');
    }
}

function updateShopSelectionUI(shopId) {
    // Update the active state of shop pills
    const shopPills = document.querySelectorAll('.nav-pills .nav-link');
    shopPills.forEach(pill => {
        if (pill.getAttribute('data-shop-id') === shopId) {
            pill.classList.add('active');
        } else {
            pill.classList.remove('active');
        }
    });
}

async function loadDashboardStats(shopId) {
    try {
        // Show loading state
        updateDashboardStats({
            totalRevenue: '<i class="fa-solid fa-spinner fa-spin"></i>',
            totalOrders: '<i class="fa-solid fa-spinner fa-spin"></i>',
            productCount: '<i class="fa-solid fa-spinner fa-spin"></i>',
            customerCount: '<i class="fa-solid fa-spinner fa-spin"></i>'
        });
        
        // Default values
        let revenue = 0;
        let orders = 0;
        let products = 0;
        let customers = 0;
        
        // If no shop ID, show empty stats
        if (!shopId) {
            console.warn('No shop ID provided for dashboard stats');
            updateDashboardStats({
                totalRevenue: '₹0',
                totalOrders: 0,
                productCount: 0,
                customerCount: 0
            });
            return;
        }
        
        // If we have Supabase and it's initialized
        if (typeof window.supabaseService !== 'undefined' && window.supabaseService.supabase) {
            try {
                // Get products for this shop
                const shopProducts = await window.supabaseService.getProductsByShopId(shopId);
                products = shopProducts.length;
                
                // Get orders for this shop
                const shopOrders = await window.supabaseService.getOrdersByShopId(shopId);
                orders = shopOrders.length;
                
                // Calculate revenue from orders
                revenue = shopOrders.reduce((total, order) => total + (order.total_amount || 0), 0);
                
                // Get unique customers from orders
                const uniqueCustomers = new Set();
                shopOrders.forEach(order => {
                    if (order.user_id) uniqueCustomers.add(order.user_id);
                });
                customers = uniqueCustomers.size;
            } catch (error) {
                console.warn('Error fetching shop data from Supabase:', error);
            }
        } else {
            // Fallback to local storage
            try {
                // Get products from local storage
                const allProducts = JSON.parse(localStorage.getItem(`vendorProducts_${shopId}`) || '[]');
                products = allProducts.length;
                
                // Get orders from local storage
                const allOrders = JSON.parse(localStorage.getItem(`vendorOrders_${shopId}`) || '[]');
                orders = allOrders.length;
                
                // Calculate revenue from orders
                revenue = allOrders.reduce((total, order) => total + (order.totalAmount || 0), 0);
                
                // Get unique customers from orders
                const uniqueCustomers = new Set();
                allOrders.forEach(order => {
                    if (order.userId) uniqueCustomers.add(order.userId);
                });
                customers = uniqueCustomers.size;
            } catch (error) {
                console.warn('Error fetching shop data from local storage:', error);
            }
        }
        
        // Update the UI with real data
        updateDashboardStats({
            totalRevenue: revenue > 0 ? `₹${revenue.toLocaleString('en-IN')}` : '₹0',
            totalOrders: orders,
            productCount: products,
            customerCount: customers
        });
        
    } catch (error) {
        console.error('Error loading dashboard stats:', error);
        
        // Show error state
        updateDashboardStats({
            totalRevenue: '₹0',
            totalOrders: 0,
            productCount: 0,
            customerCount: 0
        });
    }
}

function updateDashboardStats(stats) {
    // Update the stats in the UI using the direct IDs
    const totalRevenueElement = document.getElementById('totalRevenue');
    const totalOrdersElement = document.getElementById('totalOrders');
    const productCountElement = document.getElementById('totalProducts');
    const customerCountElement = document.getElementById('totalCustomers');
    
    if (totalRevenueElement) totalRevenueElement.innerHTML = stats.totalRevenue;
    if (totalOrdersElement) totalOrdersElement.innerHTML = stats.totalOrders;
    if (productCountElement) productCountElement.innerHTML = stats.productCount;
    if (customerCountElement) customerCountElement.innerHTML = stats.customerCount;
    
    console.log('Dashboard stats updated');
}

async function loadRecentOrders(shopId) {
    const ordersTableBody = document.querySelector('#recentOrdersTable tbody');
    if (!ordersTableBody) {
        console.warn('Recent orders table body not found');
        return;
    }
    
    // Show loading state
    ordersTableBody.innerHTML = `
        <tr>
            <td colspan="5" class="text-center">
                <i class="fa-solid fa-spinner fa-spin me-2"></i> Loading orders...
            </td>
        </tr>
    `;
    
    try {
        // If no shop ID, show empty message
        if (!shopId) {
            console.warn('No shop ID provided for recent orders');
            ordersTableBody.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center text-muted">
                        <i class="fa-solid fa-store-slash me-2"></i> Please add a store to view orders
                    </td>
                </tr>
            `;
            return;
        }
        
        let orders = [];
        
        // If we have Supabase and it's initialized
        if (typeof window.supabaseService !== 'undefined' && window.supabaseService.supabase) {
            try {
                // Get orders for this shop
                const shopOrders = await window.supabaseService.getOrdersByShopId(shopId);
                
                // Format orders for display
                orders = shopOrders.map(order => {
                    // Get first product from order items (simplified)
                    const firstItem = order.order_items && order.order_items[0];
                    const product = firstItem && firstItem.products ? firstItem.products.name : 'Multiple Products';
                    
                    return {
                        orderId: `#${order.id.substring(0, 6)}`,
                        customer: order.users ? `${order.users.first_name} ${order.users.last_name}` : 'Anonymous',
                        product: product,
                        amount: `₹${order.total_amount.toLocaleString('en-IN')}`,
                        status: order.status.charAt(0).toUpperCase() + order.status.slice(1)
                    };
                });
            } catch (error) {
                console.warn('Error fetching orders from Supabase:', error);
            }
        } else {
            // Fallback to local storage
            try {
                // Get orders from local storage
                const allOrders = JSON.parse(localStorage.getItem(`vendorOrders_${shopId}`) || '[]');
                
                // Format orders for display
                orders = allOrders.map(order => {
                    return {
                        orderId: `#${order.id.substring(0, 6)}`,
                        customer: order.customerName || 'Anonymous',
                        product: order.items && order.items[0] ? order.items[0].name : 'Multiple Products',
                        amount: `₹${order.totalAmount.toLocaleString('en-IN')}`,
                        status: order.status.charAt(0).toUpperCase() + order.status.slice(1)
                    };
                });
            } catch (error) {
                console.warn('Error fetching orders from local storage:', error);
            }
        }
        
        // Sort orders by most recent first (assuming ID has timestamp)
        orders.sort((a, b) => b.orderId.localeCompare(a.orderId));
        
        // Limit to 5 most recent orders
        orders = orders.slice(0, 5);
        
        // Update the UI
        if (orders.length > 0) {
            updateRecentOrders(orders);
        } else {
            // No orders found
            ordersTableBody.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center text-muted">
                        <i class="fa-solid fa-box-open me-2"></i> No orders yet
                    </td>
                </tr>
            `;
        }
    } catch (error) {
        console.error('Error loading recent orders:', error);
        
        // Show error state
        ordersTableBody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center text-danger">
                    <i class="fa-solid fa-exclamation-triangle me-2"></i> Failed to load orders
                </td>
            </tr>
        `;
    }
}

function updateRecentOrders(orders) {
    // Find the orders table
    const ordersTable = document.querySelector('.table.table-hover tbody');
    if (!ordersTable) return;
    
    // Clear existing orders
    ordersTable.innerHTML = '';
    
    // Add new orders
    orders.forEach(order => {
        const statusClass = order.status === 'Delivered' ? 'success' : 
                            order.status === 'Shipped' ? 'primary' : 'warning';
                            
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${order.orderId}</td>
            <td>${order.customer}</td>
            <td>${order.product}</td>
            <td>${order.amount}</td>
            <td><span class="badge bg-${statusClass}">${order.status}</span></td>
        `;
        
        ordersTable.appendChild(row);
    });
    
    console.log('Recent orders updated');
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
    sessionStorage.removeItem('currentShopId');
    localStorage.removeItem('currentVendor');
    localStorage.removeItem('currentShopId');
    
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
