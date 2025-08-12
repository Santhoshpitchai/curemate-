// Supabase configuration
const SUPABASE_URL = 'https://vahhmwunmhkudepqxrir.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZhaGhtd3VubWhrdWRlcHF4cmlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5NDYyNDQsImV4cCI6MjA2OTUyMjI0NH0.SYiCgyv24BPrQfOT3JzkypsNT_fdrthwRMIdunrdLqg';

// Initialize the Supabase client
let supabase = null;

// This function will be called when the page loads
function initSupabase() {
  try {
    // The CDN script exposes the Supabase client as 'supabase'
    if (typeof window.supabase !== 'undefined') {
      // Store our client instance in our own variable
      supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      console.log('Supabase client initialized');
      return supabase;
    } else {
      console.error('Supabase JS library not loaded. Make sure to include the Supabase script tag before this file.');
      return null;
    }
  } catch (error) {
    console.error('Error initializing Supabase client:', error);
    return null;
  }
}

// Export the supabase client and init function
window.initSupabase = initSupabase;
window.getSupabase = () => {
  if (!supabase) {
    console.warn('Supabase client not initialized. Attempting to initialize now...');
    supabase = initSupabase();
  }
  return supabase;
};
