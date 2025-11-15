// ============================================================================
// CONSTANTS
// ============================================================================

const CART_STORAGE_KEY = 'suitcase-cart';
const ASSETS_PATH = '../assets/';
const SHIPPING_COST = 30;

const SELECTORS = {
	cartItems: '.cart__items',
	quantityBtn: '.cart__quantity-btn',
	deleteBtn: '.cart__delete-btn',
	continueBtn: '.btn-primary',
	clearBtn: '.btn-secondary',
	checkoutBtn: '.cart__checkout-btn',
	subtotal: '[data-js="subtotal"]',
	shipping: '[data-js="shipping"]',
	total: '[data-js="total"]',
	cartCount: '[data-js="cart-count"]',
};

const MESSAGES = {
	emptyCart: 'Your cart is empty',
	removeItem: 'Are you sure you want to remove this item?',
	clearCart: 'Are you sure you want to clear your cart?',
	emptyCheckout: 'Your cart is empty!',
	checkout: 'Proceeding to checkout...',
	removeOnZero: 'Remove this item from cart?',
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

	addToCart(product) {
		const cart = this.getCart();
		const existingItem = cart.find((item) => item.id === product.id);

		if (existingItem) {
			existingItem.quantity += 1;
		} else {
			cart.push({
				id: product.id,
				name: product.name,
				price: product.price,
				imageUrl: product.imageUrl,
				quantity: 1,
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
			item.quantity = Math.max(1, quantity);
			this.saveCart(cart);
		}

		return cart;
	},

	clearCart() {
		localStorage.removeItem(CART_STORAGE_KEY);
		this.updateCartCount();
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
			element.textContent = count;
			element.style.display = count > 0 ? 'inline' : 'none';
		});
	},
};

// ============================================================================
// RENDER FUNCTIONS
// ============================================================================

const createCartItemHTML = (item) => {
	return `
    <div class="cart__item" data-id="${item.id}">
      <img src="${ASSETS_PATH}${item.imageUrl}" alt="${
		item.name
	}" class="cart__item-image">
      <div class="cart__item-name">${item.name}</div>
      <div class="cart__item-price">$${item.price}</div>
      <div class="cart__quantity">
        <button class="cart__quantity-btn" data-action="decrease" data-id="${
					item.id
				}">−</button>
        <span class="cart__quantity-value">${item.quantity}</span>
        <button class="cart__quantity-btn" data-action="increase" data-id="${
					item.id
				}">+</button>
      </div>
      <div class="cart__item-total">$${(item.price * item.quantity).toFixed(
				2
			)}</div>
      <button class="cart__delete-btn" data-id="${item.id}">
        <img src="../assets/images/icons/trash.svg" alt="Delete icon">
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
	const cart = CartManager.getCart();
	const subtotal = CartManager.getCartTotal();
	const shipping = cart.length > 0 ? SHIPPING_COST : 0;
	const total = subtotal + shipping;

	const subtotalElement = document.querySelector(SELECTORS.subtotal);
	const shippingElement = document.querySelector(SELECTORS.shipping);
	const totalElement = document.querySelector(SELECTORS.total);

	if (subtotalElement) subtotalElement.textContent = `$${subtotal.toFixed(2)}`;
	if (shippingElement) shippingElement.textContent = `$${shipping.toFixed(2)}`;
	if (totalElement) totalElement.textContent = `$${total.toFixed(2)}`;
};

// ============================================================================
// EVENT HANDLERS
// ============================================================================

const handleQuantityChange = (productId, action) => {
	const item = CartManager.getCart().find((i) => i.id === productId);

	if (!item) return;

	const newQuantity =
		action === 'increase' ? item.quantity + 1 : item.quantity - 1;

	if (newQuantity > 0) {
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
	window.location.href = '../catalog.html';
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
		alert(MESSAGES.emptyCheckout);
		return;
	}

	alert(MESSAGES.checkout);
	// Тут можна додати редірект на сторінку оформлення замовлення
};

// ============================================================================
// INITIALIZATION
// ============================================================================

const initCartControls = () => {
	// Кнопки зміни кількості
	document.querySelectorAll(SELECTORS.quantityBtn).forEach((btn) => {
		btn.addEventListener('click', (e) => {
			const productId = e.currentTarget.dataset.id;
			const action = e.currentTarget.dataset.action;
			handleQuantityChange(productId, action);
		});
	});

	// Кнопки видалення
	document.querySelectorAll(SELECTORS.deleteBtn).forEach((btn) => {
		btn.addEventListener('click', (e) => {
			const productId = e.currentTarget.dataset.id;
			handleDeleteItem(productId);
		});
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
