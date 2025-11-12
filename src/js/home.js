// ============================================================================
// CONSTANTS
// ============================================================================

const SELECTORS = {
	slider: '[data-js="slider"]',
	card: '[data-js="card"]',
	selectedProducts: '.selected-products .selected-products__grid',
	newProducts: '.new-products .selected-products__grid',
};

const RANDOM_TEXTS = [
	'Discover the perfect travel companion for your next adventure.',
	'Premium quality meets exceptional design in every detail.',
	// ... інші тексти
];

const DATA_URL = '../assets/data.json';
const ASSETS_PATH = './assets/';

// ============================================================================
// UTILITIES
// ============================================================================

const getRandomText = () => {
	const index = Math.floor(Math.random() * RANDOM_TEXTS.length);
	return RANDOM_TEXTS[index];
};

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

	const cards = slider.querySelectorAll(SELECTORS.card);
	if (!cards.length) return;

	cards.forEach((card) => {
		const randomTextEl = card.querySelector(SELECTORS.randomText);
		if (randomTextEl) {
			randomTextEl.textContent = getRandomText();
		}
	});
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
	console.log(`Adding product ${productId} to cart`);
	// Тут буде логіка додавання в кошик
	alert(`Product ${productId} added to cart!`);
};

// ============================================================================
// INITIALIZATION & EXPORT
// ============================================================================

export const initHome = async () => {
	const products = await fetchProducts();

	renderSelectedProducts(products);
	renderNewProducts(products);
	initAddToCartButtons();

	initSuitcasesSlider();
};
