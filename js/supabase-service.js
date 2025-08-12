// Supabase Service for Curemate Health Hub
// This service handles all database operations with Supabase

class SupabaseService {
    constructor() {
        // Supabase client will be initialized from main.js
        this.supabase = null;
        this.initializeService();
    }

    async initializeService() {
        // Wait for supabase to be available from global scope
        while (!window.supabase) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        this.supabase = window.supabase;
        console.log('Supabase service initialized');
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

    // Utility Methods
    async testConnection() {
        try {
            const { data, error } = await this.supabase
                .from('users')
                .select('count')
                .limit(1);

            if (error) {
                console.error('Supabase connection test failed:', error);
                return false;
            }

            console.log('Supabase connection test successful');
            return true;
        } catch (error) {
            console.error('Supabase connection test error:', error);
            return false;
        }
    }

    // Session Management
    setUserSession(user, rememberMe = false) {
        const storage = rememberMe ? localStorage : sessionStorage;
        storage.setItem('currentUser', JSON.stringify(user));
        storage.setItem('userType', 'customer');
    }

    setVendorSession(vendor, rememberMe = false) {
        const storage = rememberMe ? localStorage : sessionStorage;
        storage.setItem('currentVendor', JSON.stringify(vendor));
        storage.setItem('userType', 'vendor');
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
        
        if (sessionVendor) {
            return JSON.parse(sessionVendor);
        } else if (localVendor) {
            return JSON.parse(localVendor);
        }
        
        return null;
    }

    clearSession() {
        sessionStorage.removeItem('currentUser');
        sessionStorage.removeItem('currentVendor');
        sessionStorage.removeItem('userType');
        localStorage.removeItem('currentUser');
        localStorage.removeItem('currentVendor');
        localStorage.removeItem('userType');
    }
}

// Create global instance
window.supabaseService = new SupabaseService();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SupabaseService;
}
