// Vendor Map JavaScript - Handles map display and shop locations
let vendorMap = null;
let shopMarkers = [];
let currentLocationMarker = null;
const DEFAULT_MAP_CENTER = [20.5937, 78.9629]; // India center coordinates
const DEFAULT_ZOOM = 5;

// Initialize map when DOM is ready
document.addEventListener('DOMContentLoaded', async function() {
    console.log('Vendor map initializing...');
    
    // Force cleanup of any invalid shop IDs before proceeding
    if (typeof window.supabaseService !== 'undefined') {
        window.supabaseService.forceCleanupAndRefresh();
    }
    
    // Wait a moment for vendor data to load first
    setTimeout(initializeMap, 500);
});

function initializeMap() {
    // Check if map container exists
    const mapContainer = document.getElementById('storeMap');
    if (!mapContainer) {
        console.warn('Map container not found');
        return;
    }
    
    // Create map
    vendorMap = L.map('storeMap').setView(DEFAULT_MAP_CENTER, DEFAULT_ZOOM);
    
    // Add OpenStreetMap tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(vendorMap);
    
    // Add event listeners for map controls
    setupMapControls();
    
    // Get vendor shops and add to map
    loadShopsOnMap();
}

function setupMapControls() {
    const centerMapButton = document.getElementById('centerMapButton');
    if (centerMapButton) {
        centerMapButton.addEventListener('click', centerMapOnUserLocation);
    }
    
    const showAllStoresButton = document.getElementById('showAllStoresButton');
    if (showAllStoresButton) {
        showAllStoresButton.addEventListener('click', showAllShops);
    }
}

async function loadShopsOnMap() {
    try {
        let shops = [];
        
        // Get shops from Supabase if available
        if (typeof window.supabaseService !== 'undefined') {
            // Get current vendor
            const vendor = await window.supabaseService.getCurrentVendorWithShops();
            if (vendor && vendor.shops) {
                shops = vendor.shops;
            }
        } else {
            // Fallback to local storage
            const vendorId = getCurrentVendor()?.id;
            if (vendorId) {
                shops = JSON.parse(localStorage.getItem(`vendorShops_${vendorId}`) || '[]');
            }
        }
        
        // Add shop markers to map
        addShopMarkersToMap(shops);
        
        // If we have shops, fit map to show all of them
        if (shops.length > 0) {
            fitMapToShops();
        } else {
            // If no shops, try to center on user's location
            centerMapOnUserLocation();
        }
    } catch (error) {
        console.error('Error loading shops on map:', error);
    }
}

function addShopMarkersToMap(shops) {
    // Clear existing markers
    clearShopMarkers();
    
    // Add markers for each shop
    shops.forEach(shop => {
        // Skip if no coordinates
        if (!shop.latitude || !shop.longitude) {
            return;
        }
        
        // Create marker
        const marker = L.marker([shop.latitude, shop.longitude])
            .addTo(vendorMap)
            .bindPopup(`
                <div>
                    <h6>${shop.name}</h6>
                    <p>${shop.address}<br>${shop.city}, ${shop.state} ${shop.postal_code}</p>
                    ${shop.phone ? `<p>Phone: ${shop.phone}</p>` : ''}
                    <button class="btn btn-sm btn-primary" onclick="selectShop('${shop.id}')">
                        Select This Store
                    </button>
                </div>
            `);
            
        // Add to markers array
        shopMarkers.push(marker);
        
        // Check if this is the currently selected shop
        const currentShopId = getCurrentVendor()?.currentShopId;
        if (currentShopId === shop.id) {
            // Highlight the current shop
            marker.setIcon(L.icon({
                iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
                shadowSize: [41, 41]
            }));
        }
    });
}

function clearShopMarkers() {
    // Remove all shop markers from map
    shopMarkers.forEach(marker => {
        marker.remove();
    });
    
    // Clear array
    shopMarkers = [];
}

function fitMapToShops() {
    // Create a bounds object
    if (shopMarkers.length > 0) {
        const bounds = L.featureGroup(shopMarkers).getBounds();
        
        // Add some padding
        vendorMap.fitBounds(bounds, {
            padding: [50, 50]
        });
    }
}

function showAllShops() {
    // Show all shop markers and fit map to them
    fitMapToShops();
}

function centerMapOnUserLocation() {
    // Try to get user's current location
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                
                // Update map view
                vendorMap.setView([latitude, longitude], 12);
                
                // Add or update marker for current location
                if (currentLocationMarker) {
                    currentLocationMarker.setLatLng([latitude, longitude]);
                } else {
                    currentLocationMarker = L.marker([latitude, longitude], {
                        icon: L.icon({
                            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
                            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                            iconSize: [25, 41],
                            iconAnchor: [12, 41],
                            popupAnchor: [1, -34],
                            shadowSize: [41, 41]
                        })
                    }).addTo(vendorMap)
                    .bindPopup('Your Current Location')
                    .openPopup();
                }
                
                // Show success toast
                showMapToast('Map centered on your current location');
            },
            (error) => {
                console.error('Error getting location:', error);
                showMapToast('Unable to get your current location', 'danger');
            }
        );
    } else {
        showMapToast('Geolocation is not supported by your browser', 'warning');
    }
}

// Function to be called when selecting a shop from the map
function selectShop(shopId) {
    if (typeof switchShop === 'function') {
        switchShop(shopId);
    } else {
        console.warn('switchShop function not found');
        
        // Fallback: manually store the shop ID
        const storage = localStorage.getItem('currentVendor') ? localStorage : sessionStorage;
        storage.setItem('currentShopId', shopId);
        
        // Reload the page
        location.reload();
    }
}

// Helper function to get current vendor (for compatibility)
function getCurrentVendor() {
    // For backward compatibility, if we have a cached version, return it immediately
    const sessionVendor = sessionStorage.getItem('currentVendor');
    const localVendor = localStorage.getItem('currentVendor');
    
    let vendor = null;
    if (sessionVendor) {
        vendor = JSON.parse(sessionVendor);
    } else if (localVendor) {
        vendor = JSON.parse(localVendor);
    }
    
    if (vendor) {
        // Add current shop ID if available, but validate it first
        const currentShopId = sessionStorage.getItem('currentShopId') || localStorage.getItem('currentShopId');
        if (currentShopId) {
            // Validate that the shop ID is a proper UUID format
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
            const isValidUUID = uuidRegex.test(currentShopId);
            
            if (isValidUUID) {
                vendor.currentShopId = currentShopId;
            } else {
                console.warn('Invalid shop ID format detected:', currentShopId);
                // Don't add the invalid ID to the vendor object
            }
        }
    }
    
    return vendor;
}

// Toast function (simplified version)
function showMapToast(message, type = 'success') {
    // Check if the main showToast function exists
    if (typeof window.showToast === 'function') {
        window.showToast(message, type);
    } else {
        console.log(`[Map] ${message}`);
    }
}
