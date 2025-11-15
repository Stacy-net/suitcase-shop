import { CartManager } from './cart.js';

// ============================================================================
// CONSTANTS
// ============================================================================

const SELECTORS = {
	productGrid: '.catalog__grid',
	pagination: '.catalog__pagination',
	sidebarBestSets: '.widget-best__list',
	resultsText: '.catalog__results',
	searchInput: '#search-input',
	dropdown: '.catalog__dropdown',
	dropdownBtn: '.catalog__dropdown-btn',
	dropdownItems: '.catalog__dropdown-item',
};

const DATA_URL = '../assets/data.json';
const ASSETS_PATH = '../assets/';

// ============================================================================
// STATE
// ============================================================================

let allProducts = [];
let currentPage = 1;
let currentSortType = 'default';

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

const filterProductsByCategory = (products, category) => {
	return products.filter((product) => product.blocks.includes(category));
};

const filterProductsBySearch = (products, searchTerm) => {
	if (!searchTerm) return products;
	return products.filter((product) => {
		return product.name.toLowerCase().includes(searchTerm.toLowerCase());
	});
};

// ============================================================================
// SORTING FUNCTIONALITY
// ============================================================================

const sortProducts = (products, sortType) => {
	const sorted = [...products];

	switch (sortType) {
		case 'price-asc':
			return sorted.sort((a, b) => a.price - b.price);

		case 'price-desc':
			return sorted.sort((a, b) => b.price - a.price);

		case 'newest':
			return sorted.sort((a, b) => b.id.localeCompare(a.id));

		case 'sale':
			return sorted.sort((a, b) => b.salesStatus - a.salesStatus);

		case 'popularity':
			return sorted.sort((a, b) => b.popularity - a.popularity);

		case 'rating':
			return sorted.sort((a, b) => b.rating - a.rating);

		default:
			return sorted;
	}
};

// ============================================================================
// RENDER FUNCTIONS
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

const renderProducts = (products) => {
	const productGrid = document.querySelector(SELECTORS.productGrid);
	if (!productGrid) return;

	if (products.length === 0) {
		productGrid.innerHTML = '<p>No products available.</p>';
		return;
	}

	productGrid.innerHTML = products.map(createProductCard).join('');
	initAddToCartButtons();
};

const renderBestSets = (bestSets) => {
	const sidebarBestSets = document.querySelector(SELECTORS.sidebarBestSets);
	if (!sidebarBestSets) return;

	sidebarBestSets.innerHTML = bestSets
		.map((product) => {
			return `
      <li class="widget-best__item">
        <a href="#" class="widget-best__link">
          <img class="widget-best__thumb" src="${ASSETS_PATH}${product.imageUrl}" alt="${product.name}">
          <div class="widget-best__meta">
            <div class="widget-best__name">${product.name}</div>
            <div class="widget-best__rating" aria-label="4 out of 5">
              <span>★★★★★</span>
            </div>
            <div class="widget-best__price">$${product.price}</div>
          </div>
        </a>
      </li>
    `;
		})
		.join('');
};

const paginateProducts = (products, page = 1, pageSize = 12) => {
	const start = (page - 1) * pageSize;
	const end = start + pageSize;
	return products.slice(start, end);
};

const updateResultsText = (totalProducts, currentPage, pageSize) => {
	const resultsTextElement = document.querySelector(SELECTORS.resultsText);
	if (!resultsTextElement) return;

	const start = (currentPage - 1) * pageSize + 1;
	const end = Math.min(currentPage * pageSize, totalProducts);
	resultsTextElement.textContent = `Showing ${start}–${end} of ${totalProducts} Results`;
};

const renderPagination = (totalPages, currentPage) => {
	const paginationContainer = document.querySelector(SELECTORS.pagination);
	if (!paginationContainer) return;

	paginationContainer.innerHTML = '';

	const prevButton = document.createElement('a');
	prevButton.classList.add('catalog__page', 'prev-btn');
	prevButton.href = '#';
	prevButton.textContent = 'Prev';
	prevButton.addEventListener('click', (e) => {
		e.preventDefault();
		handlePageChange(currentPage - 1);
	});
	if (currentPage === 1) prevButton.classList.add('is-disabled');
	paginationContainer.appendChild(prevButton);

	const pageNumbersContainer = document.createElement('div');
	for (let i = 1; i <= totalPages; i++) {
		const pageButton = document.createElement('a');
		pageButton.classList.add('catalog__page');
		if (i === currentPage) pageButton.classList.add('is-active');
		pageButton.href = '#';
		pageButton.textContent = i;
		pageButton.addEventListener('click', (e) => {
			e.preventDefault();
			handlePageChange(i);
		});
		pageNumbersContainer.appendChild(pageButton);
	}
	paginationContainer.appendChild(pageNumbersContainer);

	const nextButton = document.createElement('a');
	nextButton.classList.add('catalog__page', 'next-btn');
	nextButton.href = '#';
	nextButton.textContent = 'Next';
	nextButton.addEventListener('click', (e) => {
		e.preventDefault();
		handlePageChange(currentPage + 1);
	});
	if (currentPage === totalPages) nextButton.classList.add('is-disabled');
	paginationContainer.appendChild(nextButton);
};

const handlePageChange = async (page) => {
	const bestSets = filterProductsByCategory(allProducts, 'Top Best Sets');
	const remainingProducts = allProducts.filter(
		(product) => !product.blocks.includes('Top Best Sets')
	);

	// Застосовуємо сортування
	const sortedProducts = sortProducts(remainingProducts, currentSortType);

	const totalPages = Math.ceil(sortedProducts.length / 12);

	if (page < 1 || page > totalPages) return;

	currentPage = page;
	const paginatedProducts = paginateProducts(sortedProducts, currentPage);

	updateResultsText(sortedProducts.length, currentPage, 12);
	renderBestSets(bestSets);
	renderProducts(paginatedProducts);
	renderPagination(totalPages, currentPage);
};

// ============================================================================
// SEARCH FUNCTIONALITY
// ============================================================================

const initSearch = () => {
	const searchForm = document.querySelector('[data-js="search-form"]');
	if (!searchForm) return;

	searchForm.addEventListener('submit', (event) => {
		event.preventDefault();
		handlePageChange(1);
	});
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
	const product = allProducts.find((p) => p.id === productId);

	if (!product) {
		console.error('Product not found');
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
// DROPDOWN FUNCTIONALITY
// ============================================================================

const initDropdown = () => {
	const dropdown = document.querySelector(SELECTORS.dropdown);
	if (!dropdown) return;

	const dropdownBtn = dropdown.querySelector(SELECTORS.dropdownBtn);
	const dropdownItems = dropdown.querySelectorAll(SELECTORS.dropdownItems);

	// Відкриваємо/закриваємо список при натисканні на кнопку
	dropdownBtn.addEventListener('click', (event) => {
		event.stopPropagation();
		dropdown.classList.toggle('open');
	});

	// Закриваємо список при виборі елемента
	dropdownItems.forEach((item) => {
		item.addEventListener('click', (event) => {
			event.preventDefault();
			event.stopPropagation();
			dropdown.classList.remove('open');
			dropdownBtn.textContent = item.textContent;

			// Отримуємо тип сортування і застосовуємо його
			currentSortType = item.dataset.value;
			currentPage = 1; // Скидаємо на першу сторінку
			handlePageChange(1);
		});
	});

	document.addEventListener('click', (event) => {
		if (!dropdown.contains(event.target)) {
			dropdown.classList.remove('open');
		}
	});
};

// ============================================================================
// INITIALIZATION
// ============================================================================

export const initCatalog = async () => {
	allProducts = await fetchProducts();

	const bestSets = filterProductsByCategory(allProducts, 'Top Best Sets');
	const remainingProducts = allProducts.filter(
		(product) => !product.blocks.includes('Top Best Sets')
	);

	const totalPages = Math.ceil(remainingProducts.length / 12);
	const paginatedProducts = paginateProducts(remainingProducts, currentPage);

	renderBestSets(bestSets);
	renderProducts(paginatedProducts);
	renderPagination(totalPages, currentPage);
	updateResultsText(remainingProducts.length, currentPage, 12);
	initSearch();
	initDropdown();

	CartManager.updateCartCount();
};
