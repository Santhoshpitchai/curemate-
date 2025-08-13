// Supabase Integration Test Script
console.log('Supabase Integration Test Starting...');

// Test variables
let supabaseInitialized = false;
let supabaseServiceInitialized = false;
let connectionSuccessful = false;
let vendorsTableExists = false;
let shopsTableExists = false;
let productsTableExists = false;
let ordersTableExists = false;

// Test function to run when the page loads
async function runSupabaseTests() {
    try {
        // Step 1: Check if Supabase client is initialized
        // Look for all possible ways Supabase might be exposed globally
        const supabaseGlobal = window.supabase || window.supabaseClient || window.Supabase;
        
        if (supabaseGlobal) {
            console.log('✅ Supabase client library loaded');
            supabaseInitialized = true;
            updateTestStatus('supabaseLoaded', true);
        } else {
            console.error('❌ Supabase client library not loaded');
            updateTestStatus('supabaseLoaded', false);
            return;
        }

        // Step 2: Check if window.supabase is initialized
        if (window.supabase) {
            console.log('✅ window.supabase is initialized');
            updateTestStatus('windowSupabase', true);
        } else {
            console.error('❌ window.supabase is not initialized');
            updateTestStatus('windowSupabase', false);
            
            // Try to initialize it
            try {
                window.supabase = supabase.createClient(
                    'https://vahhmwunmhkudepqxrir.supabase.co',
                    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZhaGhtd3VubWhrdWRlcHF4cmlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5NDYyNDQsImV4cCI6MjA2OTUyMjI0NH0.SYiCgyv24BPrQfOT3JzkypsNT_fdrthwRMIdunrdLqg'
                );
                console.log('✅ window.supabase initialized manually');
                updateTestStatus('windowSupabase', true);
            } catch (error) {
                console.error('❌ Failed to initialize window.supabase manually:', error);
            }
        }

        // Step 3: Check if supabaseService is initialized
        if (typeof window.supabaseService !== 'undefined') {
            console.log('✅ supabaseService is defined');
            supabaseServiceInitialized = true;
            updateTestStatus('supabaseService', true);
            
            // Check if supabaseService.supabase is initialized
            if (window.supabaseService.supabase) {
                console.log('✅ supabaseService.supabase is initialized');
                updateTestStatus('supabaseServiceClient', true);
            } else {
                console.error('❌ supabaseService.supabase is not initialized');
                updateTestStatus('supabaseServiceClient', false);
                
                // Try to initialize it
                try {
                    window.supabaseService.supabase = window.supabase;
                    console.log('✅ supabaseService.supabase initialized manually');
                    updateTestStatus('supabaseServiceClient', true);
                } catch (error) {
                    console.error('❌ Failed to initialize supabaseService.supabase manually:', error);
                }
            }
        } else {
            console.error('❌ supabaseService is not defined');
            updateTestStatus('supabaseService', false);
        }

        let connectionClient = null; // Store the client for later use
        
        // Step 4: Test connection to Supabase
        try {
            // Make sure we're using the correct client
            let client;
            
            // Try different ways to get a working Supabase client
            // First, try to get a direct reference to the Supabase client
            if (window.supabaseService && window.supabaseService.supabase) {
                client = window.supabaseService.supabase;
                console.log('Using supabaseService.supabase client');
                
                // Check if it has the necessary methods
                if (client && typeof client.from !== 'function') {
                    console.log('Client found but missing .from() method. Attempting to fix...');
                    
                    // Try to access the real client if it's nested
                    if (client.rest && typeof client.rest.from === 'function') {
                        client = {
                            from: function(table) {
                                return client.rest.from(table);
                            }
                        };
                        console.log('Using client.rest.from as client.from');
                    }
                }
            } else if (window.supabase && typeof window.supabase.from === 'function') {
                client = window.supabase;
                console.log('Using window.supabase client directly');
            } else if (window.supabase && window.supabase.client) {
                client = window.supabase.client;
                console.log('Using window.supabase.client');
            } else if (window.supabase) {
                // Try to create a new client
                try {
                    const supabaseUrl = 'https://vahhmwunmhkudepqxrir.supabase.co';
                    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZhaGhtd3VubWhrdWRlcHF4cmlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5NDYyNDQsImV4cCI6MjA2OTUyMjI0NH0.SYiCgyv24BPrQfOT3JzkypsNT_fdrthwRMIdunrdLqg';
                    client = window.supabase.createClient(supabaseUrl, supabaseKey);
                    console.log('Created new client using window.supabase.createClient');
                } catch (e) {
                    console.error('Failed to create client:', e);
                }
            }
            
            // Create a direct client as a last resort
            if (!client || typeof client.from !== 'function') {
                try {
                    console.log('Attempting to create a new Supabase client directly...');
                    // Include the Supabase client library directly if needed
                    const script = document.createElement('script');
                    script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.39.7/dist/umd/supabase.min.js';
                    script.async = false;
                    document.head.appendChild(script);
                    
                    // Wait for script to load
                    await new Promise(resolve => {
                        script.onload = resolve;
                        setTimeout(resolve, 2000); // Timeout after 2 seconds
                    });
                    
                    // Try to create a client
                    if (window.supabase && typeof window.supabase.createClient === 'function') {
                        const supabaseUrl = 'https://vahhmwunmhkudepqxrir.supabase.co';
                        const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZhaGhtd3VubWhrdWRlcHF4cmlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5NDYyNDQsImV4cCI6MjA2OTUyMjI0NH0.SYiCgyv24BPrQfOT3JzkypsNT_fdrthwRMIdunrdLqg';
                        client = window.supabase.createClient(supabaseUrl, supabaseKey);
                        console.log('Successfully created a new Supabase client');
                    }
                } catch (e) {
                    console.error('Failed to create direct client:', e);
                }
            }
            
            if (!client || typeof client.from !== 'function') {
                throw new Error('No valid Supabase client available with .from() method');
            }
            
            console.log('Client type:', typeof client);
            console.log('Client methods:', Object.keys(client));
            
            const { data, error } = await client.from('vendors').select('count');
            
            if (error) {
                console.error('❌ Connection test failed:', error);
                updateTestStatus('connection', false);
            } else {
                console.log('✅ Connection test successful');
                connectionSuccessful = true;
                connectionClient = client; // Store the working client for later use
                updateTestStatus('connection', true);
            }
        } catch (error) {
            console.error('❌ Connection test error:', error);
            updateTestStatus('connection', false);
        }

        // Step 5: Check if tables exist
        if (connectionSuccessful) {
            try {
                // Use the same client from the connection test if possible
                let client = connectionClient;
                
                if (!client || typeof client.from !== 'function') {
                    console.log('Connection client not available for table checks, creating new client...');
                    
                    // Try different ways to get a working Supabase client
                    if (window.supabaseService && window.supabaseService.supabase) {
                        client = window.supabaseService.supabase;
                        console.log('Using supabaseService.supabase client for table checks');
                        
                        // Check if it has the necessary methods
                        if (client && typeof client.from !== 'function') {
                            console.log('Client found but missing .from() method. Attempting to fix for table checks...');
                            
                            // Try to access the real client if it's nested
                            if (client.rest && typeof client.rest.from === 'function') {
                                client = {
                                    from: function(table) {
                                        return client.rest.from(table);
                                    }
                                };
                                console.log('Using client.rest.from as client.from for table checks');
                            }
                        }
                    } else if (window.supabase && typeof window.supabase.from === 'function') {
                        client = window.supabase;
                        console.log('Using window.supabase client directly for table checks');
                    } else if (window.supabase && window.supabase.client) {
                        client = window.supabase.client;
                        console.log('Using window.supabase.client for table checks');
                    } else if (window.supabase) {
                        // Try to create a new client
                        try {
                            const supabaseUrl = 'https://vahhmwunmhkudepqxrir.supabase.co';
                            const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZhaGhtd3VubWhrdWRlcHF4cmlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5NDYyNDQsImV4cCI6MjA2OTUyMjI0NH0.SYiCgyv24BPrQfOT3JzkypsNT_fdrthwRMIdunrdLqg';
                            client = window.supabase.createClient(supabaseUrl, supabaseKey);
                            console.log('Created new client for table checks');
                        } catch (e) {
                            console.error('Failed to create client for table checks:', e);
                        }
                    }
                }
                
                if (!client || typeof client.from !== 'function') {
                    throw new Error('No valid Supabase client available with .from() method for table checks');
                }
                
                // Check vendors table
                const { data: vendorsData, error: vendorsError } = await client
                    .from('vendors')
                    .select('count');
                
                if (!vendorsError) {
                    console.log('✅ Vendors table exists');
                    vendorsTableExists = true;
                    updateTestStatus('vendorsTable', true);
                } else {
                    console.error('❌ Vendors table error:', vendorsError);
                    updateTestStatus('vendorsTable', false);
                }
                
                // Check shops table
                const { data: shopsData, error: shopsError } = await client
                    .from('shops')
                    .select('count');
                
                if (!shopsError) {
                    console.log('✅ Shops table exists');
                    shopsTableExists = true;
                    updateTestStatus('shopsTable', true);
                } else {
                    console.error('❌ Shops table error:', shopsError);
                    updateTestStatus('shopsTable', false);
                }
                
                // Check products table
                const { data: productsData, error: productsError } = await client
                    .from('products')
                    .select('count');
                
                if (!productsError) {
                    console.log('✅ Products table exists');
                    productsTableExists = true;
                    updateTestStatus('productsTable', true);
                } else {
                    console.error('❌ Products table error:', productsError);
                    updateTestStatus('productsTable', false);
                }
                
                // Check orders table
                const { data: ordersData, error: ordersError } = await client
                    .from('orders')
                    .select('count');
                
                if (!ordersError) {
                    console.log('✅ Orders table exists');
                    ordersTableExists = true;
                    updateTestStatus('ordersTable', true);
                } else {
                    console.error('❌ Orders table error:', ordersError);
                    updateTestStatus('ordersTable', false);
                }
            } catch (error) {
                console.error('❌ Error checking tables:', error);
            }
        }

        // Final status
        const allTestsPassed = supabaseInitialized && 
                              supabaseServiceInitialized && 
                              connectionSuccessful && 
                              vendorsTableExists && 
                              shopsTableExists && 
                              productsTableExists && 
                              ordersTableExists;
        
        if (allTestsPassed) {
            console.log('✅ All Supabase tests passed!');
            document.getElementById('overallStatus').textContent = '✅ All tests passed!';
            document.getElementById('overallStatus').className = 'text-success';
        } else {
            console.log('❌ Some Supabase tests failed');
            document.getElementById('overallStatus').textContent = '❌ Some tests failed';
            document.getElementById('overallStatus').className = 'text-danger';
        }
    } catch (error) {
        console.error('❌ Error running Supabase tests:', error);
        document.getElementById('overallStatus').textContent = '❌ Error running tests';
        document.getElementById('overallStatus').className = 'text-danger';
    }
}

// Helper function to update test status in the UI
function updateTestStatus(testId, passed) {
    const element = document.getElementById(testId);
    if (element) {
        element.textContent = passed ? '✅ Passed' : '❌ Failed';
        element.className = passed ? 'text-success' : 'text-danger';
    }
}

// Run tests when the page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, running Supabase tests...');
    
    // Wait a bit for everything to initialize
    setTimeout(runSupabaseTests, 1000);
});
