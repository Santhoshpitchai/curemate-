// Supabase configuration
// These values were generated from the Supabase dashboard
const SUPABASE_URL = 'https://vahhmwunmhkudepqxrir.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZhaGhtd3VubWhrdWRlcHF4cmlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5NDYyNDQsImV4cCI6MjA2OTUyMjI0NH0.SYiCgyv24BPrQfOT3JzkypsNT_fdrthwRMIdunrdLqg';

// Initialize the Supabase client
let supabase = null;

// This function will be called when the page loads
function initSupabase() {
  try {
    console.log('Initializing Supabase client...');
    
    // Check if we already have a client
    if (supabase && typeof supabase.from === 'function') {
      console.log('Supabase client already initialized');
      window.supabase = supabase;
      return supabase;
    }
    
    // Try the most common way - window.supabase from the CDN
    if (typeof window.supabase !== 'undefined' && window.supabase !== null) {
      console.log('Found window.supabase:', typeof window.supabase);
      
      // If it has createClient method (this is the Supabase library object)
      if (typeof window.supabase.createClient === 'function') {
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('Supabase client initialized via window.supabase.createClient');
        window.supabase = supabase; // Replace the library object with our client instance
        return supabase;
      }
      
      // If window.supabase is already a client (has from() method)
      if (typeof window.supabase.from === 'function') {
        console.log('window.supabase appears to be a client already');
        supabase = window.supabase;
        return supabase;
      }
    }
    
    console.error('Supabase JS library not loaded or not accessible. Make sure to include the Supabase script tag before this file.');
    return null;
  } catch (error) {
    console.error('Error initializing Supabase client:', error);
    return null;
  }
}

// Export the supabase client and init function
window.initSupabase = initSupabase;
window.getSupabase = () => {
  if (!supabase || typeof supabase.from !== 'function') {
    console.warn('Supabase client not initialized. Attempting to initialize now...');
    supabase = initSupabase();
  }
  return supabase;
};

// Initialize immediately when this script loads
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM loaded, initializing Supabase...');
  initSupabase();
});

// Also try to initialize immediately if DOM is already loaded
if (document.readyState === 'loading') {
  // DOM is still loading, wait for DOMContentLoaded
  document.addEventListener('DOMContentLoaded', initSupabase);
} else {
  // DOM is already loaded, initialize immediately
  initSupabase();
}
