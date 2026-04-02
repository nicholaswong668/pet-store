// PetJoy Store - Shopping Cart Functionality

const PRODUCT_CATALOG = {
    '1': {
        name: 'Extra Large Capacity Cat Litter Box',
        image: 'images/litter-box-1.jpg'
    },
    '2': {
        name: 'Stainless Steel Cat Litter Box',
        image: 'images/litter-box-6.jpg',
        variants: {
            Black: { image: 'images/litter-box-10.jpg' },
            'Light Gray': { image: 'images/litter-box-11.jpg' },
            Khaki: { image: 'images/litter-box-12.jpg' }
        }
    },
    '3': {
        name: 'Large Capacity Cat Litter Box',
        image: 'images/litter-box-16.jpg',
        variants: {
            Gray: { image: 'images/litter-box-16.jpg' },
            Yellow: { image: 'images/litter-box-17.jpg' },
            Black: { image: 'images/litter-box-18.jpg' },
            Beige: { image: 'images/litter-box-19.jpg' },
            Green: { image: 'images/litter-box-20.jpg' }
        }
    },
    '4': {
        name: 'Smart Self-Cleaning Litter Box with APP Control, Odor Exhaust System & 10L Waste Bin - White',
        image: 'images/litter-box-25.jpg'
    },
    '5': {
        name: 'Self Cleaning Litter Box, Large Capacity Automatic Cat Litter Box Self Cleaning for Cats, App Control,Safety Protection, 2 Roll Garbage Bags,White & Grey',
        image: 'images/litter-box-27.jpg'
    },
    '6': {
        name: 'Automatic Litter Box, (2026) Multi-Function Upgrade Robot Self Cleaning Litter Box for Multiple Cats, 65L+9L Extra Large, APP Control, Deodorization, 3 Rolls Litter Bag Liners, 1 Odor Eliminator',
        image: 'images/litter-box-33.jpg'
    },
    '7': {
        name: 'Self Cleaning Litter Box,Open Top Automatic Litter Box with App Control for Multiple Cats, Safety Sensors Protection, Odor Control Includes 2 roll Liners,Large Waste Bin, Cream White',
        image: 'images/litter-box-40.jpg'
    },
    '8': {
        name: 'Automatic Cat Litter Box Self Cleaning - APP Control and Weight Monitoring - Ultra-Quiet, Suitable for Medium Cats and Kittens, Safe Anti-Pinch Litter Box (Assembly Required) - White',
        image: 'images/litter-box-48.jpg'
    },
    '9': {
        name: 'Self Cleaning Cat Litter Box, Automatic Cat Litter Box with APP Control Odor Removal Safety Protection for Multiple Cats, with Garbage Bags',
        image: 'images/litter-box-55.jpg'
    },
    '10': {
        name: 'Stainless Steel Litter Box with Lid,Front Entry Top Exit Kitty LitterBox,Extra Large Enclosed Metal Cat Box with Litter Scoop & Litter Mat-Dark Gray',
        image: 'images/litter-box-62.jpg'
    }
};

function normalizeQuantity(value) {
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

function enrichCartItem(item) {
    const baseId = String(item.id || '').split('_')[0];
    const product = PRODUCT_CATALOG[baseId];
    if (!product) {
        return item;
    }

    const variantToken = String(item.id || '').includes('_')
        ? String(item.id).split('_').slice(1).join(' ')
        : '';
    const normalizedVariant = variantToken.replace(/_/g, ' ').trim();
    const color = item.color || normalizedVariant;
    const variant = color && product.variants ? product.variants[color] : null;
    const image = item.image || (variant && variant.image) || product.image || '';
    const baseName = product.name || item.name;

    return {
        ...item,
        name: baseName,
        color: color || '',
        image: image
    };
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
                ...enrichCartItem(item),
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
    showNotification(`${name}${color ? ` (${color})` : ''} added to cart! (${quantity} items)`);
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
        const itemQuantity = normalizeQuantity(item.quantity);
        const itemTotal = item.price * itemQuantity;
        total += itemTotal;
        const imageHtml = item.image ? `<img src="${item.image}" alt="${item.name}" class="cart-item-image">` : '';
        const displayName = item.color ? `${item.name} (${item.color})` : item.name;
        const skuLine = `<p class="cart-item-sku">SKU: ${item.id}</p>`;

        html += `
            <div class="cart-item">
                ${imageHtml}
                <div class="cart-item-info">
                    <h3>${displayName}</h3>
                    ${item.color ? `<p class="cart-item-color">${item.color}</p>` : ''}
                    ${skuLine}
                    <p class="cart-item-price">$${item.price.toFixed(2)}</p>
                </div>
                <div class="cart-item-quantity">
                    <button class="quantity-btn" onclick="updateQuantity('${item.id}', -1)">-</button>
                    <span>${itemQuantity}</span>
                    <button class="quantity-btn" onclick="updateQuantity('${item.id}', 1)">+</button>
                </div>
                <div class="cart-item-total">
                    $${itemTotal.toFixed(2)}
                </div>
                <button class="remove-btn" onclick="removeFromCart('${item.id}')">×</button>
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

function showNotification(message) {
    const existing = document.querySelector('.cart-notification');
    if (existing) existing.remove();

    const notification = document.createElement('div');
    notification.className = 'cart-notification';
    notification.innerHTML = `
        <span>${message}</span>
    `;

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

document.addEventListener('DOMContentLoaded', function() {
    updateCartCount();
    displayCart();
});
