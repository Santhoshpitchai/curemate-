// CureMate Product Search System
// Comprehensive product database with search functionality

// Complete product database with all products from all categories
const PRODUCT_DATABASE = [
  // Medicines
  { name: "Fericip Xt Tablet 10", price: 67.32, originalPrice: 134.91, image: "img/Fericip Xt Tablet 10.jpg.jpg", category: "medicines", page: "medicines.html", id: "product1" },
  { name: "Follihair A Tablet 15", price: 326.4, originalPrice: 408, image: "img/Follihair A Tablet 15.jpg.jpg", category: "medicines", page: "medicines.html", id: "product2" },
  { name: "Dolo 650mg Tablet 15", price: 31.50, originalPrice: 45, image: "img/Dolo 650mg Tablet 15.jpg.jpg", category: "medicines", page: "medicines.html", id: "product3" },
  { name: "Azithral 500mg Tablet 3", price: 102, originalPrice: 120, image: "img/Azithral 500mg Tablet 3.jpg.jpg", category: "medicines", page: "medicines.html", id: "product4" },
  { name: "Crocin Advance Tablet 20", price: 45, originalPrice: 60, image: "img/Crocin Advance Tablet 20.jpg.jpg", category: "medicines", page: "medicines.html", id: "product5" },
  { name: "Pantop 40mg Tablet 10", price: 48, originalPrice: 60, image: "img/Pantop 40mg Tablet 10.jpg.jpg", category: "medicines", page: "medicines.html", id: "product6" },
  { name: "Combiflam Tablet 20", price: 63, originalPrice: 90, image: "img/Combiflam Tablet 20.jpg.jpg", category: "medicines", page: "medicines.html", id: "product7" },
  { name: "Allegra 180mg Tablet 10", price: 97.50, originalPrice: 130, image: "img/Allegra 180mg Tablet 10.jpg.jpg", category: "medicines", page: "medicines.html", id: "product8" },

  // Healthcare
  { name: "Digital Thermometer", price: 300, originalPrice: 400, image: "img/Digital Thermometer.jpg.jpg", category: "healthcare", page: "healthcare.html", id: "healthcare1" },
  { name: "Blood Pressure Monitor", price: 1750, originalPrice: 2500, image: "img/Blood Pressure Monitor.jpg.jpg", category: "healthcare", page: "healthcare.html", id: "healthcare2" },
  { name: "Pulse Oximeter", price: 1530, originalPrice: 1800, image: "img/Pulse Oximeter.jpg.jpg", category: "healthcare", page: "healthcare.html", id: "healthcare3" },
  { name: "Glucose Monitor", price: 2400, originalPrice: 3000, image: "img/Glucose Monitor.jpg.jpg", category: "healthcare", page: "healthcare.html", id: "healthcare4" },
  { name: "Digital Weighing Scale", price: 900, originalPrice: 1500, image: "img/Digital Weighing Scale.jpg.jpg", category: "healthcare", page: "healthcare.html", id: "healthcare5" },
  { name: "First Aid Kit", price: 720, originalPrice: 900, image: "img/First Aid Kit.jpg.jpg", category: "healthcare", page: "healthcare.html", id: "healthcare6" },
  { name: "N95 Masks (10 Pack)", price: 325, originalPrice: 400, image: "img/N95 Masks (10 Pack).jpg.jpg", category: "healthcare", page: "healthcare.html", id: "healthcare7" },
  { name: "Hand Sanitizer 500ml", price: 212.50, originalPrice: 250, image: "img/Hand Sanitizer 500ml.jpg.jpg", category: "healthcare", page: "healthcare.html", id: "healthcare8" },

  // Wellness
  { name: "Vitamin C Tablets", price: 420, originalPrice: 600, image: "img/Vitamin C Tablets.jpg.jpg", category: "wellness", page: "wellness.html", id: "wellness1" },
  { name: "Calcium Supplements", price: 600, originalPrice: 750, image: "img/Calcium Supplements.jpg.jpg", category: "wellness", page: "wellness.html", id: "wellness2" },
  { name: "Protein Powder", price: 1500, originalPrice: 2000, image: "img/Protein Powder.jpg.jpg", category: "wellness", page: "wellness.html", id: "wellness3" },
  { name: "Omega-3 Fish Oil", price: 720, originalPrice: 1200, image: "img/Omega-3 Fish Oil.jpg.jpg", category: "wellness", page: "wellness.html", id: "wellness4" },
  { name: "Vitamin D3 Drops", price: 680, originalPrice: 800, image: "img/Vitamin D3 Drops.jpg.jpg", category: "wellness", page: "wellness.html", id: "wellness5" },
  { name: "Ashwagandha Capsules", price: 357.50, originalPrice: 450, image: "img/Ashwagandha Capsules.jpg.jpg", category: "wellness", page: "wellness.html", id: "wellness6" },
  { name: "Green Tea Extract", price: 405, originalPrice: 540, image: "img/Green Tea Extract.jpg.jpg", category: "wellness", page: "wellness.html", id: "wellness7" },
  { name: "Multivitamin Tablets", price: 495, originalPrice: 660, image: "img/Multivitamin Tablets.jpg.jpg", category: "wellness", page: "wellness.html", id: "wellness8" },

  // Baby Care
  { name: "Baby Diapers (Pack of 40)", price: 719.20, originalPrice: 899, image: "img/Baby Diapers (Pack of 40).jpg.jpg", category: "babycare", page: "babycare.html", id: "baby1" },
  { name: "Baby Wipes (Pack of 80)", price: 240, originalPrice: 300, image: "img/Baby Wipes (Pack of 80).jpg.jpg", category: "babycare", page: "babycare.html", id: "baby2" },
  { name: "Baby Powder", price: 170, originalPrice: 200, image: "img/Baby Powder.jpg.jpg", category: "babycare", page: "babycare.html", id: "baby3" },
  { name: "Baby Shampoo", price: 180, originalPrice: 300, image: "img/Baby Shampoo.jpg.jpg", category: "babycare", page: "babycare.html", id: "baby4" },
  { name: "Baby Oil", price: 136, originalPrice: 170, image: "img/Baby Oil.jpg.jpg", category: "babycare", page: "babycare.html", id: "baby5" },
  { name: "Baby Lotion", price: 140, originalPrice: 200, image: "img/Baby Lotion.jpg.jpg", category: "babycare", page: "babycare.html", id: "baby6" },
  { name: "Baby Formula", price: 1040, originalPrice: 1300, image: "img/Baby Formula.jpg.jpg", category: "babycare", page: "babycare.html", id: "baby7" },
  { name: "Baby Thermometer", price: 240, originalPrice: 300, image: "img/Baby Thermometer.jpg.jpg", category: "babycare", page: "babycare.html", id: "baby8" },

  // Specialized/Condition-specific products
  { name: "Pantop 40mg Digestive Care", price: 140, originalPrice: 175, image: "img/Pantop 40mg Tablet 10.jpg.jpg", category: "pancreatitis", page: "pancreatitis.html", id: "pancreatitis1" },
  { name: "Digestive Enzyme Complex", price: 737, originalPrice: 920, image: "img/Multivitamin Tablets.jpg.jpg", category: "pancreatitis", page: "pancreatitis.html", id: "pancreatitis2" },
  { name: "Anti-inflammatory Omega-3", price: 934, originalPrice: 1168, image: "img/Omega-3 Fish Oil.jpg.jpg", category: "pancreatitis", page: "pancreatitis.html", id: "pancreatitis3" },
  { name: "Vitamin D3 Immune Support", price: 399, originalPrice: 499, image: "img/Vitamin D3 Drops.jpg.jpg", category: "pancreatitis", page: "pancreatitis.html", id: "pancreatitis4" },
  { name: "Pancreatin Enzyme Tablets", price: 338, originalPrice: 422, image: "img/Combiflam Tablet 20.jpg.jpg", category: "pancreatitis", page: "pancreatitis.html", id: "pancreatitis5" },
  { name: "Creon Pancreatic Enzymes", price: 689, originalPrice: 861, image: "img/Dolo 650mg Tablet 15.jpg.jpg", category: "pancreatitis", page: "pancreatitis.html", id: "pancreatitis6" },
  { name: "Lipase Digestive Enzyme", price: 779, originalPrice: 974, image: "img/Lipase Digestive Enzyme.jpg.jpg", category: "pancreatitis", page: "pancreatitis.html", id: "pancreatitis7" },
  { name: "Turmeric Anti-inflammatory", price: 583, originalPrice: 729, image: "img/turmeric anti-inflammatory.jpg.jpg", category: "pancreatitis", page: "pancreatitis.html", id: "pancreatitis8" },

  // Diabetes products
  { name: "Digital Glucose Monitor Kit", price: 1557, originalPrice: 1946, image: "img/Glucose Monitor.jpg.jpg", category: "diabetes", page: "diabetes.html", id: "diabetes1" },
  { name: "Advanced Glucometer Kit", price: 2025, originalPrice: 2531, image: "img/Glucometer-Kit.jpg.png", category: "diabetes", page: "diabetes.html", id: "diabetes2" },
  { name: "Diabetic Care Multivitamin", price: 545, originalPrice: 681, image: "img/Multivitamin Tablets.jpg.jpg", category: "diabetes", page: "diabetes.html", id: "diabetes3" },
  { name: "Alpha Lipoic Acid Diabetes", price: 468, originalPrice: 585, image: "img/alpha lipoic acid diabetes.jpg.jpg", category: "diabetes", page: "diabetes.html", id: "diabetes4" },
  { name: "Chromium Blood Sugar", price: 390, originalPrice: 487, image: "img/Chromium blood sugar.jpg.jpg", category: "diabetes", page: "diabetes.html", id: "diabetes5" },
  { name: "Metformin Diabetes Tablets", price: 195, originalPrice: 243, image: "img/Metformin diabetes tablets.jpg.jpg", category: "diabetes", page: "diabetes.html", id: "diabetes6" },
  { name: "Glimepiride Diabetes Control", price: 156, originalPrice: 195, image: "img/glimepiride Diabetes control.jpg.jpg", category: "diabetes", page: "diabetes.html", id: "diabetes7" },
  { name: "Omega 3 Fish Oil Capsule", price: 624, originalPrice: 780, image: "img/omega 3 fish oil capsule.jpg.jpg", category: "diabetes", page: "diabetes.html", id: "diabetes8" },

  // Blood Pressure products
  { name: "Digital Blood Pressure Monitor", price: 2549, originalPrice: 3186, image: "img/Blood Pressure Monitor.jpg.jpg", category: "blood-pressure", page: "blood-pressure.html", id: "bp1" },
  { name: "Pantop 40mg Tablet", price: 120, originalPrice: 150, image: "img/Pantop 40mg Tablet 10.jpg.jpg", category: "blood-pressure", page: "blood-pressure.html", id: "bp2" },
  { name: "Omega-3 Fish Oil Capsules", price: 809, originalPrice: 1011, image: "img/Omega-3 Fish Oil.jpg.jpg", category: "blood-pressure", page: "blood-pressure.html", id: "bp3" },
  { name: "Heart Health Multivitamin", price: 449, originalPrice: 561, image: "img/Multivitamin Tablets.jpg.jpg", category: "blood-pressure", page: "blood-pressure.html", id: "bp4" },
  { name: "Amlodipine BP Tablets", price: 140, originalPrice: 175, image: "img/Combiflam Tablet 20.jpg.jpg", category: "blood-pressure", page: "blood-pressure.html", id: "bp5" },
  { name: "Losartan BP Medicine", price: 180, originalPrice: 225, image: "img/Dolo 650mg Tablet 15.jpg.jpg", category: "blood-pressure", page: "blood-pressure.html", id: "bp6" },
  { name: "Potassium Magnesium BP", price: 449, originalPrice: 561, image: "img/Calcium Supplements.jpg.jpg", category: "blood-pressure", page: "blood-pressure.html", id: "bp7" },
  { name: "Garlic Extract BP Support", price: 639, originalPrice: 799, image: "img/Ashwagandha Capsules.jpg.jpg", category: "blood-pressure", page: "blood-pressure.html", id: "bp8" },

  // Cholesterol products
  { name: "Omega-3 Cholesterol Support", price: 959, originalPrice: 1199, image: "img/Omega-3 Fish Oil.jpg.jpg", category: "cholesterol", page: "cholesterol.html", id: "cholesterol1" },
  { name: "Green Tea Extract Capsules", price: 679, originalPrice: 849, image: "img/Green Tea Extract.jpg.jpg", category: "cholesterol", page: "cholesterol.html", id: "cholesterol2" },
  { name: "Heart Health Multivitamin", price: 674, originalPrice: 842, image: "img/Multivitamin Tablets.jpg.jpg", category: "cholesterol", page: "cholesterol.html", id: "cholesterol3" },
  { name: "Plant-Based Protein Powder", price: 1065, originalPrice: 1331, image: "img/Protein Powder.jpg.jpg", category: "cholesterol", page: "cholesterol.html", id: "cholesterol4" },
  { name: "Atorvastatin Cholesterol", price: 252, originalPrice: 315, image: "img/Combiflam Tablet 20.jpg.jpg", category: "cholesterol", page: "cholesterol.html", id: "cholesterol5" },
  { name: "Rosuvastatin Cholesterol", price: 323, originalPrice: 404, image: "img/Dolo 650mg Tablet 15.jpg.jpg", category: "cholesterol", page: "cholesterol.html", id: "cholesterol6" },
  { name: "Red Yeast Rice Cholesterol", price: 839, originalPrice: 1049, image: "img/Ashwagandha Capsules.jpg.jpg", category: "cholesterol", page: "cholesterol.html", id: "cholesterol7" },
  { name: "Niacin Cholesterol Control", price: 665, originalPrice: 831, image: "img/Vitamin C Tablets.jpg.jpg", category: "cholesterol", page: "cholesterol.html", id: "cholesterol8" },

  // Featured products from index page
  { name: "Multivitamin Complex", price: 499, originalPrice: 699, image: "img/multivitamin.jpg.png", category: "featured", page: "index.html", id: "featured1" },
  { name: "First Aid Kit", price: 799, originalPrice: 999, image: "img/first-aid.jpg.png", category: "featured", page: "index.html", id: "featured3" },
  { name: "Omega-3 Supplements", price: 599, originalPrice: 799, image: "img/omega-3-supplements.jpg.png", category: "featured", page: "index.html", id: "featured4" },
  { name: "Glucometer Kit", price: 1599, originalPrice: 1999, image: "img/Glucometer-Kit.jpg.png", category: "featured", page: "index.html", id: "featured7" },
  { name: "Scalpe Plus Anti-Dandruff Shampoo", price: 282, originalPrice: 376, image: "img/scalpe.jpg.png", category: "featured", page: "index.html", id: "featured9" },
  { name: "Hansaplast Bandages", price: 146, originalPrice: 195, image: "img/hansaplast.jpg.png", category: "featured", page: "index.html", id: "featured10" },
  { name: "Liveasy Healthy Roasted Seed", price: 175, originalPrice: 233, image: "img/liveasy-seeds.jpg.png", category: "featured", page: "index.html", id: "featured11" },
  { name: "Collagen Peptide", price: 1299, originalPrice: 1732, image: "img/Collagen-Peptide.jpg.png", category: "featured", page: "index.html", id: "featured12" },
  { name: "Immunity Booster", price: 699, originalPrice: 932, image: "img/Immunity-Booster.jpg.png", category: "trending", page: "index.html", id: "trending1" },
  { name: "Collagen Peptides", price: 999, originalPrice: 1332, image: "img/Collagen-Peptide.jpg.png", category: "trending", page: "index.html", id: "trending2" }
];

// Search state
let isSearchDropdownOpen = false;
let currentSearchResults = [];

// Initialize search functionality
function initializeSearch() {
  // Handle navbar search inputs
  const searchInputs = document.querySelectorAll('input[type="search"]');
  
  searchInputs.forEach(input => {
    // Skip the main medicine search input on index page (it has its own system)
    if (input.id === 'medicineSearchInput') {
      setupMainSearchInput(input);
      return;
    }
    
    // Create search dropdown container if it doesn't exist
    createSearchDropdown(input);
    
    // Add event listeners
    input.addEventListener('input', handleSearchInput);
    input.addEventListener('focus', handleSearchFocus);
    input.addEventListener('blur', handleSearchBlur);
    input.addEventListener('keydown', handleSearchKeydown);
  });

  // Close dropdown when clicking outside
  document.addEventListener('click', function(event) {
    const searchDropdowns = document.querySelectorAll('.search-dropdown');
    searchDropdowns.forEach(dropdown => {
      const searchForm = dropdown.closest('.search-form') || dropdown.closest('.search-bar');
      if (searchForm && !searchForm.contains(event.target)) {
        hideSearchDropdown(dropdown);
      }
    });
  });
}

// Setup main search input on index page
function setupMainSearchInput(input) {
  const searchBar = input.closest('.search-bar');
  if (!searchBar) return;

  // Create search dropdown for main search
  createMainSearchDropdown(searchBar);
  
  // Add event listeners
  input.addEventListener('input', handleMainSearchInput);
  input.addEventListener('focus', handleMainSearchFocus);
  input.addEventListener('blur', handleMainSearchBlur);
  input.addEventListener('keydown', handleMainSearchKeydown);
}

// Create main search dropdown
function createMainSearchDropdown(searchBar) {
  // Check if dropdown already exists
  if (searchBar.querySelector('.search-dropdown')) return;

  const dropdown = document.createElement('div');
  dropdown.className = 'search-dropdown';
  dropdown.style.cssText = `
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: white;
    border: 1px solid #ddd;
    border-top: none;
    border-radius: 0 0 12px 12px;
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    max-height: 400px;
    overflow-y: auto;
    z-index: 1000;
    display: none;
    margin-top: 2px;
  `;

  searchBar.appendChild(dropdown);
}

// Handle main search input
function handleMainSearchInput(event) {
  const query = event.target.value.trim();
  const dropdown = event.target.closest('.search-bar').querySelector('.search-dropdown');
  
  if (query.length === 0) {
    hideSearchDropdown(dropdown);
    return;
  }

  if (query.length < 2) {
    return; // Wait for at least 2 characters
  }

  // Search products
  const results = searchProducts(query);
  displaySearchResults(dropdown, results, query);
  showSearchDropdown(dropdown);
}

// Handle main search focus
function handleMainSearchFocus(event) {
  const dropdown = event.target.closest('.search-bar').querySelector('.search-dropdown');
  if (event.target.value.trim().length >= 2) {
    showSearchDropdown(dropdown);
  }
}

// Handle main search blur
function handleMainSearchBlur(event) {
  setTimeout(() => {
    const dropdown = event.target.closest('.search-bar').querySelector('.search-dropdown');
    hideSearchDropdown(dropdown);
  }, 200);
}

// Handle main search keyboard navigation
function handleMainSearchKeydown(event) {
  const dropdown = event.target.closest('.search-bar').querySelector('.search-dropdown');
  const items = dropdown.querySelectorAll('.search-result-item');
  
  if (event.key === 'Escape') {
    hideSearchDropdown(dropdown);
    event.target.blur();
    return;
  }
  
  if (event.key === 'Enter') {
    event.preventDefault();
    const activeItem = dropdown.querySelector('.search-result-item.active');
    if (activeItem) {
      activeItem.click();
    } else if (items.length > 0) {
      items[0].click();
    }
    return;
  }
  
  if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
    event.preventDefault();
    navigateSearchResults(dropdown, event.key === 'ArrowDown');
  }
}

// Create search dropdown structure
function createSearchDropdown(input) {
  const searchForm = input.closest('.search-form');
  if (!searchForm) return;

  // Check if dropdown already exists
  if (searchForm.querySelector('.search-dropdown')) return;

  const dropdown = document.createElement('div');
  dropdown.className = 'search-dropdown';
  dropdown.style.cssText = `
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: white;
    border: 1px solid #ddd;
    border-top: none;
    border-radius: 0 0 8px 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    max-height: 300px;
    overflow-y: auto;
    z-index: 1000;
    display: none;
  `;

  // Make search form relative for positioning
  searchForm.style.position = 'relative';
  searchForm.appendChild(dropdown);
}

// Handle search input
function handleSearchInput(event) {
  const query = event.target.value.trim();
  const dropdown = event.target.closest('.search-form').querySelector('.search-dropdown');
  
  if (query.length === 0) {
    hideSearchDropdown(dropdown);
    return;
  }

  if (query.length < 2) {
    return; // Wait for at least 2 characters
  }

  // Search products
  const results = searchProducts(query);
  displaySearchResults(dropdown, results, query);
  showSearchDropdown(dropdown);
}

// Search products function
function searchProducts(query) {
  const searchTerm = query.toLowerCase();
  
  return PRODUCT_DATABASE.filter(product => {
    const nameMatch = product.name.toLowerCase().includes(searchTerm);
    const categoryMatch = product.category.toLowerCase().includes(searchTerm);
    
    // Also check for partial word matches
    const words = searchTerm.split(' ');
    const nameWords = product.name.toLowerCase().split(' ');
    const wordMatch = words.some(word => 
      nameWords.some(nameWord => nameWord.includes(word))
    );
    
    return nameMatch || categoryMatch || wordMatch;
  }).slice(0, 8); // Limit to 8 results
}

// Display search results
function displaySearchResults(dropdown, results, query) {
  if (results.length === 0) {
    dropdown.innerHTML = `
      <div class="search-result-item" style="padding: 12px; color: #666; text-align: center;">
        No products found for "${query}"
      </div>
    `;
    return;
  }

  dropdown.innerHTML = results.map(product => `
    <div class="search-result-item" 
         style="padding: 12px; border-bottom: 1px solid #eee; cursor: pointer; display: flex; align-items: center; transition: background-color 0.2s;"
         data-product-name="${product.name}"
         data-product-page="${product.page}"
         data-product-id="${product.id}"
         onmouseover="this.style.backgroundColor='#f8f9fa'"
         onmouseout="this.style.backgroundColor='white'"
         onclick="navigateToProduct('${product.page}', '${product.id}', '${product.name}')">
      <img src="${product.image}" 
           style="width: 40px; height: 40px; object-fit: contain; margin-right: 12px; border-radius: 4px;"
           onerror="this.src='img/products/product-placeholder.jpg'">
      <div style="flex: 1;">
        <div style="font-weight: 500; color: #333; margin-bottom: 2px;">${highlightMatch(product.name, query)}</div>
        <div style="font-size: 12px; color: #666; margin-bottom: 2px;">${product.category.charAt(0).toUpperCase() + product.category.slice(1)}</div>
        <div style="font-size: 12px; color: #28a745; font-weight: 500;">₹${product.price}</div>
      </div>
      <i class="fas fa-arrow-right" style="color: #007bff; margin-left: 8px;"></i>
    </div>
  `).join('');
}

// Highlight matching text
function highlightMatch(text, query) {
  if (!query) return text;
  
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  return text.replace(regex, '<mark style="background: #fff3cd; padding: 1px 2px;">$1</mark>');
}

// Navigate to product
function navigateToProduct(page, productId, productName) {
  console.log(`🔍 Navigating to product: ${productName} on ${page}`);
  
  // Store search result for highlighting
  sessionStorage.setItem('searchedProduct', productId);
  sessionStorage.setItem('searchedProductName', productName);
  
  // Navigate to the page
  if (page === window.location.pathname.split('/').pop() || 
      (page === 'index.html' && (window.location.pathname === '/' || window.location.pathname.endsWith('/')))) {
    // Same page - scroll to product
    scrollToProduct(productId);
  } else {
    // Different page - navigate
    window.location.href = page + '#' + productId;
  }
}

// Scroll to product on current page
function scrollToProduct(productId) {
  setTimeout(() => {
    const productElement = document.getElementById(productId);
    if (productElement) {
      const productCard = productElement.closest('.product-card') || productElement.closest('.col-6') || productElement.closest('.col-md-4');
      if (productCard) {
        productCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Highlight the product temporarily
        highlightProduct(productCard);
      }
    }
  }, 100);
}

// Highlight product temporarily
function highlightProduct(element) {
  const originalStyle = element.style.cssText;
  element.style.cssText += `
    transform: scale(1.02);
    box-shadow: 0 8px 25px rgba(0, 123, 255, 0.3) !important;
    border: 2px solid #007bff !important;
    transition: all 0.3s ease;
  `;
  
  setTimeout(() => {
    element.style.cssText = originalStyle;
  }, 2000);
}

// Show/hide dropdown functions
function showSearchDropdown(dropdown) {
  dropdown.style.display = 'block';
  isSearchDropdownOpen = true;
}

function hideSearchDropdown(dropdown) {
  dropdown.style.display = 'none';
  isSearchDropdownOpen = false;
}

// Handle search focus
function handleSearchFocus(event) {
  const dropdown = event.target.closest('.search-form').querySelector('.search-dropdown');
  if (event.target.value.trim().length >= 2) {
    showSearchDropdown(dropdown);
  }
}

// Handle search blur (with delay to allow clicks)
function handleSearchBlur(event) {
  setTimeout(() => {
    const dropdown = event.target.closest('.search-form').querySelector('.search-dropdown');
    hideSearchDropdown(dropdown);
  }, 200);
}

// Handle keyboard navigation
function handleSearchKeydown(event) {
  const dropdown = event.target.closest('.search-form').querySelector('.search-dropdown');
  const items = dropdown.querySelectorAll('.search-result-item');
  
  if (event.key === 'Escape') {
    hideSearchDropdown(dropdown);
    event.target.blur();
    return;
  }
  
  if (event.key === 'Enter') {
    event.preventDefault();
    const activeItem = dropdown.querySelector('.search-result-item.active');
    if (activeItem) {
      activeItem.click();
    } else if (items.length > 0) {
      items[0].click();
    }
    return;
  }
  
  if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
    event.preventDefault();
    navigateSearchResults(dropdown, event.key === 'ArrowDown');
  }
}

// Navigate search results with arrow keys
function navigateSearchResults(dropdown, isDown) {
  const items = Array.from(dropdown.querySelectorAll('.search-result-item'));
  const activeItem = dropdown.querySelector('.search-result-item.active');
  
  // Remove current active state
  items.forEach(item => {
    item.classList.remove('active');
    item.style.backgroundColor = 'white';
  });
  
  let nextIndex = 0;
  if (activeItem) {
    const currentIndex = items.indexOf(activeItem);
    nextIndex = isDown 
      ? (currentIndex + 1) % items.length 
      : (currentIndex - 1 + items.length) % items.length;
  }
  
  // Set new active state
  if (items[nextIndex]) {
    items[nextIndex].classList.add('active');
    items[nextIndex].style.backgroundColor = '#e3f2fd';
    items[nextIndex].scrollIntoView({ block: 'nearest' });
  }
}

// Handle page load - check for searched product
function handlePageLoad() {
  const searchedProductId = sessionStorage.getItem('searchedProduct');
  const searchedProductName = sessionStorage.getItem('searchedProductName');
  
  if (searchedProductId && window.location.hash === '#' + searchedProductId) {
    console.log(`🎯 Highlighting searched product: ${searchedProductName}`);
    scrollToProduct(searchedProductId);
    
    // Clear the session storage
    sessionStorage.removeItem('searchedProduct');
    sessionStorage.removeItem('searchedProductName');
  }
}

// Global search function for external use
window.searchCureMateProducts = function(query) {
  return searchProducts(query);
};

// Expose product database globally for prescription analyzer
window.PRODUCT_DATABASE = PRODUCT_DATABASE;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  console.log('🔍 Search system initialized');
  initializeSearch();
  handlePageLoad();
});

// Also initialize when page becomes visible (for navigation)
document.addEventListener('visibilitychange', function() {
  if (!document.hidden) {
    handlePageLoad();
  }
});
