// Simple Shopping Cart
function addToCart(id, name, price) {
    alert('Added to cart: ' + name + ' - $' + price);
    console.log('Product added:', id, name, price);
}

function updateCartCount() {
    console.log('Cart count updated');
}

function displayCart() {
    console.log('Cart displayed');
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    console.log('Page loaded, cart ready');
    updateCartCount();
    displayCart();
});
