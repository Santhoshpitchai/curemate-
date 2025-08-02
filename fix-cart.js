// Cart Fix Script - Run this in browser console to fix cart issues
// Copy and paste this entire script into the browser console and press Enter

console.log('🛠️ Starting Cart Fix Script...');

// Step 1: Check current localStorage data
console.log('📋 Current localStorage data:');
console.log('cureMateCart:', localStorage.getItem('cureMateCart'));
console.log('shoppingCart:', localStorage.getItem('shoppingCart'));

// Step 2: Clear all cart-related localStorage
console.log('🗑️ Clearing all cart data...');
localStorage.removeItem('cureMateCart');
localStorage.removeItem('shoppingCart');
localStorage.removeItem('cart');
localStorage.removeItem('myCart');

// Step 3: Reset cart variables if they exist
if (typeof myCart !== 'undefined') {
    myCart = [];
    console.log('✅ Reset myCart variable');
}

if (typeof cart !== 'undefined') {
    cart = [];
    console.log('✅ Reset cart variable');
}

// Step 4: Update cart display and badge if functions exist
if (typeof updateCartBadge === 'function') {
    updateCartBadge();
    console.log('✅ Updated cart badge');
}

if (typeof updateCartDisplay === 'function') {
    updateCartDisplay();
    console.log('✅ Updated cart display');
}

// Step 5: Force refresh if function exists
if (typeof forceRefreshCart === 'function') {
    forceRefreshCart();
    console.log('✅ Force refreshed cart');
}

console.log('🎉 Cart fix complete! The cart should now show as empty.');
console.log('💡 If you still see issues, try refreshing the page.');
