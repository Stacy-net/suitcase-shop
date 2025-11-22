import { showNotification, NotificationType } from './home.js';

// ============================================================================
// CONSTANTS
// ============================================================================

const CART_STORAGE_KEY = 'suitcase-cart';

const CONFIG = {
	ASSETS_PATH: '../assets/',
	SHIPPING_COST: 30,
	DISCOUNT_THRESHOLD: 3000,
	DISCOUNT_RATE: 0.1,
	MIN_QUANTITY: 1,
};

const SELECTORS = {
	cartItems: '.cart__items',
	quantityBtn: '.cart__quantity-btn',
	deleteBtn: '.cart__delete-btn',
	continueBtn: '.btn-primary',
	clearBtn: '.btn-secondary',
	checkoutBtn: '.cart__checkout-btn',
	subtotal: '[data-js="subtotal"]',
	discount: '[data-js="discount"]',
	discountRow: '[data-js="discount-row"]',
	shipping: '[data-js="shipping"]',
	total: '[data-js="total"]',
	cartCount: '[data-js="cart-count"]',
};

const MESSAGES = {
	emptyCart: 'Your cart is empty',
	removeItem: 'Are you sure you want to remove this item?',
	clearCart: 'Are you sure you want to clear your cart?',
	emptyCheckout: 'Your cart is empty!',
	checkout: 'Thank you for your purchase!',
	removeOnZero: 'Remove this item from cart?',
};
const ROUTES = {
	catalog: '/html/catalog.html',
};

// ============================================================================
// CART MANAGER
// ============================================================================

export const CartManager = {
	getCart() {
		const cart = localStorage.getItem(CART_STORAGE_KEY);
		return cart ? JSON.parse(cart) : [];
	},

	saveCart(cart) {
		localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
	},

	addToCart(product, quantity = 1) {
		const cart = this.getCart();
		const existingItem = cart.find((item) => item.id === product.id);

		if (existingItem) {
			existingItem.quantity += quantity;
		} else {
			cart.push({
				id: product.id,
				name: product.name,
				price: product.price,
				imageUrl: product.imageUrl,
				quantity: quantity,
			});
		}

		this.saveCart(cart);
		this.updateCartCount();
		return cart;
	},

	removeFromCart(productId) {
		let cart = this.getCart();
		cart = cart.filter((item) => item.id !== productId);
		this.saveCart(cart);
		this.updateCartCount();
		return cart;
	},

	updateQuantity(productId, quantity) {
		const cart = this.getCart();
		const item = cart.find((item) => item.id === productId);

		if (item) {
			item.quantity = Math.max(CONFIG.MIN_QUANTITY, quantity);
			this.saveCart(cart);
		}

		return cart;
	},

	clearCart() {
		localStorage.removeItem(CART_STORAGE_KEY);
		this.updateCartCount();
	},

	getDiscount(subtotal) {
		return subtotal >= CONFIG.DISCOUNT_THRESHOLD
			? subtotal * CONFIG.DISCOUNT_RATE
			: 0;
	},

	getCartCount() {
		const cart = this.getCart();
		return cart.reduce((total, item) => total + item.quantity, 0);
	},

	getCartTotal() {
		const cart = this.getCart();
		return cart.reduce((total, item) => total + item.price * item.quantity, 0);
	},

	updateCartCount() {
		const cartCountElements = document.querySelectorAll(SELECTORS.cartCount);
		const count = this.getCartCount();

		cartCountElements.forEach((element) => {
			this._updateCartCountElement(element, count);
		});
	},

	_updateCartCountElement(element, count) {
		element.textContent = count;
		const shouldShow = count > 0;
		element.hidden = !shouldShow;
		element.style.display = shouldShow ? 'flex' : 'none';
	},

	calculateCartSummary() {
		const cart = this.getCart();
		const subtotal = this.getCartTotal();
		const discount = this.getDiscount(subtotal);
		const subtotalAfterDiscount = subtotal - discount;
		const shipping = cart.length > 0 ? CONFIG.SHIPPING_COST : 0;
		const total = subtotalAfterDiscount + shipping;

		return {
			subtotal,
			discount,
			subtotalAfterDiscount,
			shipping,
			total,
			hasItems: cart.length > 0,
		};
	},
};

// ============================================================================
// RENDER FUNCTIONS
// ============================================================================

const createCartItemHTML = (item) => {
	const itemTotal = (item.price * item.quantity).toFixed(2);
	return `
    <div class="cart__item" data-id="${item.id}">
      <img src="${CONFIG.ASSETS_PATH}${item.imageUrl}" alt="${item.name}" class="cart__item-image">
      <div class="cart__item-name">${item.name}</div>
      <div class="cart__item-price">$${item.price}</div>
      <div class="cart__quantity">
        <button class="cart__quantity-btn" data-action="decrease" data-id="${item.id}">−</button>
        <span class="cart__quantity-value">${item.quantity}</span>
        <button class="cart__quantity-btn" data-action="increase" data-id="${item.id}">+</button>
      </div>
      <div class="cart__item-total">$${itemTotal}</div>
      <button class="cart__delete-btn" data-id="${item.id}">
        <img src="${CONFIG.ASSETS_PATH}images/icons/trash.svg" alt="Delete icon">
      </button>
    </div>
  `;
};

const createEmptyCartHTML = () => {
	return `
    <div class="cart__empty">
      <p>${MESSAGES.emptyCart}</p>
    </div>
  `;
};

const renderCartItems = () => {
	const cart = CartManager.getCart();
	const cartItemsContainer = document.querySelector(SELECTORS.cartItems);

	if (!cartItemsContainer) return;

	if (cart.length === 0) {
		cartItemsContainer.innerHTML = createEmptyCartHTML();
		updateCartSummary();
		return;
	}

	cartItemsContainer.innerHTML = cart.map(createCartItemHTML).join('');
	initCartControls();

	updateCartSummary();
};

const updateCartSummary = () => {
	const summary = CartManager.calculateCartSummary();

	updateElement(SELECTORS.subtotal, `$${summary.subtotal.toFixed(2)}`);
	updateElement(SELECTORS.shipping, `$${summary.shipping.toFixed(2)}`);
	updateElement(SELECTORS.total, `$${summary.total.toFixed(2)}`);

	toggleDiscountRow(summary.discount);
};

const updateElement = (selector, value) => {
	const element = document.querySelector(selector);
	if (element) {
		element.textContent = value;
	}
};

const toggleDiscountRow = (discount) => {
	const discountRow = document.querySelector(SELECTORS.discountRow);
	const discountElement = document.querySelector(SELECTORS.discount);

	if (!discountRow) return;

	if (discount > 0) {
		discountRow.hidden = false;
		discountRow.style.display = 'flex';
		if (discountElement) {
			discountElement.textContent = `$${discount.toFixed(2)}`;
		}
	} else {
		discountRow.hidden = true;
		discountRow.style.display = 'none';
	}
};
// ============================================================================
// EVENT HANDLERS
// ============================================================================

const handleQuantityChange = (productId, action) => {
	const item = CartManager.getCart().find((i) => i.id === productId);

	if (!item) return;

	const newQuantity =
		action === 'increase' ? item.quantity + 1 : item.quantity - 1;

	if (newQuantity > CONFIG.MIN_QUANTITY) {
		CartManager.updateQuantity(productId, newQuantity);
		renderCartItems();
	} else {
		if (confirm(MESSAGES.removeOnZero)) {
			CartManager.removeFromCart(productId);
			renderCartItems();
		}
	}
};

const handleDeleteItem = (productId) => {
	if (confirm(MESSAGES.removeItem)) {
		CartManager.removeFromCart(productId);
		renderCartItems();
	}
};

const handleContinueShopping = () => {
	window.location.href = ROUTES.catalog;
};

const handleClearCart = () => {
	if (confirm(MESSAGES.clearCart)) {
		CartManager.clearCart();
		renderCartItems();
	}
};

const handleCheckout = () => {
	const cart = CartManager.getCart();

	if (cart.length === 0) {
		showNotification(MESSAGES.emptyCheckout, NotificationType.ERROR);
		return;
	}

	showNotification(MESSAGES.checkout, NotificationType.SUCCESS);
	CartManager.clearCart();
	renderCartItems();
};

// ============================================================================
// INITIALIZATION
// ============================================================================

const initCartControls = () => {
	const cartItemsContainer = document.querySelector(SELECTORS.cartItems);
	if (!cartItemsContainer) return;

	cartItemsContainer.addEventListener('click', (e) => {
		const quantityBtn = e.target.closest(SELECTORS.quantityBtn);
		const deleteBtn = e.target.closest(SELECTORS.deleteBtn);

		if (quantityBtn) {
			const productId = quantityBtn.dataset.id;
			const action = quantityBtn.dataset.action;
			handleQuantityChange(productId, action);
		}

		if (deleteBtn) {
			const productId = deleteBtn.dataset.id;
			handleDeleteItem(productId);
		}
	});
};

const initCartButtons = () => {
	const continueBtn = document.querySelector(SELECTORS.continueBtn);
	const clearBtn = document.querySelector(SELECTORS.clearBtn);
	const checkoutBtn = document.querySelector(SELECTORS.checkoutBtn);

	if (continueBtn) {
		continueBtn.addEventListener('click', handleContinueShopping);
	}

	if (clearBtn) {
		clearBtn.addEventListener('click', handleClearCart);
	}

	if (checkoutBtn) {
		checkoutBtn.addEventListener('click', handleCheckout);
	}
};

export const initCart = () => {
	renderCartItems();
	initCartButtons();
	CartManager.updateCartCount();
};
