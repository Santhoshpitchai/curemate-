// Supabase Service for Curemate Health Hub
// This service handles all database operations with Supabase

class SupabaseService {
    constructor() {
        // Supabase client will be initialized from main.js
        this.supabase = null;
        this.initialized = false;
        
        // Start initialization
        this.initializeService().then(success => {
            this.initialized = success;
        }).catch(err => {
            console.error('Error initializing Supabase service:', err);
            this.initialized = false;
        });
    }

    async initializeService() {
        // Try to initialize for up to 10 seconds
        const maxAttempts = 100; // 100 attempts * 100ms = 10 seconds
        let attempts = 0;
        
        while (attempts < maxAttempts) {
            // Try to get Supabase client from various sources
            if (window.supabase && typeof window.supabase.from === 'function') {
                this.supabase = window.supabase;
                console.log('Supabase service initialized successfully with client:', typeof this.supabase);
                
                // Clean up any invalid shop IDs from storage
                this.cleanupInvalidShopIds();
                
                return true;
            }
            
            // Try to initialize Supabase if the init function is available
            if (typeof window.initSupabase === 'function') {
                try {
                    const client = window.initSupabase();
                    if (client && typeof client.from === 'function') {
                        this.supabase = client;
                        window.supabase = client;
                        console.log('Supabase service initialized via initSupabase function');
                        
                        // Clean up any invalid shop IDs from storage
                        this.cleanupInvalidShopIds();
                        
                        return true;
                    }
                } catch (error) {
                    console.warn('Error calling initSupabase:', error);
                }
            }
            
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
        
        console.warn('Supabase client not available after timeout. Some features may not work.');
        return false;
    }
    
    // Shop/Store Management Methods
    async createShop(shopData) {
        try {
            const { data, error } = await this.supabase
                .from('shops')
                .insert([{
                    vendor_id: shopData.vendorId,
                    name: shopData.name,
                    type: shopData.type || 'pharmacy', // pharmacy, hospital, clinic
                    address: shopData.address,
                    city: shopData.city,
                    state: shopData.state,
                    postal_code: shopData.postalCode,
                    latitude: shopData.latitude,
                    longitude: shopData.longitude,
                    phone: shopData.phone || null,
                    created_at: new Date().toISOString()
                }])
                .select();

            if (error) {
                console.error('Error creating shop:', error);
                throw error;
            }

            console.log('Shop created successfully:', data);
            return data[0];
        } catch (error) {
            console.error('Error in createShop:', error);
            throw error;
        }
    }

    async getShopsByVendorId(vendorId) {
        try {
            console.log('getShopsByVendorId called with vendorId:', vendorId);
            
            // Validate Supabase client
            if (!this.supabase) {
                console.error('Supabase client not initialized');
                await this.initializeService();
                if (!this.supabase) {
                    console.error('Failed to initialize Supabase client');
                    return [];
                }
            }
            
            // Check if the shops table exists
            try {
                await this.testConnection();
            } catch (err) {
                console.error('Connection test failed:', err);
            }
            
            // Fetch shops from database
            const { data, error } = await this.supabase
                .from('shops')
                .select('*')
                .eq('vendor_id', vendorId)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching shops:', error);
                throw error;
            }

            console.log(`Found ${data ? data.length : 0} shops for vendor ${vendorId}:`, data);
            return data || [];
        } catch (error) {
            console.error('Error in getShopsByVendorId:', error);
            
            // Try to recover by checking local storage as fallback
            try {
                const localShops = JSON.parse(localStorage.getItem(`vendorShops_${vendorId}`) || '[]');
                console.log('Fallback to local storage shops:', localShops);
                return localShops;
            } catch (e) {
                console.error('Failed to get shops from local storage:', e);
                return [];
            }
        }
    }
    
    async getShopById(shopId) {
        try {
            const { data, error } = await this.supabase
                .from('shops')
                .select('*')
                .eq('id', shopId)
                .single();

            if (error) {
                console.error('Error fetching shop:', error);
                throw error;
            }

            return data;
        } catch (error) {
            console.error('Error in getShopById:', error);
            return null;
        }
    }
    
    async getAllShops(options = {}) {
        try {
            let query = this.supabase.from('shops').select('*');
            
            // Filter by vendor ID if provided
            if (options.vendorId) {
                query = query.eq('vendor_id', options.vendorId);
            }
            
            // Filter by shop type if provided
            if (options.type) {
                query = query.eq('type', options.type);
            }
            
            if (options.limit) {
                query = query.limit(options.limit);
            }
            
            if (options.nearLocation) {
                // Sort by proximity if lat/lng provided
                // This is a simplified distance calculation
                // For more accurate calculations, use PostGIS or similar extensions
                const { lat, lng, maxDistance } = options.nearLocation;
                
                if (lat && lng) {
                    // Calculate distance in km (approximate)
                    // This is a basic calculation and would be better done server-side
                    query = query.select(`*, 
                        (6371 * acos(cos(radians(${lat})) * 
                        cos(radians(latitude)) * 
                        cos(radians(longitude) - radians(${lng})) + 
                        sin(radians(${lat})) * 
                        sin(radians(latitude)))) as distance`);
                        
                    if (maxDistance) {
                        // Filter by maximum distance if provided
                        query = query.lt('distance', maxDistance);
                    }
                    
                    query = query.order('distance', { ascending: true });
                }
            } else {
                query = query.order('created_at', { ascending: false });
            }

            const { data, error } = await query;

            if (error) {
                console.error('Error fetching shops:', error);
                throw error;
            }
            
            // Calculate accurate distances using Haversine formula if needed
            if (options.latitude !== undefined && options.longitude !== undefined && data && data.length > 0) {
                data.forEach(shop => {
                    if (shop.latitude && shop.longitude) {
                        shop.distanceInMeters = this._calculateDistance(
                            options.latitude, options.longitude,
                            shop.latitude, shop.longitude
                        );
                    }
                });
                
                // Sort by distance if requested
                if (options.sortByDistance) {
                    data.sort((a, b) => (a.distanceInMeters || Infinity) - (b.distanceInMeters || Infinity));
                }
            }

            return data || [];
        } catch (error) {
            console.error('Error in getAllShops:', error);
            return [];
        }
    }
    
    // Helper method to calculate distance between two coordinates (Haversine formula)
    _calculateDistance(lat1, lon1, lat2, lon2) {
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

    // User Authentication Methods
    async createUser(userData) {
        try {
            const { data, error } = await this.supabase
                .from('users')
                .insert([{
                    email: userData.email,
                    first_name: userData.firstName || userData.name?.split(' ')[0] || '',
                    last_name: userData.lastName || userData.name?.split(' ').slice(1).join(' ') || '',
                    phone: userData.phone || null,
                    created_at: new Date().toISOString()
                }])
                .select();

            if (error) {
                console.error('Error creating user:', error);
                throw error;
            }

            console.log('User created successfully:', data);
            return data[0];
        } catch (error) {
            console.error('Error in createUser:', error);
            throw error;
        }
    }

    async getUserByEmail(email) {
        try {
            const { data, error } = await this.supabase
                .from('users')
                .select('*')
                .eq('email', email)
                .single();

            if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
                console.error('Error fetching user:', error);
                throw error;
            }

            return data;
        } catch (error) {
            console.error('Error in getUserByEmail:', error);
            return null;
        }
    }

    async getAllUsers() {
        try {
            const { data, error } = await this.supabase
                .from('users')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching users:', error);
                throw error;
            }

            return data || [];
        } catch (error) {
            console.error('Error in getAllUsers:', error);
            return [];
        }
    }

    // Vendor Authentication Methods
    async createVendor(vendorData) {
        try {
            const { data, error } = await this.supabase
                .from('vendors')
                .insert([{
                    email: vendorData.email,
                    first_name: vendorData.contactPerson?.split(' ')[0] || '',
                    last_name: vendorData.contactPerson?.split(' ').slice(1).join(' ') || '',
                    phone: vendorData.phoneNumber || null,
                    created_at: new Date().toISOString()
                }])
                .select();

            if (error) {
                console.error('Error creating vendor:', error);
                throw error;
            }

            console.log('Vendor created successfully:', data);
            return data[0];
        } catch (error) {
            console.error('Error in createVendor:', error);
            throw error;
        }
    }

    async getVendorByEmail(email) {
        try {
            const { data, error } = await this.supabase
                .from('vendors')
                .select('*')
                .eq('email', email)
                .single();

            if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
                console.error('Error fetching vendor:', error);
                throw error;
            }

            return data;
        } catch (error) {
            console.error('Error in getVendorByEmail:', error);
            return null;
        }
    }

    async getAllVendors() {
        try {
            const { data, error } = await this.supabase
                .from('vendors')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching vendors:', error);
                throw error;
            }

            return data || [];
        } catch (error) {
            console.error('Error in getAllVendors:', error);
            return [];
        }
    }

    // Authentication Helper Methods
    async authenticateUser(email, password) {
        try {
            // For demo purposes, we'll use simple password comparison
            // In production, you should use proper authentication with hashed passwords
            const user = await this.getUserByEmail(email);
            
            if (!user) {
                return { success: false, message: 'User not found' };
            }

            // For demo, we'll accept any password for existing users
            // In production, implement proper password hashing and verification
            return { 
                success: true, 
                user: user,
                message: 'Login successful' 
            };
        } catch (error) {
            console.error('Error in authenticateUser:', error);
            return { success: false, message: 'Authentication failed' };
        }
    }

    async authenticateVendor(email, password) {
        try {
            // For demo purposes, we'll use simple password comparison
            // In production, you should use proper authentication with hashed passwords
            const vendor = await this.getVendorByEmail(email);
            
            if (!vendor) {
                return { success: false, message: 'Vendor not found' };
            }

            // For demo, we'll accept any password for existing vendors
            // In production, implement proper password hashing and verification
            return { 
                success: true, 
                vendor: vendor,
                message: 'Login successful' 
            };
        } catch (error) {
            console.error('Error in authenticateVendor:', error);
            return { success: false, message: 'Authentication failed' };
        }
    }

    // Product Management Methods
    async createProduct(productData) {
        try {
            const { data, error } = await this.supabase
                .from('products')
                .insert([{
                    vendor_id: productData.vendorId,
                    shop_id: productData.shopId,
                    name: productData.name,
                    description: productData.description || '',
                    category: productData.category,
                    price: productData.price,
                    stock: productData.stock,
                    image_url: productData.image || null,
                    created_at: new Date().toISOString()
                }])
                .select();

            if (error) {
                console.error('Error creating product:', error);
                throw error;
            }

            console.log('Product created successfully:', data);
            return data[0];
        } catch (error) {
            console.error('Error in createProduct:', error);
            throw error;
        }
    }

    async getProductsByShopId(shopId) {
        try {
            const { data, error } = await this.supabase
                .from('products')
                .select('*')
                .eq('shop_id', shopId)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching products by shop:', error);
                throw error;
            }

            return data || [];
        } catch (error) {
            console.error('Error in getProductsByShopId:', error);
            return [];
        }
    }

    async getProductsByVendorId(vendorId) {
        try {
            const { data, error } = await this.supabase
                .from('products')
                .select('*, shops:shop_id(*)')
                .eq('vendor_id', vendorId)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching products by vendor:', error);
                throw error;
            }

            return data || [];
        } catch (error) {
            console.error('Error in getProductsByVendorId:', error);
            return [];
        }
    }

    async getProductById(productId) {
        try {
            const { data, error } = await this.supabase
                .from('products')
                .select('*, shops:shop_id(*)')
                .eq('id', productId)
                .single();

            if (error) {
                console.error('Error fetching product:', error);
                throw error;
            }

            return data;
        } catch (error) {
            console.error('Error in getProductById:', error);
            return null;
        }
    }

    async updateProduct(productId, productData) {
        try {
            const { data, error } = await this.supabase
                .from('products')
                .update({
                    name: productData.name,
                    description: productData.description || '',
                    category: productData.category,
                    price: productData.price,
                    stock: productData.stock,
                    image_url: productData.image || null,
                    shop_id: productData.shopId,
                    updated_at: new Date().toISOString()
                })
                .eq('id', productId)
                .select();

            if (error) {
                console.error('Error updating product:', error);
                throw error;
            }

            console.log('Product updated successfully:', data);
            return data[0];
        } catch (error) {
            console.error('Error in updateProduct:', error);
            throw error;
        }
    }

    async deleteProduct(productId) {
        try {
            const { error } = await this.supabase
                .from('products')
                .delete()
                .eq('id', productId);

            if (error) {
                console.error('Error deleting product:', error);
                throw error;
            }

            console.log('Product deleted successfully');
            return true;
        } catch (error) {
            console.error('Error in deleteProduct:', error);
            throw error;
        }
    }
    
    // Utility Methods
    async testConnection() {
        try {
            if (!this.supabase) {
                console.warn('Supabase client not initialized, attempting to initialize...');
                const initialized = await this.initializeService();
                if (!initialized || !this.supabase) {
                    throw new Error('Supabase client not initialized');
                }
            }
            
            // Try a simple query to test the connection
            const { data, error } = await this.supabase
                .from('vendors')
                .select('id')
                .limit(1);
            
            if (error) {
                console.warn('Supabase connection test failed:', error);
                return false;
            }
            
            console.log('Supabase connection test successful');
            return true;
        } catch (error) {
            console.error('Error testing Supabase connection:', error);
            return false;
        }
    }

    // Order Management Methods
    async createOrder(orderData) {
        try {
            // First create the main order record
            const { data: order, error: orderError } = await this.supabase
                .from('orders')
                .insert([{
                    user_id: orderData.userId,
                    vendor_id: orderData.vendorId,
                    shop_id: orderData.shopId,
                    total_amount: orderData.totalAmount,
                    status: orderData.status || 'pending',
                    shipping_address: orderData.shippingAddress,
                    payment_method: orderData.paymentMethod,
                    payment_status: orderData.paymentStatus || 'pending',
                    created_at: new Date().toISOString()
                }])
                .select();

            if (orderError) {
                console.error('Error creating order:', orderError);
                throw orderError;
            }

            // Then add the order items
            const orderItems = orderData.items.map(item => ({
                order_id: order[0].id,
                product_id: item.productId,
                quantity: item.quantity,
                unit_price: item.price,
                created_at: new Date().toISOString()
            }));

            const { error: itemsError } = await this.supabase
                .from('order_items')
                .insert(orderItems);

            if (itemsError) {
                console.error('Error creating order items:', itemsError);
                throw itemsError;
            }

            console.log('Order created successfully:', order[0]);
            return order[0];
        } catch (error) {
            console.error('Error in createOrder:', error);
            throw error;
        }
    }

    async getOrdersByShopId(shopId) {
        try {
            const { data, error } = await this.supabase
                .from('orders')
                .select(`
                    *,
                    users:user_id(*),
                    order_items:id(
                        *,
                        products:product_id(*)
                    )
                `)
                .eq('shop_id', shopId)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching orders by shop:', error);
                throw error;
            }

            return data || [];
        } catch (error) {
            console.error('Error in getOrdersByShopId:', error);
            return [];
        }
    }

    async getOrdersByVendorId(vendorId) {
        try {
            const { data, error } = await this.supabase
                .from('orders')
                .select(`
                    *,
                    users:user_id(*),
                    shops:shop_id(*),
                    order_items:id(
                        *,
                        products:product_id(*)
                    )
                `)
                .eq('vendor_id', vendorId)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching orders by vendor:', error);
                throw error;
            }

            return data || [];
        } catch (error) {
            console.error('Error in getOrdersByVendorId:', error);
            return [];
        }
    }

    async updateOrderStatus(orderId, status) {
        try {
            const { data, error } = await this.supabase
                .from('orders')
                .update({ 
                    status: status,
                    updated_at: new Date().toISOString()
                })
                .eq('id', orderId)
                .select();

            if (error) {
                console.error('Error updating order status:', error);
                throw error;
            }

            console.log('Order status updated successfully:', data);
            return data[0];
        } catch (error) {
            console.error('Error in updateOrderStatus:', error);
            throw error;
        }
    }
    
    // Session Management
    setUserSession(user, rememberMe = false) {
        const storage = rememberMe ? localStorage : sessionStorage;
        storage.setItem('currentUser', JSON.stringify(user));
        storage.setItem('userType', 'customer');
    }

    setVendorSession(vendor, rememberMe = false, currentShopId = null) {
        const storage = rememberMe ? localStorage : sessionStorage;
        storage.setItem('currentVendor', JSON.stringify(vendor));
        storage.setItem('userType', 'vendor');
        
        if (currentShopId) {
            storage.setItem('currentShopId', currentShopId);
        }
    }

    getCurrentUser() {
        const sessionUser = sessionStorage.getItem('currentUser');
        const localUser = localStorage.getItem('currentUser');
        
        if (sessionUser) {
            return JSON.parse(sessionUser);
        } else if (localUser) {
            return JSON.parse(localUser);
        }
        
        return null;
    }

    getCurrentVendor() {
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
                    console.warn('Invalid shop ID format detected in getCurrentVendor:', currentShopId);
                    // Don't add the invalid ID to the vendor object
                    // The cleanup functions will handle removing it from storage
                }
            }
        }
        
        return vendor;
    }
    
    async getCurrentVendorWithShops() {
        const vendor = this.getCurrentVendor();
        console.log('getCurrentVendorWithShops - vendor from storage:', vendor);
        if (!vendor) return null;
        
        try {
            // Fetch all shops owned by this vendor
            console.log('Fetching shops for vendor ID:', vendor.id);
            const shops = await this.getShopsByVendorId(vendor.id);
            console.log('Shops fetched:', shops);
            
            // Add shops to vendor object
            vendor.shops = shops;
            
            // If there's a currentShopId set, find that shop data
            if (vendor.currentShopId) {
                console.log('Looking for current shop with ID:', vendor.currentShopId);
                
                // Check if currentShopId is a valid UUID format
                const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
                const isValidUUID = uuidRegex.test(vendor.currentShopId);
                
                if (!isValidUUID) {
                    console.warn('Invalid UUID format for currentShopId:', vendor.currentShopId);
                    vendor.currentShopId = null;
                    vendor.currentShop = null;
                    
                    // Force cleanup of invalid ID from all storage locations
                    this.forceCleanupAndRefresh();
                } else {
                    vendor.currentShop = shops.find(shop => shop.id === vendor.currentShopId) || null;
                    console.log('Current shop found:', vendor.currentShop);
                    
                    // If shop not found, clear the invalid ID
                    if (!vendor.currentShop) {
                        console.warn('Current shop ID not found in shops list, clearing it');
                        vendor.currentShopId = null;
                        vendor.currentShop = null;
                        
                        // Force cleanup of invalid ID from all storage locations
                        this.forceCleanupAndRefresh();
                    }
                }
            } else if (shops.length > 0) {
                // If no current shop is set but shops exist, set the first one as current
                console.log('No current shop set, using first shop:', shops[0]);
                vendor.currentShop = shops[0];
                vendor.currentShopId = shops[0].id;
                
                // Store the selected shop ID and update vendor object in storage
                const storage = localStorage.getItem('currentVendor') ? localStorage : sessionStorage;
                storage.setItem('currentShopId', shops[0].id);
                
                // Update the vendor object in storage to include the new currentShopId
                if (storage.getItem('currentVendor')) {
                    const storedVendor = JSON.parse(storage.getItem('currentVendor'));
                    storedVendor.currentShopId = shops[0].id;
                    storedVendor.currentShop = shops[0];
                    storage.setItem('currentVendor', JSON.stringify(storedVendor));
                    console.log('Updated vendor object in storage with new currentShopId:', shops[0].id);
                }
            } else {
                console.log('No shops found for this vendor');
            }
            
            return vendor;
        } catch (error) {
            console.error('Error in getCurrentVendorWithShops:', error);
            return vendor; // Return basic vendor info even if shops couldn't be fetched
        }
    }

    clearSession() {
        sessionStorage.removeItem('currentUser');
        sessionStorage.removeItem('currentVendor');
        sessionStorage.removeItem('currentShopId');
        sessionStorage.removeItem('userType');
        localStorage.removeItem('currentUser');
        localStorage.removeItem('currentVendor');
        localStorage.removeItem('currentShopId');
        localStorage.removeItem('userType');
    }
    
    // Clean up invalid shop IDs from storage
    cleanupInvalidShopIds() {
        try {
            // Check both localStorage and sessionStorage for invalid shop IDs
            const storages = [localStorage, sessionStorage];
            let cleanupPerformed = false;
            
            storages.forEach(storage => {
                // Clean up standalone currentShopId
                const currentShopId = storage.getItem('currentShopId');
                if (currentShopId) {
                    // Check if it's a valid UUID format
                    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
                    const isValidUUID = uuidRegex.test(currentShopId);
                    
                    if (!isValidUUID) {
                        console.warn('Cleaning up invalid shop ID from storage:', currentShopId);
                        storage.removeItem('currentShopId');
                        cleanupPerformed = true;
                    }
                }
                
                // Clean up currentShopId stored within vendor objects
                const currentVendor = storage.getItem('currentVendor');
                if (currentVendor) {
                    try {
                        const vendor = JSON.parse(currentVendor);
                        if (vendor.currentShopId) {
                            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
                            const isValidUUID = uuidRegex.test(vendor.currentShopId);
                            
                            if (!isValidUUID) {
                                console.warn('Cleaning up invalid shop ID from vendor object:', vendor.currentShopId);
                                delete vendor.currentShopId;
                                delete vendor.currentShop;
                                storage.setItem('currentVendor', JSON.stringify(vendor));
                                cleanupPerformed = true;
                            }
                        }
                    } catch (parseError) {
                        console.warn('Error parsing vendor object during cleanup:', parseError);
                    }
                }
            });
            
            if (cleanupPerformed) {
                console.log('Invalid shop IDs cleaned up. Vendor data may need to be refreshed.');
            }
        } catch (error) {
            console.warn('Error cleaning up invalid shop IDs:', error);
        }
    }
    
    // Force complete cleanup of invalid shop IDs and refresh vendor session
    forceCleanupAndRefresh() {
        try {
            console.log('Force cleaning up invalid shop IDs and refreshing vendor session...');
            
            // Clear all shop-related data from storage
            const storages = [localStorage, sessionStorage];
            storages.forEach(storage => {
                // Remove standalone currentShopId
                storage.removeItem('currentShopId');
                
                // Clean vendor object
                const currentVendor = storage.getItem('currentVendor');
                if (currentVendor) {
                    try {
                        const vendor = JSON.parse(currentVendor);
                        delete vendor.currentShopId;
                        delete vendor.currentShop;
                        delete vendor.shops;
                        storage.setItem('currentVendor', JSON.stringify(vendor));
                        console.log('Cleaned vendor object in storage');
                    } catch (parseError) {
                        console.warn('Error cleaning vendor object:', parseError);
                    }
                }
            });
            
            console.log('Force cleanup completed. Vendor session will be refreshed on next access.');
        } catch (error) {
            console.warn('Error during force cleanup:', error);
        }
    }
}

// Create global instance
window.supabaseService = new SupabaseService();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SupabaseService;
}
