import { CartManager } from './cart.js';

// ============================================================================
// CONSTANTS
// ============================================================================

const SELECTORS = {
	slider: '[data-js="slider"]',
	card: '[data-js="card"]',
	selectedProducts: '.selected-products .selected-products__grid',
	newProducts: '.new-products .selected-products__grid',
	addToCartButton: '.product-card__button',
};

const CONFIG = {
	SLIDER_INTERVAL_MS: 4000,
	NOTIFICATION_DURATION_MS: 3000,
	ANIMATION_DURATION_MS: 300,
	DATA_URL: '/assets/data.json',
	ASSETS_PATH: '/assets/',
};

const NotificationType = {
	SUCCESS: 'success',
	ERROR: 'error',
	INFO: 'info',
};

const BLOCK_NAMES = {
	SELECTED: 'Selected Products',
	NEW_ARRIVAL: 'New Products Arrival',
};

// ============================================================================
// UTILITIES
// ============================================================================

const fetchProducts = async () => {
	try {
		const response = await fetch(CONFIG.DATA_URL);
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

const getSlidesToShow = () => {
	const width = window.innerWidth;

	if (width >= 1440) {
		return 4;
	} else if (width >= 768) {
		return 2;
	} else {
		return 1;
	}
};

const initSuitcasesSlider = () => {
	const slider = document.querySelector(SELECTORS.slider);
	if (!slider) return null;

	const cards = Array.from(slider.querySelectorAll(SELECTORS.card));
	if (!cards.length) return null;

	let isPaused = false;
	let slidesToShow = getSlidesToShow();

	const handleMouseEnter = () => {
		isPaused = true;
	};

	const handleMouseLeave = () => {
		isPaused = false;
	};

	cards.forEach((card) => {
		card.addEventListener('mouseenter', handleMouseEnter);
		card.addEventListener('mouseleave', handleMouseLeave);
	});

	const rotateCards = () => {
		if (isPaused) return;

		const firstCard = slider.querySelector(SELECTORS.card);
		if (firstCard) {
			slider.appendChild(firstCard);
		}
	};

	const updateSliderLayout = () => {
		slidesToShow = getSlidesToShow();
		const cardWidth = 100 / slidesToShow;
		slider.style.gridTemplateColumns = `repeat(${slidesToShow}, ${cardWidth}%)`;
	};

	const intervalId = setInterval(rotateCards, CONFIG.SLIDER_INTERVAL_MS);

	window.addEventListener('resize', updateSliderLayout);

	updateSliderLayout();

	return () => {
		clearInterval(intervalId);
		cards.forEach((card) => {
			card.removeEventListener('mouseenter', handleMouseEnter);
			card.removeEventListener('mouseleave', handleMouseLeave);
		});
		window.removeEventListener('resize', updateSliderLayout);
	};
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
			<a href="/html/product-card.html?id=${product.id}" class="product-card__link">
      	<div class="product-card__image">
      	  <img src="${CONFIG.ASSETS_PATH}${product.imageUrl}" alt="${product.name}">
      	  ${saleBadge}
      	</div>
				<h3 class="product-card__title">${product.name}</h3>
			</a>
      <div class="product-card__details">
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
	const selectedProducts = filterProductsByBlock(
		products,
		BLOCK_NAMES.SELECTED
	);
	renderProducts(selectedProducts, SELECTORS.selectedProducts);
};

const renderNewProducts = (products) => {
	const newProducts = filterProductsByBlock(products, BLOCK_NAMES.NEW_ARRIVAL);
	renderProducts(newProducts, SELECTORS.newProducts);
};

// ============================================================================
// CART FUNCTIONALITY
// ============================================================================

const createCartHandler = (products) => {
	const addToCart = (productId, quantity = 1) => {
		const product = products.find((p) => p.id === productId);

		if (!product) {
			showNotification('Product not found', NotificationType.ERROR);
			return;
		}

		CartManager.addToCart(product, quantity);

		const message =
			quantity > 1
				? `${quantity} × ${product.name} added to cart!`
				: `${product.name} added to cart!`;

		showNotification(message, NotificationType.SUCCESS);
	};

	const initButtons = () => {
		const buttons = document.querySelectorAll(SELECTORS.addToCartButton);

		buttons.forEach((button) => {
			button.addEventListener('click', (e) => {
				const productId = e.target.getAttribute('data-id');
				addToCart(productId);
			});
		});
	};

	return { initButtons, addToCart };
};

const showNotification = (message, type = NotificationType.SUCCESS) => {
	const notification = document.createElement('div');

	notification.className = `cart-notification cart-notification--${type}`;
	notification.textContent = message;

	document.body.appendChild(notification);

	setTimeout(() => {
		notification.classList.add('cart-notification--hiding');

		setTimeout(() => {
			notification.remove();
		}, CONFIG.ANIMATION_DURATION_MS);
	}, CONFIG.NOTIFICATION_DURATION_MS);
};

// ============================================================================
// INITIALIZATION & EXPORT
// ============================================================================

export const initHome = async () => {
	const products = await fetchProducts();

	renderSelectedProducts(products);
	renderNewProducts(products);

	const cartHandler = createCartHandler(products);
	cartHandler.initButtons();

	const cleanupSlider = initSuitcasesSlider();

	CartManager.updateCartCount();

	return () => {
		if (cleanupSlider) {
			cleanupSlider();
		}
	};
};

export {
	filterProductsByBlock,
	renderProducts,
	fetchProducts,
	createCartHandler,
	showNotification,
	NotificationType,
	CONFIG,
};
