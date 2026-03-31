function normalizeQuantity(value) {
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

function loadCart() {
    try {
        const storedCart = JSON.parse(localStorage.getItem('cart')) || [];
        if (!Array.isArray(storedCart)) {
            return [];
        }

        return storedCart
            .filter(item => item && item.id)
            .map(item => ({
                ...item,
                quantity: normalizeQuantity(item.quantity)
            }));
    } catch (error) {
        return [];
    }
}

let cart = loadCart();

function addToCart(id, name, price, image, color, quantity) {
    cart = loadCart();
    quantity = normalizeQuantity(quantity);

    const existingItem = cart.find(item => item.id === id);

    if (existingItem) {
        existingItem.quantity = normalizeQuantity(existingItem.quantity) + quantity;
    } else {
        cart.push({
            id: id,
            name: name,
            price: price,
            image: image || '',
            color: color || '',
            quantity: quantity
        });
    }

    saveCart();
    updateCartCount();
    showNotification(name + (color ? ' (' + color + ')' : '') + ' added to cart! (' + quantity + ' items)');
}

function removeFromCart(id) {
    cart = loadCart().filter(item => item.id !== id);
    saveCart();
    updateCartCount();
    if (document.getElementById('cart-items')) {
        displayCart();
    }
}

function updateQuantity(id, change) {
    cart = loadCart();
    const item = cart.find(entry => entry.id === id);

    if (!item) {
        return;
    }

    item.quantity = normalizeQuantity(item.quantity) + change;
    if (item.quantity <= 0) {
        removeFromCart(id);
        return;
    }

    saveCart();
    updateCartCount();
    if (document.getElementById('cart-items')) {
        displayCart();
    }
}

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function updateCartCount() {
    cart = loadCart();
    const totalItems = cart.reduce((sum, item) => sum + normalizeQuantity(item.quantity), 0);
    const cartCountElements = document.querySelectorAll('.cart-count');

    cartCountElements.forEach(el => {
        el.textContent = totalItems;
        el.style.display = totalItems > 0 ? 'block' : 'none';
    });
}

function displayCart() {
    cart = loadCart();
    const cartContainer = document.getElementById('cart-items');
    const cartSummary = document.getElementById('cart-summary');

    if (!cartContainer) {
        return;
    }

    if (cart.length === 0) {
        cartContainer.innerHTML = '<div class="empty-cart"><p>Your cart is empty</p><a href="index.html#products" class="btn btn-primary">Continue Shopping</a></div>';
        if (cartSummary) {
            cartSummary.style.display = 'none';
        }
        return;
    }

    let html = '';
    let total = 0;

    cart.forEach(item => {
        const itemQuantity = normalizeQuantity(item.quantity);
        const itemTotal = item.price * itemQuantity;
        total += itemTotal;

        const imageSrc = item.image || 'https://via.placeholder.com/80x80?text=No+Image';

        html += '<div class="cart-item">' +
            '<img src="' + imageSrc + '" alt="' + item.name + '" class="cart-item-image">' +
            '<div class="cart-item-info">' +
                '<h3>' + item.name + '</h3>' +
                (item.color ? '<p class="cart-item-color">' + item.color + '</p>' : '') +
                '<p class="cart-item-price">$' + item.price.toFixed(2) + '</p>' +
            '</div>' +
            '<div class="cart-item-quantity">' +
                '<button class="quantity-btn" onclick="updateQuantity(\'' + item.id + '\', -1)">-</button>' +
                '<span>' + itemQuantity + '</span>' +
                '<button class="quantity-btn" onclick="updateQuantity(\'' + item.id + '\', 1)">+</button>' +
            '</div>' +
            '<div class="cart-item-total">$' + itemTotal.toFixed(2) + '</div>' +
            '<button class="remove-btn" onclick="removeFromCart(\'' + item.id + '\')">×</button>' +
        '</div>';
    });

    cartContainer.innerHTML = html;

    if (cartSummary) {
        cartSummary.style.display = 'block';
        const subtotal = total;
        const shipping = subtotal > 35 ? 0 : 5.99;
        const grandTotal = subtotal + shipping;

        cartSummary.innerHTML = '<h3>Order Summary</h3>' +
            '<div class="summary-row"><span>Subtotal</span><span>$' + subtotal.toFixed(2) + '</span></div>' +
            '<div class="summary-row"><span>Shipping</span><span>' + (shipping === 0 ? 'FREE' : '$' + shipping.toFixed(2)) + '</span></div>' +
            '<div class="summary-row total"><span>Total</span><span>$' + grandTotal.toFixed(2) + '</span></div>' +
            '<button class="btn btn-primary checkout-btn" onclick="checkout()">Proceed to Checkout</button>';
    }
}

function showNotification(message) {
    const existing = document.querySelector('.cart-notification');
    if (existing) {
        existing.remove();
    }

    const notification = document.createElement('div');
    notification.className = 'cart-notification';
    notification.innerHTML = '<span>' + message + '</span>';

    document.body.appendChild(notification);

    setTimeout(() => notification.classList.add('show'), 10);

    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function checkout() {
    cart = loadCart();
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
