// PetJoy Store - Shopping Cart Functionality

// Initialize cart from localStorage or empty array
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Add item to cart
function addToCart(id, name, price) {
    const existingItem = cart.find(item => item.id === id);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: id,
            name: name,
            price: price,
            quantity: 1
        });
    }
    
    saveCart();
    updateCartCount();
    showNotification(`${name} added to cart!`);
}

// Remove item from cart
function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    saveCart();
    updateCartCount();
    displayCart();
}

// Update item quantity
function updateQuantity(id, change) {
    const item = cart.find(item => item.id === id);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(id);
        } else {
            saveCart();
            updateCartCount();
            displayCart();
        }
    }
}

// Save cart to localStorage
function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Update cart count badge
function updateCartCount() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartCountElements = document.querySelectorAll('.cart-count');
    cartCountElements.forEach(el => {
        el.textContent = totalItems;
        el.style.display = totalItems > 0 ? 'block' : 'none';
    });
}

// Display cart items on cart page
function displayCart() {
    const cartContainer = document.getElementById('cart-items');
    const cartSummary = document.getElementById('cart-summary');
    
    if (!cartContainer) return;
    
    if (cart.length === 0) {
        cartContainer.innerHTML = `
            <div class="empty-cart">
                <p>Your cart is empty</p>
                <a href="index.html#products" class="btn btn-primary">Continue Shopping</a>
            </div>
        `;
        if (cartSummary) cartSummary.style.display = 'none';
        return;
    }
    
    let html = '';
    let total = 0;
    
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        
        html += `
            <div class="cart-item">
                <div class="cart-item-info">
                    <h3>${item.name}</h3>
                    <p class="cart-item-price">$${item.price.toFixed(2)}</p>
                </div>
                <div class="cart-item-quantity">
                    <button class="quantity-btn" onclick="updateQuantity(${item.id}, -1)">-</button>
                    <span>${item.quantity}</span>
                    <button class="quantity-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
                </div>
                <div class="cart-item-total">
                    $${itemTotal.toFixed(2)}
                </div>
                <button class="remove-btn" onclick="removeFromCart(${item.id})">×</button>
            </div>
        `;
    });
    
    cartContainer.innerHTML = html;
    
    if (cartSummary) {
        cartSummary.style.display = 'block';
        const subtotal = total;
        const shipping = subtotal > 35 ? 0 : 5.99;
        const grandTotal = subtotal + shipping;
        
        cartSummary.innerHTML = `
            <h3>Order Summary</h3>
            <div class="summary-row">
                <span>Subtotal</span>
                <span>$${subtotal.toFixed(2)}</span>
            </div>
            <div class="summary-row">
                <span>Shipping</span>
                <span>${shipping === 0 ? 'FREE' : '$' + shipping.toFixed(2)}</span>
            </div>
            <div class="summary-row total">
                <span>Total</span>
                <span>$${grandTotal.toFixed(2)}</span>
            </div>
            <button class="btn btn-primary checkout-btn" onclick="checkout()">Proceed to Checkout</button>
        `;
    }
}

// Show notification
function showNotification(message) {
    // Remove existing notification
    const existing = document.querySelector('.cart-notification');
    if (existing) existing.remove();
    
    // Create new notification
    const notification = document.createElement('div');
    notification.className = 'cart-notification';
    notification.innerHTML = `
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => notification.classList.add('show'), 10);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Checkout function
function checkout() {
    if (cart.length === 0) {
        showNotification('Your cart is empty!');
        return;
    }
    
    alert('Thank you for your order! This is a demo store - checkout functionality would integrate with a payment processor like Stripe or PayPal.');
    cart = [];
    saveCart();
    updateCartCount();
    displayCart();
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    updateCartCount();
    displayCart();
});
