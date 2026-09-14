const cartToggle = document.querySelector('#cartToggle');
const cartDrawer = document.querySelector('#cartDrawer');
const cartOverlay = document.querySelector('#cartOverlay');
const closeCart = document.querySelector('#closeCart');
const productGrid = document.querySelector('#productGrid');
const cartItemsContainer = document.querySelector('#cartItems');
const cartCountBadge = document.querySelector('#cartCountBadge');
const cartTotalElement = document.querySelector('#cartTotal');
const checkoutBtn = document.querySelector('#checkoutBtn');
const toast = document.querySelector('#toast');

const icons = {
    iphone: '<svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><rect x="30" y="10" width="40" height="80" rx="10"/><line x1="42" y1="18" x2="58" y2="18"/><line x1="43" y1="82" x2="57" y2="82"/></svg>',
    ipad: '<svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><rect x="16" y="14" width="68" height="72" rx="8"/><circle cx="50" cy="78" r="2.5" fill="currentColor" stroke="none"/></svg>',
    mac: '<svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><rect x="18" y="18" width="64" height="42" rx="4"/><path d="M10 78h80l-8-12H18l-8 12z"/></svg>',
    watch: '<svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><rect x="30" y="26" width="40" height="48" rx="12"/><path d="M38 26v-8a4 4 0 0 1 4-4h16a4 4 0 0 1 4 4v8"/><path d="M38 74v8a4 4 0 0 0 4 4h16a4 4 0 0 0 4-4v-8"/><line x1="58" y1="42" x2="58" y2="50"/><line x1="58" y1="50" x2="63" y2="53"/></svg>'
};

const products = [
    { id: 1, name: 'iPhone 17 Pro', tagline: 'Titanium. Turbocharged.', price: 999, swatch: 'swatch-iphone', icon: 'iphone', colors: ['#ff8a5c', '#3a3a3c', '#e8e2d8'] },
    { id: 2, name: 'iPad Ultra', tagline: 'Impossibly thin. Ridiculously fast.', price: 1099, swatch: 'swatch-ipad', icon: 'ipad', colors: ['#5b7cfa', '#c0c0c2', '#1d1d1f'] },
    { id: 3, name: 'MacBook Pro M5', tagline: 'Mind-blowing. Speed of light.', price: 1999, swatch: 'swatch-mac', icon: 'mac', colors: ['#3a3a3c', '#e3e3e3'] },
    { id: 4, name: 'Apple Watch X', tagline: 'Smarter. Brighter. Mightier.', price: 399, swatch: 'swatch-watch', icon: 'watch', colors: ['#00c896', '#1d1d1f', '#ff8a5c'] }
];

let cart = [];
let toastTimer = null;

const formatPrice = (n) => `$${n.toLocaleString('en-US')}`;

const renderProducts = () => {
    productGrid.innerHTML = products.map(product => `
        <div class="product-card" data-id="${product.id}">
            <div class="product-swatch ${product.swatch}">${icons[product.icon]}</div>
            <div class="product-info">
                <h3>${product.name}</h3>
                <p class="product-tagline">${product.tagline}</p>
                <div class="color-dots">${product.colors.map(c => `<span style="background:${c}"></span>`).join('')}</div>
                <div class="product-footer-row">
                    <p class="product-price">${formatPrice(product.price)}</p>
                    <button class="buy-button" data-id="${product.id}">Add to Bag</button>
                </div>
            </div>
        </div>
    `).join('');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });

    document.querySelectorAll('.product-card').forEach(card => observer.observe(card));
};

const updateCartUI = () => {
    const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    cartCountBadge.textContent = totalCount;
    cartTotalElement.textContent = formatPrice(totalPrice);
    checkoutBtn.disabled = cart.length === 0;

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
            <div class="empty-message">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 6h15l-1.5 9h-12L6 6zm0 0L5 3H2"/><circle cx="9" cy="20" r="1.4"/><circle cx="17" cy="20" r="1.4"/></svg>
                <p>Your bag is empty.<br>Add something you'll love.</p>
            </div>`;
        return;
    }

    cartItemsContainer.innerHTML = cart.map(item => `
        <div class="cart-item">
            <div class="cart-item-swatch ${item.swatch}">${icons[item.icon]}</div>
            <div class="cart-item-details">
                <h4>${item.name}</h4>
                <p class="cart-item-price">${formatPrice(item.price)}</p>
                <div class="qty-controls">
                    <button class="qty-btn" data-action="dec" data-id="${item.id}" aria-label="Decrease quantity">−</button>
                    <span class="qty-value">${item.quantity}</span>
                    <button class="qty-btn" data-action="inc" data-id="${item.id}" aria-label="Increase quantity">+</button>
                    <button class="remove-button" data-id="${item.id}">Remove</button>
                </div>
            </div>
        </div>
    `).join('');
};

const showToast = (message) => {
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
};

const addToCart = (productId) => {
    const product = products.find(p => p.id === productId);
    const existingItem = cart.find(item => item.id === productId);

    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({ ...product, quantity: 1 });
    }

    updateCartUI();
    showToast(`Added ${product.name} to your bag.`);
    cartCountBadge.classList.remove('bump');
    void cartCountBadge.offsetWidth;
    cartCountBadge.classList.add('bump');
};

const changeQuantity = (productId, delta) => {
    const item = cart.find(i => i.id === productId);
    if (!item) return;
    item.quantity += delta;
    if (item.quantity <= 0) {
        cart = cart.filter(i => i.id !== productId);
    }
    updateCartUI();
};

const removeFromCart = (productId) => {
    cart = cart.filter(item => item.id !== productId);
    updateCartUI();
};

const openCart = () => {
    cartDrawer.classList.add('active');
    cartOverlay.classList.add('active');
};

const closeCartDrawer = () => {
    cartDrawer.classList.remove('active');
    cartOverlay.classList.remove('active');
};

cartToggle.addEventListener('click', openCart);
closeCart.addEventListener('click', closeCartDrawer);
cartOverlay.addEventListener('click', closeCartDrawer);

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeCartDrawer();
});

productGrid.addEventListener('click', (e) => {
    if (e.target.classList.contains('buy-button')) {
        addToCart(parseInt(e.target.dataset.id));
    }
});


checkoutBtn.addEventListener('click', () => {
    showToast('This is a demo — no real checkout yet.');
});

renderProducts();
updateCartUI();