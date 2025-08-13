// Vendor Customers JavaScript
// Handles the customers management functionality

// Initialize the customers page
document.addEventListener('DOMContentLoaded', function() {
    initializeCustomersPage();
});

async function initializeCustomersPage() {
    try {
        // Set vendor name in navigation
        setVendorName();
        
        // Load customers data
        loadCustomersData();
        
        // Setup search functionality
        setupSearch();
        
    } catch (error) {
        console.error('Error initializing customers page:', error);
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

// Load customers data
async function loadCustomersData() {
    const currentVendor = getCurrentVendor();
    if (!currentVendor || !currentVendor.currentShopId) {
        console.warn('No vendor or shop selected');
        return;
    }

    try {
        const customers = await getCustomers(currentVendor.id, currentVendor.currentShopId);
        displayCustomers(customers);
        updateStatsCards(customers);
        
    } catch (error) {
        console.error('Error loading customers data:', error);
    }
}

// Get customers from orders data (dynamic)
async function getCustomers(vendorId, shopId) {
    try {
        // Get orders to extract customer information
        let orders = [];
        
        // Try to get orders from Supabase first
        if (typeof window.supabaseService !== 'undefined' && window.supabaseService.initialized) {
            try {
                orders = await window.supabaseService.getOrdersByShopId(shopId) || [];
            } catch (error) {
                console.warn('Error fetching orders from Supabase:', error);
            }
        }
        
        // Fallback to local storage
        if (orders.length === 0) {
            orders = getVendorOrders(vendorId, shopId);
        }

        // Extract unique customers from orders
        const customerMap = new Map();
        
        orders.forEach(order => {
            const customerId = order.customerId || order.userId || order.email || `cust_${Date.now()}`;
            const customerName = order.customerName || order.userName || 'Unknown Customer';
            const email = order.email || 'N/A';
            const phone = order.phone || 'N/A';
            
            if (customerMap.has(customerId)) {
                const existing = customerMap.get(customerId);
                existing.totalOrders += 1;
                existing.totalSpent += parseFloat(order.total || order.amount || 0);
                
                // Update last order date if this order is newer
                const orderDate = new Date(order.createdAt || order.date || Date.now());
                const existingDate = new Date(existing.lastOrder);
                if (orderDate > existingDate) {
                    existing.lastOrder = order.createdAt || order.date || new Date().toISOString();
                }
            } else {
                customerMap.set(customerId, {
                    id: customerId,
                    name: customerName,
                    email: email,
                    phone: phone,
                    totalOrders: 1,
                    totalSpent: parseFloat(order.total || order.amount || 0),
                    lastOrder: order.createdAt || order.date || new Date().toISOString(),
                    status: 'active'
                });
            }
        });

        // Convert to array and sort by last order date
        const customers = Array.from(customerMap.values())
            .sort((a, b) => new Date(b.lastOrder) - new Date(a.lastOrder));

        // Determine repeat customers (more than 3 orders)
        customers.forEach(customer => {
            if (customer.totalOrders > 3) {
                customer.status = 'repeat';
            }
        });

        return customers;
        
    } catch (error) {
        console.error('Error getting customers:', error);
        return [];
    }
}

// Display customers in table
function displayCustomers(customers) {
    const tbody = document.getElementById('customersTableBody');
    if (!tbody) return;

    if (customers.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center py-4">
                    <i class="fa-solid fa-users fa-3x text-muted mb-3"></i>
                    <h6 class="text-muted">No customers found</h6>
                    <p class="text-muted">Customer data will appear here</p>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = customers.map(customer => `
        <tr>
            <td>
                <div class="d-flex align-items-center">
                    <div class="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-3" 
                         style="width: 40px; height: 40px; font-size: 14px; font-weight: bold;">
                        ${customer.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                        <div class="fw-bold">${customer.name}</div>
                        <small class="text-muted">${customer.status}</small>
                    </div>
                </div>
            </td>
            <td>${customer.email}</td>
            <td>${customer.phone}</td>
            <td>
                <span class="badge bg-primary">${customer.totalOrders}</span>
            </td>
            <td>${formatCurrency(customer.totalSpent)}</td>
            <td>${formatDate(customer.lastOrder)}</td>
            <td>
                <button class="btn btn-sm btn-outline-primary me-1" onclick="viewCustomer('${customer.id}')">
                    <i class="fa-solid fa-eye"></i>
                </button>
                <button class="btn btn-sm btn-outline-secondary" onclick="contactCustomer('${customer.id}')">
                    <i class="fa-solid fa-envelope"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

// Update stats cards
function updateStatsCards(customers) {
    // Total customers
    const totalCustomersElement = document.getElementById('totalCustomers');
    if (totalCustomersElement) {
        totalCustomersElement.textContent = customers.length;
    }

    // Active customers
    const activeCustomersElement = document.getElementById('activeCustomers');
    if (activeCustomersElement) {
        const activeCustomers = customers.filter(c => c.status === 'active');
        activeCustomersElement.textContent = activeCustomers.length;
    }

    // Repeat customers
    const repeatCustomersElement = document.getElementById('repeatCustomers');
    if (repeatCustomersElement) {
        const repeatCustomers = customers.filter(c => c.status === 'repeat');
        repeatCustomersElement.textContent = repeatCustomers.length;
    }
}

// Setup search functionality
function setupSearch() {
    const searchInput = document.getElementById('searchCustomers');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            filterCustomers(searchTerm);
        });
    }
}

// Filter customers based on search
function filterCustomers(searchTerm) {
    const tbody = document.getElementById('customersTableBody');
    const rows = tbody.getElementsByTagName('tr');

    Array.from(rows).forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm) ? '' : 'none';
    });
}

// View customer details
function viewCustomer(customerId) {
    console.log('View customer:', customerId);
    showToast('Customer details feature coming soon', 'info');
}

// Contact customer
function contactCustomer(customerId) {
    console.log('Contact customer:', customerId);
    showToast('Contact customer feature coming soon', 'info');
}

// Helper functions
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR'
    }).format(amount);
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

// Get current vendor
function getCurrentVendor() {
    const vendorData = localStorage.getItem('currentVendor');
    return vendorData ? JSON.parse(vendorData) : null;
}

// Show toast message
function showToast(message, type = 'info') {
    // Create toast element
    const toastContainer = document.createElement('div');
    toastContainer.className = 'toast-container position-fixed top-0 end-0 p-3';
    toastContainer.style.zIndex = '9999';
    
    const toast = document.createElement('div');
    toast.className = `toast align-items-center text-white bg-${type === 'error' ? 'danger' : type === 'success' ? 'success' : 'info'} border-0`;
    toast.setAttribute('role', 'alert');
    
    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">
                ${message}
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
        </div>
    `;
    
    toastContainer.appendChild(toast);
    document.body.appendChild(toastContainer);
    
    const bsToast = new bootstrap.Toast(toast);
    bsToast.show();
    
    // Remove toast container after hiding
    toast.addEventListener('hidden.bs.toast', () => {
        toastContainer.remove();
    });
}

// Logout function
function vendorLogout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('currentVendor');
        localStorage.removeItem('currentShopId');
        window.location.href = 'vendor-signin.html';
    }
}
