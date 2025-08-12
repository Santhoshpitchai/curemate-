// CureMate Prescription Analysis System
// Uses Tesseract.js for OCR and medicine name matching

// Medicine name patterns and variations
const MEDICINE_PATTERNS = {
  // Common medicine name variations and synonyms
  'paracetamol': ['paracetamol', 'acetaminophen', 'crocin', 'dolo', 'tylenol'],
  'aspirin': ['aspirin', 'ecosprin', 'disprin'],
  'azithromycin': ['azithromycin', 'azithral', 'zithromax'],
  'pantoprazole': ['pantoprazole', 'pantop', 'protonix'],
  'combiflam': ['combiflam', 'ibuprofen', 'diclofenac'],
  'allegra': ['allegra', 'fexofenadine'],
  'vitamin': ['vitamin', 'vit', 'multivitamin'],
  'calcium': ['calcium', 'cal', 'calcimax'],
  'omega': ['omega', 'fish oil', 'dha', 'epa'],
  'protein': ['protein', 'whey', 'casein'],
  'ashwagandha': ['ashwagandha', 'withania'],
  'metformin': ['metformin', 'glucophage'],
  'glimepiride': ['glimepiride', 'amaryl'],
  'atorvastatin': ['atorvastatin', 'lipitor'],
  'rosuvastatin': ['rosuvastatin', 'crestor'],
  'amlodipine': ['amlodipine', 'norvasc'],
  'losartan': ['losartan', 'cozaar'],
  'thermometer': ['thermometer', 'temp', 'temperature'],
  'glucometer': ['glucometer', 'glucose meter', 'blood sugar meter'],
  'bp monitor': ['bp monitor', 'blood pressure monitor', 'sphygmomanometer']
};

// Prescription analysis state
let isAnalyzing = false;
let analysisResults = [];

// Initialize prescription analyzer
function initializePrescriptionAnalyzer() {
  console.log('💊 Prescription analyzer initialized');
  
  // Override the existing file change handler
  const fileInput = document.getElementById('prescription-file');
  if (fileInput) {
    // Remove existing onchange handler and add new one
    fileInput.removeAttribute('onchange');
    fileInput.addEventListener('change', handlePrescriptionUpload);
  }
}

// Handle prescription file upload
async function handlePrescriptionUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  // Update file name display (keep existing functionality)
  updateFileName(event.target);

  // Start analysis
  await analyzePrescription(file);
}

// Analyze prescription using OCR
async function analyzePrescription(file) {
  if (isAnalyzing) return;
  
  isAnalyzing = true;
  showAnalysisProgress();

  try {
    console.log('🔍 Starting prescription analysis...');
    
    // Create file URL for Tesseract
    const imageUrl = URL.createObjectURL(file);
    
    // Initialize Tesseract worker
    updateAnalysisProgress('Initializing OCR engine...', 10);
    const worker = await Tesseract.createWorker();
    
    // Configure for better medicine text recognition
    updateAnalysisProgress('Configuring OCR for medical text...', 20);
    await worker.setParameters({
      tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789().,- ',
      tessedit_pageseg_mode: Tesseract.PSM.AUTO,
    });

    // Perform OCR
    updateAnalysisProgress('Reading prescription text...', 40);
    const { data: { text } } = await worker.recognize(imageUrl);
    
    console.log('📄 OCR Text extracted:', text);
    
    // Clean up
    await worker.terminate();
    URL.revokeObjectURL(imageUrl);
    
    // Analyze extracted text
    updateAnalysisProgress('Analyzing medicine names...', 70);
    const foundMedicines = extractMedicinesFromText(text);
    
    // Match with available products
    updateAnalysisProgress('Matching with available products...', 90);
    const matchedProducts = matchMedicinesWithProducts(foundMedicines);
    
    // Show results
    updateAnalysisProgress('Analysis complete!', 100);
    setTimeout(() => {
      hideAnalysisProgress();
      showPrescriptionResults(matchedProducts, foundMedicines);
    }, 500);
    
  } catch (error) {
    console.error('❌ Prescription analysis error:', error);
    hideAnalysisProgress();
    showAnalysisError('Failed to analyze prescription. Please try again or ensure the image is clear.');
  } finally {
    isAnalyzing = false;
  }
}

// Extract medicine names from OCR text
function extractMedicinesFromText(text) {
  const foundMedicines = [];
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  console.log('📋 Analyzing lines:', lines);
  
  for (const line of lines) {
    const words = line.toLowerCase().split(/\s+/);
    
    // Check each word and combination for medicine patterns
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      const twoWords = i < words.length - 1 ? `${word} ${words[i + 1]}` : '';
      const threeWords = i < words.length - 2 ? `${word} ${words[i + 1]} ${words[i + 2]}` : '';
      
      // Check against medicine patterns
      for (const [baseName, variations] of Object.entries(MEDICINE_PATTERNS)) {
        for (const variation of variations) {
          if (word.includes(variation) || 
              twoWords.includes(variation) || 
              threeWords.includes(variation) ||
              variation.includes(word) && word.length > 3) {
            
            const medicine = {
              found: line.trim(),
              matched: baseName,
              variation: variation,
              confidence: calculateConfidence(word, variation)
            };
            
            // Avoid duplicates
            if (!foundMedicines.some(m => m.matched === baseName)) {
              foundMedicines.push(medicine);
              console.log(`💊 Found medicine: ${baseName} (${variation}) in line: "${line}"`);
            }
          }
        }
      }
    }
  }
  
  return foundMedicines;
}

// Calculate confidence score for medicine matching
function calculateConfidence(found, pattern) {
  if (found === pattern) return 100;
  if (found.includes(pattern) || pattern.includes(found)) return 80;
  
  // Levenshtein distance for fuzzy matching
  const distance = levenshteinDistance(found, pattern);
  const maxLength = Math.max(found.length, pattern.length);
  return Math.max(0, Math.round((1 - distance / maxLength) * 100));
}

// Simple Levenshtein distance calculation
function levenshteinDistance(str1, str2) {
  const matrix = [];
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  return matrix[str2.length][str1.length];
}

// Match found medicines with available products
function matchMedicinesWithProducts(foundMedicines) {
  const matchedProducts = [];
  
  for (const medicine of foundMedicines) {
    // Search in our product database
    const products = window.searchCureMateProducts ? 
      window.searchCureMateProducts(medicine.matched) : 
      searchProductsLocal(medicine.matched);
    
    if (products.length > 0) {
      matchedProducts.push({
        medicine: medicine,
        products: products,
        bestMatch: products[0] // First result is usually the best match
      });
    }
  }
  
  return matchedProducts;
}

// Local product search fallback
function searchProductsLocal(query) {
  if (!window.PRODUCT_DATABASE) return [];
  
  const searchTerm = query.toLowerCase();
  return window.PRODUCT_DATABASE.filter(product => {
    return product.name.toLowerCase().includes(searchTerm);
  });
}

// Show analysis progress
function showAnalysisProgress() {
  const progressModal = createAnalysisProgressModal();
  const modal = new bootstrap.Modal(progressModal);
  modal.show();
}

// Update analysis progress
function updateAnalysisProgress(message, percentage) {
  const progressText = document.getElementById('analysisProgressText');
  const progressBar = document.getElementById('analysisProgressBar');
  
  if (progressText) progressText.textContent = message;
  if (progressBar) {
    progressBar.style.width = `${percentage}%`;
    progressBar.setAttribute('aria-valuenow', percentage);
  }
}

// Hide analysis progress
function hideAnalysisProgress() {
  const progressModal = document.getElementById('analysisProgressModal');
  if (progressModal) {
    const modal = bootstrap.Modal.getInstance(progressModal);
    if (modal) modal.hide();
  }
}

// Create analysis progress modal
function createAnalysisProgressModal() {
  // Remove existing modal if any
  const existingModal = document.getElementById('analysisProgressModal');
  if (existingModal) existingModal.remove();

  const modalHTML = `
    <div class="modal fade" id="analysisProgressModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header bg-primary text-white">
            <h5 class="modal-title">
              <i class="fa-solid fa-microscope me-2"></i>
              Analyzing Prescription
            </h5>
          </div>
          <div class="modal-body text-center py-4">
            <div class="mb-3">
              <i class="fa-solid fa-file-medical fa-3x text-primary mb-3"></i>
            </div>
            <p id="analysisProgressText" class="mb-3">Starting analysis...</p>
            <div class="progress">
              <div id="analysisProgressBar" class="progress-bar bg-primary" role="progressbar" 
                   style="width: 0%" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHTML);
  return document.getElementById('analysisProgressModal');
}

// Show prescription analysis results
function showPrescriptionResults(matchedProducts, foundMedicines) {
  const resultsModal = createPrescriptionResultsModal(matchedProducts, foundMedicines);
  const modal = new bootstrap.Modal(resultsModal);
  modal.show();
}

// Create prescription results modal
function createPrescriptionResultsModal(matchedProducts, foundMedicines) {
  // Remove existing modal if any
  const existingModal = document.getElementById('prescriptionResultsModal');
  if (existingModal) existingModal.remove();

  const modalHTML = `
    <div class="modal fade" id="prescriptionResultsModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-xl">
        <div class="modal-content">
          <div class="modal-header bg-success text-white">
            <h5 class="modal-title">
              <i class="fa-solid fa-check-circle me-2"></i>
              Prescription Analysis Results
            </h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            ${generateResultsHTML(matchedProducts, foundMedicines)}
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            <button type="button" class="btn btn-primary" onclick="addAllToCart()">
              <i class="fa-solid fa-cart-plus me-2"></i>
              Add All to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHTML);
  return document.getElementById('prescriptionResultsModal');
}

// Generate results HTML
function generateResultsHTML(matchedProducts, foundMedicines) {
  if (matchedProducts.length === 0) {
    return `
      <div class="text-center py-5">
        <i class="fa-solid fa-exclamation-triangle fa-3x text-warning mb-3"></i>
        <h4>No Matching Products Found</h4>
        <p class="text-muted">We couldn't find any products matching the medicines in your prescription.</p>
        <div class="mt-4">
          <h6>Detected Text:</h6>
          <div class="bg-light p-3 rounded">
            ${foundMedicines.map(m => `<span class="badge bg-secondary me-2">${m.found}</span>`).join('')}
          </div>
        </div>
        <p class="mt-3"><small>Try uploading a clearer image or search manually for your medicines.</small></p>
      </div>
    `;
  }

  return `
    <div class="prescription-results">
      <div class="alert alert-success">
        <i class="fa-solid fa-check-circle me-2"></i>
        <strong>Analysis Complete!</strong> Found ${matchedProducts.length} matching product(s) in your prescription.
      </div>
      
      <div class="row g-4">
        ${matchedProducts.map((match, index) => `
          <div class="col-md-6">
            <div class="card h-100 border-success">
              <div class="card-header bg-light">
                <h6 class="mb-0">
                  <i class="fa-solid fa-pills me-2 text-success"></i>
                  Medicine Found: <strong>${match.medicine.found}</strong>
                </h6>
                <small class="text-muted">Matched with: ${match.medicine.matched}</small>
              </div>
              <div class="card-body">
                <div class="d-flex align-items-center">
                  <img src="${match.bestMatch.image}" 
                       class="me-3" 
                       style="width: 80px; height: 80px; object-fit: contain; border: 1px solid #ddd; border-radius: 8px;"
                       onerror="this.src='img/products/product-placeholder.jpg'">
                  <div class="flex-grow-1">
                    <h5 class="card-title mb-2">${match.bestMatch.name}</h5>
                    <div class="mb-2">
                      <span class="badge bg-primary">${match.bestMatch.category}</span>
                      <span class="badge bg-info ms-1">${match.medicine.confidence}% match</span>
                    </div>
                    <div class="price-info">
                      ${match.bestMatch.originalPrice !== match.bestMatch.price ? 
                        `<span class="text-decoration-line-through text-muted me-2">₹${match.bestMatch.originalPrice}</span>` : ''
                      }
                      <span class="h5 text-success">₹${match.bestMatch.price}</span>
                    </div>
                  </div>
                </div>
                <div class="mt-3 d-flex justify-content-between align-items-center">
                  <div class="quantity-controls d-flex align-items-center">
                    <button type="button" class="btn btn-outline-secondary btn-sm" onclick="adjustPrescriptionQuantity('${match.bestMatch.id}', -1)">-</button>
                    <input type="number" id="prescription_qty_${match.bestMatch.id}" class="form-control form-control-sm mx-2 text-center" value="1" min="1" max="10" style="width: 60px;">
                    <button type="button" class="btn btn-outline-secondary btn-sm" onclick="adjustPrescriptionQuantity('${match.bestMatch.id}', 1)">+</button>
                  </div>
                  <button class="btn btn-success btn-sm" onclick="addPrescriptionProductToCart('${match.bestMatch.id}')">
                    <i class="fa-solid fa-cart-plus me-1"></i>Add to Cart
                  </button>
                </div>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
      
      ${foundMedicines.length > matchedProducts.length ? `
        <div class="mt-4">
          <h6>Other medicines detected but not available:</h6>
          <div class="bg-light p-3 rounded">
            ${foundMedicines
              .filter(m => !matchedProducts.some(mp => mp.medicine.matched === m.matched))
              .map(m => `<span class="badge bg-warning text-dark me-2">${m.found}</span>`)
              .join('')
            }
          </div>
          <small class="text-muted">These medicines are not currently available in our inventory.</small>
        </div>
      ` : ''}
    </div>
  `;
}

// Adjust prescription product quantity
function adjustPrescriptionQuantity(productId, change) {
  const qtyInput = document.getElementById(`prescription_qty_${productId}`);
  if (qtyInput) {
    const currentQty = parseInt(qtyInput.value) || 1;
    const newQty = Math.max(1, Math.min(10, currentQty + change));
    qtyInput.value = newQty;
  }
}

// Add prescription product to cart
function addPrescriptionProductToCart(productId) {
  const qtyInput = document.getElementById(`prescription_qty_${productId}`);
  const quantity = qtyInput ? parseInt(qtyInput.value) || 1 : 1;
  
  // Find the product in our database
  const product = window.PRODUCT_DATABASE ? 
    window.PRODUCT_DATABASE.find(p => p.id === productId) : null;
  
  if (product) {
    // Use existing cart functionality - try different possible function names
    if (window.addToCartWithQuantity) {
      window.addToCartWithQuantity(product.name, product.price, product.image, productId);
    } else if (window.addToCart) {
      window.addToCart(product.name, product.price, product.image);
    } else {
      // Fallback - add to cart manually
      addToCartManually(product, quantity);
    }
    
    // Show success message
    showSuccessMessage(`Added ${quantity}x ${product.name} to cart`);
    
    // Update button state
    const button = event.target ? event.target.closest('button') : 
                   document.querySelector(`button[onclick*="${productId}"]`);
    if (button) {
      const originalHTML = button.innerHTML;
      button.innerHTML = '<i class="fa-solid fa-check me-1"></i>Added!';
      button.disabled = true;
      button.classList.remove('btn-success');
      button.classList.add('btn-outline-success');
      
      setTimeout(() => {
        button.innerHTML = originalHTML;
        button.disabled = false;
        button.classList.add('btn-success');
        button.classList.remove('btn-outline-success');
      }, 2000);
    }
  }
}

// Manual cart addition fallback
function addToCartManually(product, quantity) {
  try {
    // Try to access the global cart array
    if (window.myCart && Array.isArray(window.myCart)) {
      const existingItem = window.myCart.find(item => item.name === product.name);
      
      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        window.myCart.push({
          name: product.name,
          price: product.price,
          image: product.image,
          quantity: quantity
        });
      }
      
      // Save to localStorage if function exists
      if (window.saveCartToStorage) {
        window.saveCartToStorage();
      }
      
      // Update cart display if function exists
      if (window.updateCartBadge) {
        window.updateCartBadge();
      }
      if (window.updateCartDisplay) {
        window.updateCartDisplay();
      }
      
      console.log('✅ Added to cart manually:', product.name);
    }
  } catch (error) {
    console.error('❌ Error adding to cart manually:', error);
  }
}

// Add all prescription products to cart
function addAllToCart() {
  const addButtons = document.querySelectorAll('#prescriptionResultsModal .btn-success');
  let addedCount = 0;
  
  addButtons.forEach((button, index) => {
    setTimeout(() => {
      if (!button.disabled) {
        button.click();
        addedCount++;
      }
    }, index * 200); // Stagger the additions
  });
  
  setTimeout(() => {
    if (addedCount > 0) {
      showSuccessMessage(`Added ${addedCount} prescription items to cart!`);
      
      // Close modal after a delay
      setTimeout(() => {
        const modal = bootstrap.Modal.getInstance(document.getElementById('prescriptionResultsModal'));
        if (modal) modal.hide();
      }, 1500);
    }
  }, addButtons.length * 200 + 500);
}

// Show analysis error
function showAnalysisError(message) {
  const errorModal = createErrorModal(message);
  const modal = new bootstrap.Modal(errorModal);
  modal.show();
}

// Create error modal
function createErrorModal(message) {
  const existingModal = document.getElementById('prescriptionErrorModal');
  if (existingModal) existingModal.remove();

  const modalHTML = `
    <div class="modal fade" id="prescriptionErrorModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header bg-danger text-white">
            <h5 class="modal-title">
              <i class="fa-solid fa-exclamation-triangle me-2"></i>
              Analysis Error
            </h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <p>${message}</p>
            <div class="mt-3">
              <h6>Tips for better results:</h6>
              <ul class="small">
                <li>Ensure the prescription is well-lit and clear</li>
                <li>Avoid shadows or glare on the document</li>
                <li>Make sure medicine names are clearly visible</li>
                <li>Try uploading a higher resolution image</li>
              </ul>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-primary" data-bs-dismiss="modal">Try Again</button>
          </div>
        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHTML);
  return document.getElementById('prescriptionErrorModal');
}

// Show success message
function showSuccessMessage(message) {
  // Create or update toast notification
  const toastContainer = getOrCreateToastContainer();
  const toastHTML = `
    <div class="toast align-items-center text-white bg-success border-0" role="alert">
      <div class="d-flex">
        <div class="toast-body">
          <i class="fa-solid fa-check-circle me-2"></i>${message}
        </div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
      </div>
    </div>
  `;
  
  toastContainer.insertAdjacentHTML('beforeend', toastHTML);
  const toast = new bootstrap.Toast(toastContainer.lastElementChild);
  toast.show();
}

// Get or create toast container
function getOrCreateToastContainer() {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container position-fixed top-0 end-0 p-3';
    container.style.zIndex = '1060';
    document.body.appendChild(container);
  }
  return container;
}

// Override existing updateFileName to trigger analysis
function updateFileName(input) {
  const fileNameDisplay = document.getElementById('selected-file');
  const deleteButton = document.getElementById('delete-file');
  
  if (input.files && input.files[0]) {
    const fileName = input.files[0].name;
    fileNameDisplay.textContent = fileName;
    deleteButton.style.display = 'flex';
    
    // Show analysis will start message
    showSuccessMessage('Prescription uploaded! Analysis will begin automatically.');
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  console.log('💊 Prescription analyzer ready');
  initializePrescriptionAnalyzer();
});

// Store matched products globally for cart integration
window.prescriptionAnalysisResults = [];
window.addPrescriptionProductToCart = addPrescriptionProductToCart;
window.addAllToCart = addAllToCart;
window.adjustPrescriptionQuantity = adjustPrescriptionQuantity;
