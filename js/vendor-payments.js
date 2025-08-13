// Vendor Payments JavaScript
// Handles the payments management functionality

// Initialize the payments page
document.addEventListener('DOMContentLoaded', function() {
    initializePaymentsPage();
});

async function initializePaymentsPage() {
    try {
        // Set vendor name in navigation
        setVendorName();
        
        // Load payments data
        loadPaymentsData();
        
        // Setup search functionality
        setupSearch();
        
    } catch (error) {
        console.error('Error initializing payments page:', error);
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

// Load payments data
async function loadPaymentsData() {
    const currentVendor = getCurrentVendor();
    if (!currentVendor || !currentVendor.currentShopId) {
        console.warn('No vendor or shop selected');
        return;
    }

    try {
        const payments = await getPayments(currentVendor.id, currentVendor.currentShopId);
        displayTransactions(payments);
        updateStatsCards(payments);
        
    } catch (error) {
        console.error('Error loading payments data:', error);
    }
}

// Get payments from orders data (dynamic)
async function getPayments(vendorId, shopId) {
    try {
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

        // Convert orders to payment transactions
        const payments = orders.map((order, index) => ({
            id: order.id || `txn_${index + 1}`,
            transactionId: order.transactionId || `TXN${new Date(order.createdAt || order.date || Date.now()).toISOString().slice(0, 10).replace(/-/g, '')}${String(index + 1).padStart(3, '0')}`,
            date: order.createdAt || order.date || new Date().toISOString(),
            customerName: order.customerName || order.userName || 'Unknown Customer',
            amount: parseFloat(order.total || order.amount || 0),
            method: order.paymentMethod || 'Online Payment',
            status: order.status || order.paymentStatus || 'completed'
        }));

        // Sort by date (newest first)
        return payments.sort((a, b) => new Date(b.date) - new Date(a.date));
        
    } catch (error) {
        console.error('Error getting payments:', error);
        return [];
    }
}

// Display transactions in table
function displayTransactions(payments) {
    const tbody = document.getElementById('transactionsTableBody');
    if (!tbody) return;

    if (payments.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center py-4">
                    <i class="fa-solid fa-credit-card fa-3x text-muted mb-3"></i>
                    <h6 class="text-muted">No transactions found</h6>
                    <p class="text-muted">Payment transactions will appear here</p>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = payments.map(payment => `
        <tr>
            <td>
                <span class="badge bg-secondary">${payment.transactionId}</span>
            </td>
            <td>${formatDate(payment.date)}</td>
            <td>${payment.customerName}</td>
            <td>${formatCurrency(payment.amount)}</td>
            <td>
                <span class="badge ${getMethodBadgeClass(payment.method)}">
                    ${payment.method}
                </span>
            </td>
            <td>
                <span class="badge ${getStatusBadgeClass(payment.status)}">
                    ${payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                </span>
            </td>
            <td>
                <button class="btn btn-sm btn-outline-primary me-1" onclick="viewTransaction('${payment.id}')">
                    <i class="fa-solid fa-eye"></i>
                </button>
                <button class="btn btn-sm btn-outline-secondary" onclick="downloadReceipt('${payment.id}')">
                    <i class="fa-solid fa-download"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

// Update stats cards
function updateStatsCards(payments) {
    // Total earnings
    const totalEarningsElement = document.getElementById('totalEarnings');
    if (totalEarningsElement) {
        const totalEarnings = payments.reduce((sum, payment) => sum + payment.amount, 0);
        totalEarningsElement.textContent = formatCurrency(totalEarnings);
    }

    // Pending payments
    const pendingPaymentsElement = document.getElementById('pendingPayments');
    if (pendingPaymentsElement) {
        const pending = payments.filter(p => p.status === 'pending');
        const pendingAmount = pending.reduce((sum, payment) => sum + payment.amount, 0);
        pendingPaymentsElement.textContent = formatCurrency(pendingAmount);
    }

    // Processing payments
    const processingPaymentsElement = document.getElementById('processingPayments');
    if (processingPaymentsElement) {
        const processing = payments.filter(p => p.status === 'processing');
        const processingAmount = processing.reduce((sum, payment) => sum + payment.amount, 0);
        processingPaymentsElement.textContent = formatCurrency(processingAmount);
    }

    // Completed payments
    const completedPaymentsElement = document.getElementById('completedPayments');
    if (completedPaymentsElement) {
        const completed = payments.filter(p => p.status === 'completed');
        const completedAmount = completed.reduce((sum, payment) => sum + payment.amount, 0);
        completedPaymentsElement.textContent = formatCurrency(completedAmount);
    }
}

// Setup search functionality
function setupSearch() {
    const searchInput = document.getElementById('searchTransactions');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            filterTransactions(searchTerm);
        });
    }
}

// Filter transactions based on search
function filterTransactions(searchTerm) {
    const tbody = document.getElementById('transactionsTableBody');
    const rows = tbody.getElementsByTagName('tr');

    Array.from(rows).forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm) ? '' : 'none';
    });
}

// Get badge class for payment method
function getMethodBadgeClass(method) {
    switch (method.toLowerCase()) {
        case 'google pay':
            return 'bg-success';
        case 'card payment':
            return 'bg-primary';
        case 'bank transfer':
            return 'bg-info';
        default:
            return 'bg-secondary';
    }
}

// Get badge class for payment status
function getStatusBadgeClass(status) {
    switch (status.toLowerCase()) {
        case 'completed':
            return 'bg-success';
        case 'pending':
            return 'bg-warning';
        case 'processing':
            return 'bg-info';
        case 'failed':
            return 'bg-danger';
        default:
            return 'bg-secondary';
    }
}

// View transaction details
function viewTransaction(transactionId) {
    console.log('View transaction:', transactionId);
    showToast('Transaction details feature coming soon', 'info');
}

// Download receipt
function downloadReceipt(transactionId) {
    console.log('Download receipt:', transactionId);
    showToast('Receipt download feature coming soon', 'info');
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

// Get vendor orders from local storage
function getVendorOrders(vendorId, shopId) {
    const key = `vendor_${vendorId}_orders_${shopId}`;
    const ordersData = localStorage.getItem(key);
    return ordersData ? JSON.parse(ordersData) : [];
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
