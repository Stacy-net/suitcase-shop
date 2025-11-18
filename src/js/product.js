import {
	renderProducts,
	filterProductsByBlock,
	fetchProducts,
	initAddToCartButtons,
} from './home.js';
import { CartManager } from './cart.js';

const YOU_MAY_SELECTOR = '.like-products .selected-products__grid';
const ASSETS_PATH = '/assets/';

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
const renderProductDetails = (product) => {
	if (!product) {
		console.error('Product not found');
		document.querySelector('.product-details__container').innerHTML =
			'<p>Product not found. Please return to the catalog.</p>';
		return;
		return;
	}

	// Оновлюємо зображення
	const mainImage = document.querySelector('.product-gallery__main-image');
	if (mainImage) {
		mainImage.src = `${ASSETS_PATH}${product.imageUrl}`;
		mainImage.alt = product.name;
	}

	// Оновлюємо назву
	const productTitle = document.querySelector('.product-details__title');
	if (productTitle) {
		productTitle.textContent = product.name;
	}

	// Оновлюємо ціну
	const productPrice = document.querySelector('.product-details__price');
	if (productPrice) {
		productPrice.textContent = `$${product.price}`;
	}
	// 4. Оновлюємо рейтинг (якщо є в даних)

	const ratingStars = document.querySelector('.product-rating__stars');
	if (ratingStars && product.rating) {
		const fullStars = Math.floor(product.rating);
		const emptyStars = 5 - fullStars;
		ratingStars.textContent = '★'.repeat(fullStars) + '☆'.repeat(emptyStars);
	}

	document.title = `${product.name} - Product Card`;

	if (product.salesStatus) {
		const gallery = document.querySelector('.product-gallery__main');
		if (gallery && !gallery.querySelector('.product-card__status')) {
			const saleBadge = document.createElement('span');
			saleBadge.className = 'product-card__status btn btn--small';
			saleBadge.textContent = 'SALE';
			saleBadge.style.cssText = 'position: absolute; top: 10px; left: 10px;';
			gallery.style.position = 'relative';
			gallery.appendChild(saleBadge);
		}
	}

	initAddToCartButton(product);

	// Додаємо функціонал кнопки "Add to Cart"
	// const addToCartBtn = document.querySelector('.product-details__add-to-cart');
	// if (addToCartBtn) {
	// 	addToCartBtn.addEventListener('click', () => {
	// 		CartManager.addToCart(product);
	// 		showNotification(`${product.name} added to cart!`);
	// 	});
	// }
};

// ============================================================================
// PRODUCT TABS
// ============================================================================

const initProductTabs = () => {
	const tabs = document.querySelectorAll('.product-tabs__tab');
	const panels = document.querySelectorAll('.product-tabs__panel');

	tabs.forEach((tab) => {
		tab.addEventListener('click', () => {
			const targetPanel = tab.dataset.tab;

			// Remove active classes
			tabs.forEach((t) => t.classList.remove('product-tabs__tab--active'));
			panels.forEach((p) => p.classList.remove('product-tabs__panel--active'));

			// Add active classes
			tab.classList.add('product-tabs__tab--active');
			document
				.querySelector(`[data-panel="${targetPanel}"]`)
				.classList.add('product-tabs__panel--active');
		});
	});
};

// ============================================================================
// REVIEW FORM
// ============================================================================

const initReviewForm = () => {
	const form = document.querySelector('.review-form');
	if (!form) return;

	form.addEventListener('submit', (e) => {
		e.preventDefault();

		// Тут можна додати логіку відправки відгуку
		alert('Review submitted! (This is a demo)');
		form.reset();
	});

	const starInputs = form.querySelectorAll('.review-form__star-input');
	const starLabels = form.querySelectorAll('.review-form__star');

	starInputs.forEach((input, index) => {
		input.addEventListener('change', () => {
			starLabels.forEach((label, i) => {
				if (i <= index) {
					label.textContent = '★';
				} else {
					label.textContent = '☆';
				}
			});
		});
	});
};

// ============================================================================
// QUANTITY CONTROLS
// ============================================================================
const initQuantityControls = () => {
	const quantityInput = document.querySelector('.product-quantity__input');
	const minusBtn = document.querySelector('.product-quantity__btn--minus');
	const plusBtn = document.querySelector('.product-quantity__btn--plus');

	if (!quantityInput || !minusBtn || !plusBtn) return;

	minusBtn.addEventListener('click', () => {
		const currentValue = parseInt(quantityInput.value);
		const minValue = 1; // Мінімальне значення 1
		if (currentValue > minValue) {
			quantityInput.value = currentValue - 1;
		}
	});

	plusBtn.addEventListener('click', () => {
		const currentValue = parseInt(quantityInput.value);
		const maxValue = parseInt(quantityInput.max) || 99;
		if (currentValue < maxValue) {
			quantityInput.value = currentValue + 1;
		}
	});

	// Валідація вводу - мінімум 1
	quantityInput.addEventListener('input', () => {
		let value = parseInt(quantityInput.value);
		const minValue = 1;
		const maxValue = parseInt(quantityInput.max) || 99;

		if (isNaN(value) || value < minValue) {
			quantityInput.value = minValue;
		} else if (value > maxValue) {
			quantityInput.value = maxValue;
		}
	});

	// Якщо поле порожнє при втраті фокусу, встановлюємо 1
	quantityInput.addEventListener('blur', () => {
		if (!quantityInput.value || parseInt(quantityInput.value) < 1) {
			quantityInput.value = 1;
		}
	});
};

// ============================================================================
// CART FUNCTIONALITY
// ============================================================================
const initAddToCartButton = (product) => {
	const addToCartBtn = document.querySelector('.product-details__add-to-cart');
	if (!addToCartBtn) return;

	addToCartBtn.addEventListener('click', () => {
		const quantityInput = document.querySelector('.product-quantity__input');
		const quantity = quantityInput ? parseInt(quantityInput.value) : 1;

		// Додаємо товар до кошика вказану кількість разів
		for (let i = 0; i < quantity; i++) {
			CartManager.addToCart(product);
		}

		showNotification(`${product.name} (x${quantity}) added to cart!`);

		// Оновлюємо лічильник в header
		CartManager.updateCartCount();
	});
};

const showNotification = (message) => {
	const notification = document.createElement('div');
	notification.className = 'cart-notification';
	notification.textContent = message;
	notification.style.cssText = `
    position: fixed;
    top: 120px;
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
// INITIALIZATION
// ============================================================================

export const initProduct = async () => {
	const products = await fetchProducts();

	const productId = getProductIdFromURL();
	const currentProduct = getProductById(products, productId);

	renderProductDetails(currentProduct);

	const youMayProducts = filterProductsByBlock(products, 'You May Also Like');

	renderProducts(youMayProducts, YOU_MAY_SELECTOR);
	initProductTabs();
	initReviewForm();
	initAddToCartButtons();
	initQuantityControls();
	CartManager.updateCartCount();
};
