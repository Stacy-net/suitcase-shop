import { CartManager } from './cart.js';

// ============================================================================
// CONSTANTS
// ============================================================================

const SELECTORS = {
	slider: '[data-js="slider"]',
	card: '[data-js="card"]',
	productGrids: '.selected-products__grid',
	addToCartButton: '.product-card__button',
};

const CONFIG = {
	SLIDER_INTERVAL_MS: 4000,
	NOTIFICATION_DURATION_MS: 3000,
	ANIMATION_DURATION_MS: 300,
	SLIDER_TRANSITION_MS: 500,
	DATA_URL: '/assets/data.json',
	ASSETS_PATH: '/assets/',
	SLIDER_BREAKPOINT: 1400,
	MIN_CARD_WIDTH: 280,
	CARD_GAP: 20,
	RESIZE_DEBOUNCE_MS: 250,
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

const CSS_CLASSES = {
	wrapper: 'selected-products__wrapper',
	sliderDots: 'slider-dots',
	sliderDot: 'slider-dot',
	sliderDotActive: 'slider-dot--active',
	productCard: 'product-card',
	notificationHiding: 'cart-notification--hiding',
	sliderTransition: 'slider-transition',
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
	} catch {
		showNotification(
			'Failed to load products. Please refresh the page.',
			NotificationType.ERROR
		);
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
	let isTransitioning = false;

	// let slidesToShow = getSlidesToShow();

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
		if (isPaused || isTransitioning) return;

		const firstCard = slider.querySelector(SELECTORS.card);
		if (!firstCard) return;

		isTransitioning = true;
		slider.classList.add(CSS_CLASSES.sliderTransition);

		setTimeout(() => {
			slider.appendChild(firstCard);
			slider.classList.remove(CSS_CLASSES.sliderTransition);
			isTransitioning = false;
		}, CONFIG.SLIDER_TRANSITION_MS);
	};

	const updateSliderLayout = () => {
		const slidesToShow = getSlidesToShow();
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

const initAllProductGrids = (allProducts) => {
	const gridsConfig = [
		{
			selector: '.selected-products .selected-products__grid',
			blockName: BLOCK_NAMES.SELECTED,
		},
		{
			selector: '.new-products .selected-products__grid',
			blockName: BLOCK_NAMES.NEW_ARRIVAL,
		},
	];

	gridsConfig.forEach(({ selector, blockName }) => {
		const products = filterProductsByBlock(allProducts, blockName);
		renderProducts(products, selector);
	});
};

// ============================================================================
// MOBILE SLIDER
// ============================================================================

const shouldShowSlider = (grid) => {
	const cards = grid.querySelectorAll(`.${CSS_CLASSES.productCard}`);
	const cardCount = cards.length;

	if (cardCount === 0) return false;

	if (window.innerWidth >= CONFIG.MOBILE_SLIDER_BREAKPOINT) return false;

	const containerWidth = grid.parentElement?.offsetWidth || window.innerWidth;

	const cardsPerRow = Math.floor(
		(containerWidth + CONFIG.CARD_GAP) /
			(CONFIG.MIN_CARD_WIDTH + CONFIG.CARD_GAP)
	);

	return cardCount > cardsPerRow;
};

const initMobileSlider = (grid) => {
	if (!grid) return null;

	const cards = Array.from(
		grid.querySelectorAll(`.${CSS_CLASSES.productCard}`)
	);
	if (cards.length === 0) return null;

	if (!shouldShowSlider(grid)) {
		const existingWrapper = grid.closest(`.${CSS_CLASSES.wrapper}`);
		if (existingWrapper) {
			existingWrapper.replaceWith(grid);
		}
		return null;
	}

	if (grid.closest(`.${CSS_CLASSES.wrapper}`)) return null;

	const wrapper = document.createElement('div');
	wrapper.className = CSS_CLASSES.wrapper;
	grid.parentNode.insertBefore(wrapper, grid);
	wrapper.appendChild(grid);

	const dotsContainer = document.createElement('div');
	dotsContainer.className = CSS_CLASSES.sliderDots;

	cards.forEach((_, index) => {
		const dot = document.createElement('button');
		dot.className = `${CSS_CLASSES.sliderDot} ${
			index === 0 ? CSS_CLASSES.sliderDotActive : ''
		}`;
		dot.setAttribute('aria-label', `Go to slide ${index + 1}`);
		dot.addEventListener('click', () => {
			cards[index].scrollIntoView({ behavior: 'smooth', inline: 'start' });
		});
		dotsContainer.appendChild(dot);
	});

	wrapper.appendChild(dotsContainer);

	const updateActiveDot = () => {
		const scrollLeft = grid.scrollLeft;
		const totalScrollWidth = grid.scrollWidth - grid.offsetWidth;
		const cardsCount = cards.length;

		const activeIndex = Math.round(
			(scrollLeft / totalScrollWidth) * (cardsCount - 1)
		);

		dotsContainer
			.querySelectorAll(`.${CSS_CLASSES.sliderDot}`)
			.forEach((dot, index) => {
				dot.classList.toggle(
					CSS_CLASSES.sliderDotActive,
					index === activeIndex
				);
			});
	};

	grid.addEventListener('scroll', updateActiveDot, { passive: true });

	return () => {
		grid.removeEventListener('scroll', updateActiveDot);
		if (wrapper.parentNode) {
			wrapper.replaceWith(grid);
		}
	};
};

const initAllMobileSliders = () => {
	let cleanupFunctions = [];

	const reinitSliders = () => {
		cleanupFunctions.forEach((fn) => fn());
		cleanupFunctions = [];

		document.querySelectorAll(SELECTORS.productGrids).forEach((grid) => {
			const cleanup = initMobileSlider(grid);
			if (cleanup) cleanupFunctions.push(cleanup);
		});
	};

	reinitSliders();

	let resizeTimeout;
	const handleResize = () => {
		clearTimeout(resizeTimeout);
		resizeTimeout = setTimeout(() => {
			reinitSliders();
		}, CONFIG.RESIZE_DEBOUNCE_MS);
	};

	window.addEventListener('resize', handleResize);

	return () => {
		clearTimeout(resizeTimeout);
		cleanupFunctions.forEach((fn) => fn());
		window.removeEventListener('resize', handleResize);
	};
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

	initAllProductGrids(products);

	const cartHandler = createCartHandler(products);
	cartHandler.initButtons();

	const cleanupSuitcasesSlider = initSuitcasesSlider();
	const cleanupMobileSliders = initAllMobileSliders();

	CartManager.updateCartCount();

	return () => {
		if (cleanupSuitcasesSlider) cleanupSuitcasesSlider();
		if (cleanupMobileSliders) cleanupMobileSliders();
	};
};

export {
	filterProductsByBlock,
	renderProducts,
	fetchProducts,
	createCartHandler,
	showNotification,
	NotificationType,
	initAllMobileSliders,
	CONFIG,
};
