// ============================================================================
// CONSTANTS
// ============================================================================

const STORAGE_KEY = 'shopping_cart';
const SELECTORS = {
	cartCounter: '.header__cart-counter',
	cartIcon: '.header__action[aria-label="Shopping cart"]',
};

// ============================================================================
// CART UTILITIES
// ============================================================================

const getCart = () => {
	try {
		const cart = localStorage.getItem(STORAGE_KEY);
		return cart ? JSON.parse(cart) : [];
	} catch (error) {
		console.error('Error reading cart:', error);
		return [];
	}
};

const saveCart = (cart) => {
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
		return true;
	} catch (error) {
		console.error('Error saving cart:', error);
		return false;
	}
};

const addToCart = (product) => {
	const cart = getCart();

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

	saveCart(cart);
	updateCartCounter();

	return true;
};

const removeFromCart = (productId) => {
	const cart = getCart();
	const updatedCart = cart.filter((item) => item.id !== productId);
	saveCart(updatedCart);
	updateCartCounter();
};

const updateCartItemQuantity = (productId, quantity) => {
	const cart = getCart();
	const item = cart.find((item) => item.id === productId);

	if (item) {
		if (quantity <= 0) {
			removeFromCart(productId);
		} else {
			item.quantity = quantity;
			saveCart(cart);
			updateCartCounter();
		}
	}
};

const clearCart = () => {
	localStorage.removeItem(STORAGE_KEY);
	updateCartCounter();
};

const getCartCount = () => {
	const cart = getCart();
	return cart.reduce((total, item) => total + item.quantity, 0);
};

const getCartTotal = () => {
	const cart = getCart();
	return cart.reduce((total, item) => total + item.price * item.quantity, 0);
};

// ============================================================================
// UI UPDATES
// ============================================================================

const updateCartCounter = () => {
	const counter = document.querySelector(SELECTORS.cartCounter);
	const count = getCartCount();

	if (counter) {
		counter.textContent = count;
		counter.style.display = count > 0 ? 'flex' : 'none';
	}
};

const createCartCounter = () => {
	const cartIcon = document.querySelector(SELECTORS.cartIcon);
	if (!cartIcon) return;

	let counter = cartIcon.querySelector(SELECTORS.cartCounter);

	if (!counter) {
		counter = document.createElement('span');
		counter.className = 'header__cart-counter';
		cartIcon.style.position = 'relative';
		cartIcon.appendChild(counter);
	}

	updateCartCounter();
};

// ============================================================================
// PRODUCT CARD HANDLERS
// ============================================================================

const initProductCards = (products) => {
	const productCards = document.querySelectorAll('.product-card');

	productCards.forEach((card) => {
		const productId = card.getAttribute('data-id');
		const product = products.find((p) => p.id === productId);

		if (!product) return;

		// Клік на картку -> перехід на деталі
		const imageArea = card.querySelector('.product-card__image');
		const titleArea = card.querySelector('.product-card__title');

		[imageArea, titleArea].forEach((area) => {
			if (area) {
				area.style.cursor = 'pointer';
				area.addEventListener('click', (e) => {
					if (!e.target.closest('.product-card__button')) {
						window.location.href = `./html/product.html?id=${productId}`;
					}
				});
			}
		});

		// Кнопка Add to Cart
		const addButton = card.querySelector('.product-card__button');
		if (addButton) {
			addButton.addEventListener('click', (e) => {
				e.stopPropagation();

				const success = addToCart(product);

				if (success) {
					// Візуальний фідбек
					addButton.textContent = '✓ Added!';
					addButton.style.background = '#4caf50';

					setTimeout(() => {
						addButton.textContent = 'Add To Cart';
						addButton.style.background = '';
					}, 1500);
				}
			});
		}
	});
};

// ============================================================================
// INITIALIZATION
// ============================================================================

const initCart = () => {
	createCartCounter();
	updateCartCounter();
};

// ============================================================================
// EXPORTS
// ============================================================================

export {
	getCart,
	addToCart,
	removeFromCart,
	updateCartItemQuantity,
	clearCart,
	getCartCount,
	getCartTotal,
	updateCartCounter,
	initCart,
	initProductCards,
};
