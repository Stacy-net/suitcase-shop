import {
	renderProducts,
	filterProductsByBlock,
	fetchProducts,
	createCartHandler,
	showNotification,
	NotificationType,
	initAllMobileSliders,
	CONFIG as HOME_CONFIG,
} from './home.js';
import { CartManager } from './cart.js';

const SELECTORS = {
	youMayLike: '.like-products .selected-products__grid',
	productDetails: '.product-details__container',
	mainImage: '.product-gallery__main-image',
	productTitle: '.product-details__title',
	productPrice: '.product-details__price',
	ratingStars: '.product-rating__stars',
	gallery: '.product-gallery__main',
	saleBadge: '.product-card__status',
	addToCartBtn: '.product-details__add-to-cart',
	quantityInput: '.product-quantity__input',
	quantityMinus: '.product-quantity__btn--minus',
	quantityPlus: '.product-quantity__btn--plus',
	tabs: '.product-tabs__tab',
	tabPanels: '.product-tabs__panel',
	reviewForm: '.review-form',
	starInputs: '.review-form__star-input',
	starLabels: '.review-form__star',
};

const CONFIG = {
	...HOME_CONFIG,
	MIN_QUANTITY: 1,
	MAX_QUANTITY: 99,
	MAX_RATING_STARS: 5,
};

const BLOCK_NAMES = {
	YOU_MAY_LIKE: 'You May Also Like',
};

const CSS_CLASSES = {
	tabActive: 'product-tabs__tab--active',
	panelActive: 'product-tabs__panel--active',
	starActive: 'active',
};

const MESSAGES = {
	productNotFound: 'Product not found. Please return to the catalog.',
	reviewSubmitted: 'Review submitted!',
};

// ============================================================================
// GET PRODUCT FROM URL
// ============================================================================
const getProductIdFromURL = () => {
	const params = new URLSearchParams(window.location.search);
	return params.get('id');
};

const getProductById = (products, productId) => {
	return products.find((product) => product.id === productId);
};
// ============================================================================
// RENDER PRODUCT DETAILS
// ============================================================================

const updateProductImage = (product) => {
	const mainImage = document.querySelector(SELECTORS.mainImage);
	if (mainImage) {
		mainImage.src = `${CONFIG.ASSETS_PATH}${product.imageUrl}`;
		mainImage.alt = product.name;
	}
};

const updateProductInfo = (product) => {
	const productTitle = document.querySelector(SELECTORS.productTitle);
	if (productTitle) {
		productTitle.textContent = product.name;
	}

	const productPrice = document.querySelector(SELECTORS.productPrice);
	if (productPrice) {
		productPrice.textContent = `$${product.price}`;
	}

	document.title = `${product.name} - Product Card`;
};

const updateProductRating = (product) => {
	const ratingStars = document.querySelector(SELECTORS.ratingStars);
	if (ratingStars && product.rating) {
		const fullStars = Math.floor(product.rating);
		const emptyStars = CONFIG.MAX_RATING_STARS - fullStars;
		ratingStars.textContent = '★'.repeat(fullStars) + '☆'.repeat(emptyStars);
	}
};

const addSaleBadge = (product) => {
	if (!product.salesStatus) return;

	const gallery = document.querySelector(SELECTORS.gallery);
	if (gallery && !gallery.querySelector(SELECTORS.saleBadge)) {
		const saleBadge = document.createElement('span');
		saleBadge.className = 'product-card__status btn btn--small';
		saleBadge.textContent = 'SALE';
		gallery.appendChild(saleBadge);
	}
};

const showProductNotFound = () => {
	const container = document.querySelector(SELECTORS.productDetails);
	if (container) {
		container.innerHTML = `<p>${MESSAGES.productNotFound}</p>`;
	}
	showNotification(MESSAGES.productNotFound, NotificationType.ERROR);
};

const renderProductDetails = (product, addToCartFn) => {
	if (!product) {
		showProductNotFound();
		return;
	}

	updateProductImage(product);
	updateProductInfo(product);
	updateProductRating(product);
	addSaleBadge(product);

	initAddToCartButton(product, addToCartFn);
};
// ============================================================================
// PRODUCT TABS
// ============================================================================

const initProductTabs = () => {
	const tabs = document.querySelectorAll(SELECTORS.tabs);
	const panels = document.querySelectorAll(SELECTORS.tabPanels);

	tabs.forEach((tab) => {
		tab.addEventListener('click', () => {
			const targetPanel = tab.dataset.tab;

			tabs.forEach((t) => t.classList.remove(CSS_CLASSES.tabActive));
			panels.forEach((p) => p.classList.remove(CSS_CLASSES.panelActive));

			tab.classList.add(CSS_CLASSES.tabActive);
			document
				.querySelector(`[data-panel="${targetPanel}"]`)
				.classList.add(CSS_CLASSES.panelActive);
		});
	});
};

// ============================================================================
// REVIEW FORM
// ============================================================================

const resetStarRating = (starLabels) => {
	starLabels.forEach((label) => label.classList.remove(CSS_CLASSES.starActive));
};

const updateStarRating = (starLabels, selectedIndex) => {
	starLabels.forEach((label, labelIndex) => {
		if (labelIndex <= selectedIndex) {
			label.classList.add(CSS_CLASSES.starActive);
		} else {
			label.classList.remove(CSS_CLASSES.starActive);
		}
	});
};

const initReviewForm = () => {
	const form = document.querySelector(SELECTORS.reviewForm);
	if (!form) return;

	const starInputs = form.querySelectorAll(SELECTORS.starInputs);
	const starLabels = form.querySelectorAll(SELECTORS.starLabels);

	form.addEventListener('submit', (e) => {
		e.preventDefault();
		showNotification(MESSAGES.reviewSubmitted, NotificationType.INFO);
		form.reset();
		resetStarRating(starLabels);
	});

	starInputs.forEach((input, index) => {
		input.addEventListener('change', () => {
			updateStarRating(starLabels, index);
			starInputs[index].checked = true;
		});
	});
};

// ============================================================================
// QUANTITY CONTROLS
// ============================================================================

const getQuantityValue = (input) =>
	parseInt(input.value) || CONFIG.MIN_QUANTITY;

const initQuantityControls = () => {
	const quantityInput = document.querySelector(SELECTORS.quantityInput);
	const minusBtn = document.querySelector(SELECTORS.quantityMinus);
	const plusBtn = document.querySelector(SELECTORS.quantityPlus);

	if (!quantityInput || !minusBtn || !plusBtn) return;

	minusBtn.addEventListener('click', () => {
		const currentValue = getQuantityValue(quantityInput);
		if (currentValue > CONFIG.MIN_QUANTITY) {
			quantityInput.value = currentValue - 1;
		}
	});

	plusBtn.addEventListener('click', () => {
		const currentValue = getQuantityValue(quantityInput);
		if (currentValue < CONFIG.MAX_QUANTITY) {
			quantityInput.value = currentValue + 1;
		}
	});

	quantityInput.addEventListener('input', () => {
		const value = parseInt(quantityInput.value);

		if (isNaN(value) || value < CONFIG.MIN_QUANTITY) {
			quantityInput.value = CONFIG.MIN_QUANTITY;
		} else if (value > CONFIG.MAX_QUANTITY) {
			quantityInput.value = CONFIG.MAX_QUANTITY;
		}
	});

	quantityInput.addEventListener('blur', () => {
		if (
			!quantityInput.value ||
			getQuantityValue(quantityInput) < CONFIG.MIN_QUANTITY
		) {
			quantityInput.value = CONFIG.MIN_QUANTITY;
		}
	});
};

// ============================================================================
// CART FUNCTIONALITY
// ============================================================================
const initAddToCartButton = (product, addToCartFn) => {
	const addToCartBtn = document.querySelector(SELECTORS.addToCartBtn);
	if (!addToCartBtn) return;

	addToCartBtn.addEventListener('click', () => {
		const quantityInput = document.querySelector(SELECTORS.quantityInput);
		const quantity = quantityInput ? getQuantityValue(quantityInput) : 1;

		addToCartFn(product.id, quantity);
	});
};

// ============================================================================
// INIT "YOU MAY ALSO LIKE" AS MOBILE SLIDER
// ============================================================================

const initYouMayAlsoLike = (products) => {
	const youMayProducts = filterProductsByBlock(
		products,
		BLOCK_NAMES.YOU_MAY_LIKE
	);

	// Відрендерити продукти
	renderProducts(youMayProducts, SELECTORS.youMayLike);

	// Ініціалізувати mobile slider
	initAllMobileSliders();

	// Підключити addToCart кнопки
	const cartHandler = createCartHandler(products);
	cartHandler.initButtons();
};

// ============================================================================
// INITIALIZATION
// ============================================================================

export const initProduct = async () => {
	const products = await fetchProducts();

	const productId = getProductIdFromURL();
	const currentProduct = getProductById(products, productId);

	const cartHandler = createCartHandler(products);

	renderProductDetails(currentProduct, cartHandler.addToCart);

	initYouMayAlsoLike(products);

	cartHandler.initButtons();

	initProductTabs();
	initReviewForm();
	initQuantityControls();

	CartManager.updateCartCount();
};
