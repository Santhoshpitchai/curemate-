// Vendor Analytics JavaScript
// Handles the analytics dashboard functionality

// Initialize the analytics page
document.addEventListener('DOMContentLoaded', function() {
    initializeAnalyticsPage();
});

async function initializeAnalyticsPage() {
    try {
        // Set vendor name in navigation
        setVendorName();
        
        // Load basic analytics data
        loadAnalyticsData();
        
        // Initialize charts
        initializeCharts();
        
    } catch (error) {
        console.error('Error initializing analytics page:', error);
    }
}

// Set vendor name in navigation
function setVendorName() {
    const currentVendor = getCurrentVendor();
    if (currentVendor) {
        const vendorNameElement = document.getElementById('vendorName');
        if (vendorNameElement) {
            vendorNameElement.textContent = currentVendor.name || 'Vendor';
        }
    }
}

// Load basic analytics data
async function loadAnalyticsData() {
    const currentVendor = getCurrentVendor();
    if (!currentVendor || !currentVendor.currentShopId) {
        console.warn('No vendor or shop selected');
        return;
    }

    try {
        // Get products from local storage
        const products = getVendorProducts(currentVendor.id, currentVendor.currentShopId);
        
        // Get orders from local storage
        const orders = getVendorOrders(currentVendor.id, currentVendor.currentShopId);
        
        // Get orders from Supabase if available
        let supabaseOrders = [];
        if (typeof window.supabaseService !== 'undefined' && window.supabaseService.initialized) {
            try {
                supabaseOrders = await window.supabaseService.getOrdersByShopId(currentVendor.currentShopId) || [];
            } catch (error) {
                console.warn('Error fetching orders from Supabase:', error);
            }
        }
        
        // Use Supabase orders if available, otherwise use local storage
        const allOrders = supabaseOrders.length > 0 ? supabaseOrders : orders;
        
        // Update stats
        updateStatsCards(products, allOrders);
        
        // Update charts with dynamic data
        updateCharts(products, allOrders);
        
    } catch (error) {
        console.error('Error loading analytics data:', error);
    }
}

// Update stats cards
function updateStatsCards(products, orders) {
    // Total products
    const totalProductsElement = document.getElementById('totalProducts');
    if (totalProductsElement) {
        totalProductsElement.textContent = products.length;
    }

    // Total orders
    const totalOrdersElement = document.getElementById('totalOrders');
    if (totalOrdersElement) {
        totalOrdersElement.textContent = orders.length;
    }

    // Total revenue
    const totalRevenueElement = document.getElementById('totalRevenue');
    if (totalRevenueElement) {
        const totalRevenue = orders.reduce((sum, order) => {
            const amount = parseFloat(order.total || order.amount || 0);
            return sum + amount;
        }, 0);
        totalRevenueElement.textContent = formatCurrency(totalRevenue);
    }

    // Low stock items
    const lowStockElement = document.getElementById('lowStock');
    if (lowStockElement) {
        const lowStockItems = products.filter(product => {
            const stock = parseInt(product.stock || 0);
            return stock <= 5;
        });
        lowStockElement.textContent = lowStockItems.length;
    }
}

// Update charts with dynamic data
function updateCharts(products, orders) {
    // Prepare category data from products
    const categoryData = {};
    products.forEach(product => {
        const category = product.category || 'Other';
        categoryData[category] = (categoryData[category] || 0) + 1;
    });

    const categories = Object.keys(categoryData);
    const categoryCounts = Object.values(categoryData);

    // Prepare monthly sales data from orders
    const monthlySales = {};
    orders.forEach(order => {
        const date = new Date(order.createdAt || order.date || Date.now());
        const monthYear = date.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
        const amount = parseFloat(order.total || order.amount || 0);
        monthlySales[monthYear] = (monthlySales[monthYear] || 0) + amount;
    });

    // Sort months chronologically
    const sortedMonths = Object.keys(monthlySales).sort((a, b) => new Date(a) - new Date(b));
    const salesValues = sortedMonths.map(month => monthlySales[month]);

    // Sales Chart
    const salesCtx = document.getElementById('salesChart');
    if (salesCtx) {
        new Chart(salesCtx, {
            type: 'line',
            data: {
                labels: sortedMonths.length > 0 ? sortedMonths : ['No Data'],
                datasets: [{
                    label: 'Sales',
                    data: salesValues.length > 0 ? salesValues : [0],
                    borderColor: 'rgb(75, 192, 192)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    tension: 0.1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return formatCurrency(value);
                            }
                        }
                    }
                }
            }
        });
    }

    // Category Chart
    const categoryCtx = document.getElementById('categoryChart');
    if (categoryCtx) {
        new Chart(categoryCtx, {
            type: 'doughnut',
            data: {
                labels: categories.length > 0 ? categories : ['No Products'],
                datasets: [{
                    data: categoryCounts.length > 0 ? categoryCounts : [1],
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.8)',
                        'rgba(54, 162, 235, 0.8)',
                        'rgba(255, 205, 86, 0.8)',
                        'rgba(75, 192, 192, 0.8)',
                        'rgba(153, 102, 255, 0.8)',
                        'rgba(255, 159, 64, 0.8)'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }
}

// Helper functions
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR'
    }).format(amount);
}

// Get vendor products from local storage
function getVendorProducts(vendorId, shopId) {
    const key = `vendor_${vendorId}_products_${shopId}`;
    const productsData = localStorage.getItem(key);
    return productsData ? JSON.parse(productsData) : [];
}

// Get vendor orders from local storage
function getVendorOrders(vendorId, shopId) {
    const key = `vendor_${vendorId}_orders_${shopId}`;
    const ordersData = localStorage.getItem(key);
    return ordersData ? JSON.parse(ordersData) : [];
}

// Get vendor products from local storage
function getVendorProducts(vendorId, shopId) {
    const key = `vendor_${vendorId}_products_${shopId}`;
    const productsData = localStorage.getItem(key);
    return productsData ? JSON.parse(productsData) : [];
}

// Get current vendor
function getCurrentVendor() {
    const vendorData = localStorage.getItem('currentVendor');
    return vendorData ? JSON.parse(vendorData) : null;
}

// Logout function
function vendorLogout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('currentVendor');
        localStorage.removeItem('currentShopId');
        window.location.href = 'vendor-signin.html';
    }
}
