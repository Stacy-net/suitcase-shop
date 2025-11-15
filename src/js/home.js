import { CartManager } from './cart.js';

// ============================================================================
// CONSTANTS
// ============================================================================

const SELECTORS = {
	slider: '[data-js="slider"]',
	card: '[data-js="card"]',
	selectedProducts: '.selected-products .selected-products__grid',
	newProducts: '.new-products .selected-products__grid',
};

const DATA_URL = '../assets/data.json';
const ASSETS_PATH = './assets/';

// ============================================================================
// UTILITIES
// ============================================================================

const fetchProducts = async () => {
	try {
		const response = await fetch(DATA_URL);
		if (!response.ok) throw new Error('Failed to fetch products');
		const json = await response.json();
		return json.data;
	} catch (error) {
		console.error('Error loading products:', error);
		return [];
	}
};

const filterProductsByBlock = (products, blockName) => {
	return products.filter((product) => product.blocks.includes(blockName));
};

// ============================================================================
// SLIDER
// ============================================================================

const initSuitcasesSlider = () => {
	const slider = document.querySelector(SELECTORS.slider);
	if (!slider) return;

	const cards = Array.from(slider.querySelectorAll(SELECTORS.card));
	if (!cards.length) return;

	let isPaused = false;

	cards.forEach((card) => {
		card.addEventListener('mouseenter', () => {
			isPaused = true;
		});

		card.addEventListener('mouseleave', () => {
			isPaused = false;
		});
	});

	const rotateCards = () => {
		if (isPaused) return;

		const firstCard = slider.querySelector(SELECTORS.card);
		slider.appendChild(firstCard);
	};

	setInterval(rotateCards, 4000);
};

// ============================================================================
// RENDER
// ============================================================================

const createProductCard = (product) => {
	const saleBadge = product.salesStatus
		? '<span class="product-card__status btn btn--small">SALE</span>'
		: '';

	return `
    <div class="product-card" data-id="${product.id}">
      <div class="product-card__image">
        <img src="${ASSETS_PATH}${product.imageUrl}" alt="${product.name}">
        ${saleBadge}
      </div>
      <div class="product-card__details">
        <h3 class="product-card__title">${product.name}</h3>
        <div class="product-card__price">$${product.price}</div>
        <button class="product-card__button btn btn--medium" data-id="${product.id}">
          Add To Cart
        </button>
      </div>
    </div>
  `;
};

const renderProducts = (products, selector) => {
	const grid = document.querySelector(selector);
	if (!grid) return;

	if (products.length === 0) {
		grid.innerHTML = '<p>No products available.</p>';
		return;
	}

	grid.innerHTML = products.map(createProductCard).join('');
};

const renderSelectedProducts = (products) => {
	const selectedProducts = filterProductsByBlock(products, 'Selected Products');
	renderProducts(selectedProducts, SELECTORS.selectedProducts);
};

const renderNewProducts = (products) => {
	const newProducts = filterProductsByBlock(products, 'New Products Arrival');
	renderProducts(newProducts, SELECTORS.newProducts);
};

// ============================================================================
// CART FUNCTIONALITY
// ============================================================================

let allProducts = [];

const initAddToCartButtons = () => {
	const buttons = document.querySelectorAll('.product-card__button');

	buttons.forEach((button) => {
		button.addEventListener('click', (e) => {
			const productId = e.target.getAttribute('data-id');
			addToCart(productId);
		});
	});
};

const addToCart = (productId) => {
	const product = allProducts.find((p) => p.id === productId);

	if (!product) {
		console.error('Product not found');
		console.log(
			'Available products:',
			allProducts.map((p) => p.id)
		);
		return;
	}

	CartManager.addToCart(product);
	showNotification(`${product.name} added to cart!`);
};

const showNotification = (message) => {
	const notification = document.createElement('div');
	notification.className = 'cart-notification';
	notification.textContent = message;
	notification.style.cssText = `
		position: fixed;
		top: 20px;
		right: 20px;
		background: #28a745;
		color: white;
		padding: 15px 25px;
		border-radius: 5px;
		box-shadow: 0 4px 6px rgba(0,0,0,0.1);
		z-index: 9999;
		animation: slideIn 0.3s ease;
	`;

	document.body.appendChild(notification);

	setTimeout(() => {
		notification.style.animation = 'slideOut 0.3s ease';
		setTimeout(() => notification.remove(), 300);
	}, 3000);
};

// ============================================================================
// INITIALIZATION & EXPORT
// ============================================================================

export const initHome = async () => {
	allProducts = await fetchProducts();

	renderSelectedProducts(allProducts);
	renderNewProducts(allProducts);
	initAddToCartButtons();

	initSuitcasesSlider();

	CartManager.updateCartCount();
};
