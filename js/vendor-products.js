// Vendor Products Management
document.addEventListener('DOMContentLoaded', function() {
    // Check if vendor is logged in
    const currentVendor = getCurrentVendor();
    if (!currentVendor) {
        window.location.href = 'vendor-login.html';
        return;
    }

    // Initialize page
    initializeProductsPage(currentVendor);
    loadVendorProducts();
    loadSupplierProducts();
    
    // Event listeners
    setupEventListeners();
});

function initializeProductsPage(vendor) {
    // Update vendor name
    document.getElementById('vendorName').textContent = vendor.businessName;
    
    // Initialize demo products if none exist
    initializeDemoProducts();
}

function setupEventListeners() {
    // Category filter
    const categoryRadios = document.querySelectorAll('input[name="category"]');
    categoryRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            filterProducts(this.value);
        });
    });

    // Add product form
    const addProductForm = document.getElementById('addProductForm');
    addProductForm.addEventListener('submit', handleAddProduct);

    // Place order button
    const placeOrderBtn = document.getElementById('placeOrderBtn');
    placeOrderBtn.addEventListener('click', handlePlaceOrder);
}

function loadVendorProducts() {
    const currentVendor = getCurrentVendor();
    const vendorProducts = getVendorProducts(currentVendor.id);
    displayProducts(vendorProducts);
}

function filterProducts(category) {
    const currentVendor = getCurrentVendor();
    const vendorProducts = getVendorProducts(currentVendor.id);
    
    if (category === 'all') {
        displayProducts(vendorProducts);
    } else {
        const filteredProducts = vendorProducts.filter(product => product.category === category);
        displayProducts(filteredProducts);
    }
}

function displayProducts(products) {
    const productsGrid = document.getElementById('productsGrid');
    
    if (products.length === 0) {
        productsGrid.innerHTML = `
            <div class="col-12">
                <div class="text-center py-5">
                    <i class="fa-solid fa-box-open fa-3x text-muted mb-3"></i>
                    <h5 class="text-muted">No products found</h5>
                    <p class="text-muted">Add your first product to get started</p>
                </div>
            </div>
        `;
        return;
    }

    productsGrid.innerHTML = products.map(product => `
        <div class="col-md-6 col-lg-4 mb-4">
            <div class="card h-100">
                <img src="${product.image || 'img/placeholder-product.jpg'}" class="card-img-top" alt="${product.name}" style="height: 200px; object-fit: cover;">
                <div class="card-body d-flex flex-column">
                    <h5 class="card-title">${product.name}</h5>
                    <p class="card-text text-muted small">${product.description || 'No description available'}</p>
                    <div class="mt-auto">
                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <span class="h5 text-primary mb-0">₹${product.price}</span>
                            <span class="badge ${product.stock > 10 ? 'bg-success' : product.stock > 0 ? 'bg-warning' : 'bg-danger'}">
                                Stock: ${product.stock}
                            </span>
                        </div>
                        <div class="btn-group w-100">
                            <button class="btn btn-outline-primary btn-sm" onclick="editProduct('${product.id}')">
                                <i class="fa-solid fa-edit"></i> Edit
                            </button>
                            <button class="btn btn-outline-danger btn-sm" onclick="deleteProduct('${product.id}')">
                                <i class="fa-solid fa-trash"></i> Delete
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

function loadSupplierProducts() {
    const supplierProducts = getSupplierProducts();
    displaySupplierProducts(supplierProducts);
}

function displaySupplierProducts(products) {
    const supplierProductsContainer = document.getElementById('supplierProducts');
    
    supplierProductsContainer.innerHTML = products.map(product => `
        <div class="col-md-6 mb-3">
            <div class="card">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start">
                        <div>
                            <h6 class="card-title">${product.name}</h6>
                            <p class="card-text small text-muted">${product.supplier}</p>
                            <p class="text-primary fw-bold">₹${product.price} per unit</p>
                        </div>
                        <div class="text-end">
                            <div class="input-group input-group-sm mb-2" style="width: 100px;">
                                <input type="number" class="form-control" id="qty-${product.id}" min="1" value="1">
                            </div>
                            <button class="btn btn-primary btn-sm" onclick="addToOrder('${product.id}')">
                                <i class="fa-solid fa-plus"></i> Add
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

let orderItems = [];

function addToOrder(productId) {
    const products = getSupplierProducts();
    const product = products.find(p => p.id === productId);
    const quantity = parseInt(document.getElementById(`qty-${productId}`).value);
    
    if (!product || quantity < 1) return;
    
    const existingItem = orderItems.find(item => item.id === productId);
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        orderItems.push({
            id: productId,
            name: product.name,
            price: product.price,
            supplier: product.supplier,
            quantity: quantity
        });
    }
    
    updateOrderSummary();
}

function updateOrderSummary() {
    const orderSummary = document.getElementById('orderSummary');
    const orderTotal = document.getElementById('orderTotal');
    const placeOrderBtn = document.getElementById('placeOrderBtn');
    
    if (orderItems.length === 0) {
        orderSummary.innerHTML = '<p class="text-muted">No items selected</p>';
        orderTotal.textContent = '0';
        placeOrderBtn.disabled = true;
        return;
    }
    
    const total = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    orderSummary.innerHTML = orderItems.map(item => `
        <div class="d-flex justify-content-between align-items-center mb-2">
            <div>
                <small class="fw-bold">${item.name}</small><br>
                <small class="text-muted">${item.supplier}</small>
            </div>
            <div class="text-end">
                <small>${item.quantity} × ₹${item.price}</small><br>
                <button class="btn btn-sm btn-outline-danger" onclick="removeFromOrder('${item.id}')">
                    <i class="fa-solid fa-times"></i>
                </button>
            </div>
        </div>
    `).join('');
    
    orderTotal.textContent = total.toFixed(2);
    placeOrderBtn.disabled = false;
}

function removeFromOrder(productId) {
    orderItems = orderItems.filter(item => item.id !== productId);
    updateOrderSummary();
}

function handleAddProduct(e) {
    e.preventDefault();
    
    const currentVendor = getCurrentVendor();
    const formData = {
        name: document.getElementById('productName').value,
        category: document.getElementById('productCategory').value,
        price: parseFloat(document.getElementById('productPrice').value),
        stock: parseInt(document.getElementById('productStock').value),
        description: document.getElementById('productDescription').value,
        image: document.getElementById('productImage').value
    };
    
    const newProduct = {
        id: Date.now().toString(),
        vendorId: currentVendor.id,
        ...formData,
        createdAt: new Date().toISOString()
    };
    
    // Save product
    const vendorProducts = getVendorProducts(currentVendor.id);
    vendorProducts.push(newProduct);
    saveVendorProducts(currentVendor.id, vendorProducts);
    
    // Close modal and refresh
    const modal = bootstrap.Modal.getInstance(document.getElementById('addProductModal'));
    modal.hide();
    
    // Reset form
    document.getElementById('addProductForm').reset();
    
    // Reload products
    loadVendorProducts();
    
    showToast('Product added successfully!');
}

function handlePlaceOrder() {
    if (orderItems.length === 0) return;
    
    const currentVendor = getCurrentVendor();
    const order = {
        id: Date.now().toString(),
        vendorId: currentVendor.id,
        items: orderItems,
        total: orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        status: 'pending',
        orderDate: new Date().toISOString()
    };
    
    // Save order
    const vendorOrders = getVendorOrders(currentVendor.id);
    vendorOrders.push(order);
    saveVendorOrders(currentVendor.id, vendorOrders);
    
    // Clear order
    orderItems = [];
    updateOrderSummary();
    
    // Close modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('orderProductsModal'));
    modal.hide();
    
    showToast('Order placed successfully! You can track it in the Orders section.');
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

function getVendorProducts(vendorId) {
    return JSON.parse(localStorage.getItem(`vendorProducts_${vendorId}`) || '[]');
}

function saveVendorProducts(vendorId, products) {
    localStorage.setItem(`vendorProducts_${vendorId}`, JSON.stringify(products));
}

function getVendorOrders(vendorId) {
    return JSON.parse(localStorage.getItem(`vendorOrders_${vendorId}`) || '[]');
}

function saveVendorOrders(vendorId, orders) {
    localStorage.setItem(`vendorOrders_${vendorId}`, JSON.stringify(orders));
}

function getSupplierProducts() {
    // Demo supplier products
    return [
        {
            id: 'sp1',
            name: 'Paracetamol 500mg',
            supplier: 'MediSupply Co.',
            price: 2.50,
            category: 'medicines'
        },
        {
            id: 'sp2',
            name: 'Vitamin D3 Drops',
            supplier: 'HealthCorp Ltd.',
            price: 299.00,
            category: 'supplements'
        },
        {
            id: 'sp3',
            name: 'Digital Thermometer',
            supplier: 'MedTech Solutions',
            price: 450.00,
            category: 'equipment'
        },
        {
            id: 'sp4',
            name: 'Bandage Roll',
            supplier: 'FirstAid Supplies',
            price: 25.00,
            category: 'firstaid'
        },
        {
            id: 'sp5',
            name: 'Multivitamin Tablets',
            supplier: 'HealthCorp Ltd.',
            price: 599.00,
            category: 'supplements'
        },
        {
            id: 'sp6',
            name: 'Blood Pressure Monitor',
            supplier: 'MedTech Solutions',
            price: 1299.00,
            category: 'equipment'
        }
    ];
}

function initializeDemoProducts() {
    const currentVendor = getCurrentVendor();
    const existingProducts = getVendorProducts(currentVendor.id);

    if (existingProducts.length === 0) {
        const demoProducts = [
            {
                id: 'vp1',
                vendorId: currentVendor.id,
                name: 'Vitamin C Tablets',
                category: 'supplements',
                price: 199.00,
                stock: 50,
                description: 'High-quality Vitamin C supplements for immune support',
                image: 'img/multivitamin.jpg.png',
                createdAt: new Date().toISOString()
            },
            {
                id: 'vp2',
                vendorId: currentVendor.id,
                name: 'Digital Thermometer',
                category: 'equipment',
                price: 299.00,
                stock: 25,
                description: 'Accurate digital thermometer for temperature monitoring',
                image: 'img/thermometer.jpg.png',
                createdAt: new Date().toISOString()
            }
        ];
        saveVendorProducts(currentVendor.id, demoProducts);
    }
}

function editProduct(productId) {
    showToast('Edit functionality will be implemented soon', 'info');
}

function deleteProduct(productId) {
    if (confirm('Are you sure you want to delete this product?')) {
        const currentVendor = getCurrentVendor();
        const products = getVendorProducts(currentVendor.id);
        const updatedProducts = products.filter(p => p.id !== productId);
        saveVendorProducts(currentVendor.id, updatedProducts);
        loadVendorProducts();
        showToast('Product deleted successfully');
    }
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
