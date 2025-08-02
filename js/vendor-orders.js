// Vendor Orders Management
document.addEventListener('DOMContentLoaded', function() {
    // Check if vendor is logged in
    const currentVendor = getCurrentVendor();
    if (!currentVendor) {
        window.location.href = 'vendor-login.html';
        return;
    }

    // Initialize page
    initializeOrdersPage(currentVendor);
    loadVendorOrders();
});

function initializeOrdersPage(vendor) {
    // Update vendor name
    document.getElementById('vendorName').textContent = vendor.businessName;
}

function loadVendorOrders() {
    const currentVendor = getCurrentVendor();
    const orders = getVendorOrders(currentVendor.id);
    
    updateOrderStats(orders);
    displayOrders(orders);
}

function updateOrderStats(orders) {
    const pending = orders.filter(order => order.status === 'pending').length;
    const shipped = orders.filter(order => order.status === 'shipped').length;
    const delivered = orders.filter(order => order.status === 'delivered').length;
    const total = orders.length;
    
    document.getElementById('pendingOrders').textContent = pending;
    document.getElementById('shippedOrders').textContent = shipped;
    document.getElementById('deliveredOrders').textContent = delivered;
    document.getElementById('totalOrders').textContent = total;
}

function displayOrders(orders) {
    const ordersTableBody = document.getElementById('ordersTableBody');
    const noOrdersMessage = document.getElementById('noOrdersMessage');
    
    if (orders.length === 0) {
        ordersTableBody.innerHTML = '';
        noOrdersMessage.style.display = 'block';
        return;
    }
    
    noOrdersMessage.style.display = 'none';
    
    ordersTableBody.innerHTML = orders.map(order => {
        const orderDate = new Date(order.orderDate).toLocaleDateString();
        const statusBadge = getStatusBadge(order.status);
        const itemCount = order.items.length;
        
        return `
            <tr>
                <td><strong>#${order.id.slice(-6)}</strong></td>
                <td>${orderDate}</td>
                <td>${itemCount} item${itemCount > 1 ? 's' : ''}</td>
                <td>₹${order.total.toFixed(2)}</td>
                <td>${statusBadge}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary" onclick="viewOrderDetails('${order.id}')">
                        <i class="fa-solid fa-eye"></i> View
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

function getStatusBadge(status) {
    const statusConfig = {
        'pending': { class: 'bg-warning', text: 'Pending' },
        'confirmed': { class: 'bg-info', text: 'Confirmed' },
        'shipped': { class: 'bg-primary', text: 'Shipped' },
        'delivered': { class: 'bg-success', text: 'Delivered' },
        'cancelled': { class: 'bg-danger', text: 'Cancelled' }
    };
    
    const config = statusConfig[status] || { class: 'bg-secondary', text: 'Unknown' };
    return `<span class="badge ${config.class}">${config.text}</span>`;
}

function viewOrderDetails(orderId) {
    const currentVendor = getCurrentVendor();
    const orders = getVendorOrders(currentVendor.id);
    const order = orders.find(o => o.id === orderId);
    
    if (!order) return;
    
    const orderDate = new Date(order.orderDate).toLocaleDateString();
    const statusBadge = getStatusBadge(order.status);
    
    const orderDetailsContent = document.getElementById('orderDetailsContent');
    orderDetailsContent.innerHTML = `
        <div class="row mb-4">
            <div class="col-md-6">
                <h6>Order Information</h6>
                <p><strong>Order ID:</strong> #${order.id.slice(-6)}</p>
                <p><strong>Date:</strong> ${orderDate}</p>
                <p><strong>Status:</strong> ${statusBadge}</p>
            </div>
            <div class="col-md-6">
                <h6>Order Summary</h6>
                <p><strong>Items:</strong> ${order.items.length}</p>
                <p><strong>Total Amount:</strong> ₹${order.total.toFixed(2)}</p>
            </div>
        </div>
        
        <h6>Order Items</h6>
        <div class="table-responsive">
            <table class="table table-sm">
                <thead>
                    <tr>
                        <th>Product</th>
                        <th>Supplier</th>
                        <th>Quantity</th>
                        <th>Unit Price</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${order.items.map(item => `
                        <tr>
                            <td>${item.name}</td>
                            <td>${item.supplier}</td>
                            <td>${item.quantity}</td>
                            <td>₹${item.price.toFixed(2)}</td>
                            <td>₹${(item.quantity * item.price).toFixed(2)}</td>
                        </tr>
                    `).join('')}
                </tbody>
                <tfoot>
                    <tr class="table-active">
                        <th colspan="4">Total</th>
                        <th>₹${order.total.toFixed(2)}</th>
                    </tr>
                </tfoot>
            </table>
        </div>
    `;
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('orderDetailsModal'));
    modal.show();
}

// Helper functions
function getCurrentVendor() {
    const sessionVendor = sessionStorage.getItem('currentVendor');
    const localVendor = localStorage.getItem('currentVendor');
    
    if (sessionVendor) {
        return JSON.parse(sessionVendor);
    } else if (localVendor) {
        return JSON.parse(localVendor);
    }
    
    return null;
}

function getVendorOrders(vendorId) {
    return JSON.parse(localStorage.getItem(`vendorOrders_${vendorId}`) || '[]');
}

function vendorLogout() {
    sessionStorage.removeItem('currentVendor');
    localStorage.removeItem('currentVendor');
    showToast('You have been logged out successfully');
    setTimeout(() => {
        window.location.href = 'vendor-login.html';
    }, 1500);
}

// Toast notification function
function showToast(message, type = 'success') {
    let toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3';
        document.body.appendChild(toastContainer);
    }
    
    const toastEl = document.createElement('div');
    const bgClass = type === 'success' ? 'bg-success' : type === 'warning' ? 'bg-warning' : type === 'info' ? 'bg-info' : 'bg-danger';
    toastEl.className = `toast align-items-center text-white ${bgClass} border-0`;
    toastEl.setAttribute('role', 'alert');
    toastEl.setAttribute('aria-live', 'assertive');
    toastEl.setAttribute('aria-atomic', 'true');
    
    const toastBody = document.createElement('div');
    toastBody.className = 'd-flex';
    
    const toastBodyContent = document.createElement('div');
    toastBodyContent.className = 'toast-body';
    toastBodyContent.textContent = message;
    
    const closeButton = document.createElement('button');
    closeButton.type = 'button';
    closeButton.className = 'btn-close btn-close-white me-2 m-auto';
    closeButton.setAttribute('data-bs-dismiss', 'toast');
    closeButton.setAttribute('aria-label', 'Close');
    
    toastBody.appendChild(toastBodyContent);
    toastBody.appendChild(closeButton);
    toastEl.appendChild(toastBody);
    toastContainer.appendChild(toastEl);
    
    const toast = new bootstrap.Toast(toastEl, {
        autohide: true,
        delay: 3000
    });
    toast.show();
    
    toastEl.addEventListener('hidden.bs.toast', function() {
        this.remove();
    });
}
