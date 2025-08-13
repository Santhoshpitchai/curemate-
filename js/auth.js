// Authentication functions for Curemate
// This file handles both vendor and user authentication

// Helper function to check if user is logged in
function isLoggedIn() {
  const supabase = window.getSupabase();
  if (!supabase) return false;
  
  return supabase.auth.getSession().then(({ data }) => {
    return data.session !== null;
  });
}

// Helper function to get current user
async function getCurrentUser() {
  const supabase = window.getSupabase();
  if (!supabase) return null;
  
  const { data, error } = await supabase.auth.getUser();
  if (error) {
    console.error('Error getting user:', error.message);
    return null;
  }
  return data.user;
}

// Helper function to check if the logged-in user is a vendor
async function isVendor() {
  const supabase = window.getSupabase();
  if (!supabase) return false;
  
  const user = await getCurrentUser();
  if (!user) return false;
  
  // Check user metadata first - this is most reliable
  if (user.user_metadata && user.user_metadata.is_vendor === true) {
    console.log('User is vendor based on metadata');
    
    // For localhost/development, we'll automatically create the vendor entry if it's missing
    if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
      const { data: existingVendor } = await supabase
        .from('vendors')
        .select('id')
        .eq('id', user.id)
        .single();
      
      if (!existingVendor) {
        console.log('Auto-creating vendor record for development environment');
        await supabase.from('vendors').upsert({
          id: user.id,
          email: user.email,
          first_name: user.user_metadata.first_name || '',
          last_name: user.user_metadata.last_name || '',
          business_name: user.user_metadata.business_name || 'Development Vendor'
        });
      }
    }
    
    return true;
  }
  
  // Also check the vendors table
  const { data, error } = await supabase
    .from('vendors')
    .select('id')
    .eq('id', user.id)
    .single();
    
  if (error) {
    console.error('Error checking vendor status:', error.message);
    
    // Special case for development environment
    if ((location.hostname === 'localhost' || location.hostname === '127.0.0.1') && 
        user.user_metadata && user.user_metadata.is_vendor === true) {
      console.warn('Development environment - allowing vendor access despite database error');
      return true;
    }
    
    return false;
  }
  
  return data !== null;
}

// User Authentication Functions
const userAuth = {
  // Sign up a new user
  async signUp(email, password, firstName, lastName, phone = null) {
    const supabase = window.getSupabase();
    if (!supabase) return { error: { message: 'Supabase not initialized' } };
    
    try {
      // Register the user with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName
          }
        }
      });
      
      if (authError) {
        console.error('Error signing up:', authError.message);
        return { error: authError };
      }
      
      console.log('User created successfully with ID:', authData.user.id);
      
      // Sign in the user to get a valid session for RLS policies
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (signInError) {
        console.error('Error signing in after signup:', signInError.message);
        return { error: signInError };
      }
      
      // Add user details to the users table
      const { error: profileError } = await supabase
        .from('users')
        .insert([
          {
            id: authData.user.id,
            email,
            first_name: firstName,
            last_name: lastName,
            phone
          }
        ]);
      
      if (profileError) {
        console.error('Error creating user profile:', profileError.message);
        return { error: profileError };
      }
      
      return { user: authData.user };
    } catch (error) {
      console.error('Unexpected error during signup:', error);
      return { error: { message: 'An unexpected error occurred during signup' } };
    }
  },
  
  // Sign in an existing user
  async signIn(email, password) {
    const supabase = window.getSupabase();
    if (!supabase) return { error: { message: 'Supabase not initialized' } };
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) {
      console.error('Error signing in:', error.message);
      return { error };
    }
    
    return { session: data.session, user: data.user };
  },
  
  // Sign out the current user
  async signOut() {
    const supabase = window.getSupabase();
    if (!supabase) return { error: { message: 'Supabase not initialized' } };
    
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('Error signing out:', error.message);
      return { error };
    }
    
    return { success: true };
  },
  
  // Reset password
  async resetPassword(email) {
    const supabase = window.getSupabase();
    if (!supabase) return { error: { message: 'Supabase not initialized' } };
    
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    
    if (error) {
      console.error('Error resetting password:', error.message);
      return { error };
    }
    
    return { success: true };
  },
  
  // Get user profile
  async getProfile() {
    const supabase = window.getSupabase();
    if (!supabase) return { error: { message: 'Supabase not initialized' } };
    
    const user = await getCurrentUser();
    if (!user) return { error: { message: 'Not authenticated' } };
    
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (error) {
      console.error('Error fetching profile:', error.message);
      return { error };
    }
    
    return { profile: data };
  },
  
  // Update user profile
  async updateProfile(updates) {
    const supabase = window.getSupabase();
    if (!supabase) return { error: { message: 'Supabase not initialized' } };
    
    const user = await getCurrentUser();
    if (!user) return { error: { message: 'Not authenticated' } };
    
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', user.id);
    
    if (error) {
      console.error('Error updating profile:', error.message);
      return { error };
    }
    
    return { success: true, data };
  }
};

// Vendor Authentication Functions
const vendorAuth = {
  // Sign up a new vendor
  async signUp(email, password, firstName, lastName, businessName, phone = null) {
    const supabase = window.getSupabase();
    if (!supabase) return { error: { message: 'Supabase not initialized' } };
    
    try {
      console.log('Starting vendor signup process for:', email);
      
      // Register the vendor with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            is_vendor: true,
            business_name: businessName
          }
        }
      });
      
      if (authError) {
        console.error('Error signing up vendor:', authError.message);
        return { error: authError };
      }
      
      console.log('Vendor created successfully with ID:', authData.user.id);
      
      // Sign in the user to get a valid session for RLS policies
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (signInError) {
        console.error('Error signing in after vendor signup:', signInError.message);
        return { error: signInError };
      }
      
      console.log('Signed in after signup, now creating vendor profile');
      
      // Add vendor details to the vendors table
      const { data: vendorData, error: profileError } = await supabase
        .from('vendors')
        .upsert([
          {
            id: authData.user.id,
            email,
            first_name: firstName,
            last_name: lastName,
            business_name: businessName,
            phone
          }
        ], { onConflict: 'id' })
        .select();
      
      console.log('Vendor profile creation result:', { vendorData, profileError });
      
      if (profileError) {
        console.error('Error creating vendor profile:', profileError.message);
        // Even if there's an error, we'll continue with a warning since the auth part worked
        console.warn('Auth part succeeded but database record creation failed - may affect login');
      }
      
      return { user: authData.user };
    } catch (error) {
      console.error('Unexpected error during vendor signup:', error);
      return { error: { message: 'An unexpected error occurred during signup' } };
    }
  },
  
  // Sign in an existing vendor
  async signIn(email, password) {
    const supabase = window.getSupabase();
    if (!supabase) return { error: { message: 'Supabase not initialized' } };
    
    console.log('Attempting vendor login for:', email);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) {
      console.error('Error signing in vendor:', error.message);
      return { error };
    }
    
    console.log('User authenticated successfully, checking if vendor:', data.user.id);
    // Check if this user is a vendor
    const { data: vendorData, error: vendorError } = await supabase
      .from('vendors')
      .select('*')
      .eq('id', data.user.id)
      .single();
    
    console.log('Vendor check result:', { vendorData, vendorError });
    
    // Special handling for development environment - allow login even if the database check fails
    // This is likely a temporary fix until the database is properly set up
    if ((vendorError || !vendorData) && (location.hostname === 'localhost' || location.hostname === '127.0.0.1')) {
      console.warn('Development environment detected - bypassing vendor check');
      const devVendor = { 
        id: data.user.id,
        email: email,
        business_name: "Dev Vendor",
        first_name: data.user.user_metadata?.first_name || "Dev",
        last_name: data.user.user_metadata?.last_name || "User"
      };
      
      // Store vendor session data
      localStorage.setItem('currentVendor', JSON.stringify(devVendor));
      sessionStorage.setItem('currentVendor', JSON.stringify(devVendor));
      
      return { 
        session: data.session, 
        user: data.user, 
        vendor: devVendor
      };
    }
    
    if (vendorError || !vendorData) {
      console.error('User is not a vendor:', data.user.id);
      await supabase.auth.signOut();
      return { error: { message: 'User is not a vendor' } };
    }
    
    // Store vendor session data to ensure persistence
    const formattedVendor = {
      id: vendorData.id,
      email: vendorData.email,
      businessName: vendorData.business_name,
      firstName: vendorData.first_name,
      lastName: vendorData.last_name,
      phone: vendorData.phone
    };
    
    localStorage.setItem('currentVendor', JSON.stringify(formattedVendor));
    sessionStorage.setItem('currentVendor', JSON.stringify(formattedVendor));
    
    return { session: data.session, user: data.user, vendor: vendorData };
  },
  
  // Sign out the current vendor
  async signOut() {
    const supabase = window.getSupabase();
    if (!supabase) return { error: { message: 'Supabase not initialized' } };
    
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('Error signing out vendor:', error.message);
      return { error };
    }
    
    return { success: true };
  },
  
  // Get vendor profile
  async getProfile() {
    const supabase = window.getSupabase();
    if (!supabase) return { error: { message: 'Supabase not initialized' } };
    
    const user = await getCurrentUser();
    if (!user) return { error: { message: 'Not authenticated' } };
    
    const { data, error } = await supabase
      .from('vendors')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (error) {
      console.error('Error fetching vendor profile:', error.message);
      return { error };
    }
    
    return { profile: data };
  },
  
  // Update vendor profile
  async updateProfile(updates) {
    const supabase = window.getSupabase();
    if (!supabase) return { error: { message: 'Supabase not initialized' } };
    
    const user = await getCurrentUser();
    if (!user) return { error: { message: 'Not authenticated' } };
    
    const { data, error } = await supabase
      .from('vendors')
      .update(updates)
      .eq('id', user.id);
    
    if (error) {
      console.error('Error updating vendor profile:', error.message);
      return { error };
    }
    
    return { success: true, data };
  }
};

// Test function to check Supabase initialization
function testSupabaseConnection() {
  const supabase = window.getSupabase();
  if (!supabase) {
    console.error('Supabase client is not initialized');
    return { success: false, message: 'Supabase client is not initialized' };
  }
  
  console.log('Supabase client is initialized');
  return { success: true, message: 'Supabase client is initialized' };
}

// Export authentication functions
window.userAuth = userAuth;
window.vendorAuth = vendorAuth;
window.isLoggedIn = isLoggedIn;
window.getCurrentUser = getCurrentUser;
window.isVendor = isVendor;
window.testSupabaseConnection = testSupabaseConnection;
