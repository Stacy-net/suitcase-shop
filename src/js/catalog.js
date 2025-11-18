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
	navCatalog: '.nav__item--dropdown',
	filtersBlock: '.catalog-filters',
	hideBtn: '[data-action="hide"]',
};

const DATA_URL = '../assets/data.json';
const ASSETS_PATH = '../assets/';

// ============================================================================
// STATE
// ============================================================================

let allProducts = [];
let currentPage = 1;
let currentSortType = 'default';
let searchTerm = '';

let filters = {
	size: '',
	color: '',
	category: '',
	salesStatus: null,
};

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
// FILTERING FUNCTIONALITY
// ============================================================================
const applyFiltersChain = (products) => {
	return products.filter((item) => {
		const matchesSize = !filters.size || item.size === filters.size;
		const matchesColor = !filters.color || item.color === filters.color;
		const matchesCategory =
			!filters.category || item.category === filters.category;
		const matchesSales =
			filters.salesStatus === null || item.salesStatus === filters.salesStatus;

		return matchesSize && matchesColor && matchesCategory && matchesSales;
	});
};

// ============================================================================
// RENDER FUNCTIONS
// ============================================================================

const createProductCard = (product) => {
	const saleBadge = product.salesStatus
		? '<span class="product-card__status btn btn--small">SALE</span>'
		: '';

	return `
    <a href="/html/product-card.html?id=${product.id}" class="product-card" data-id="${product.id}">
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
    </a>
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
	// const sortedProducts = sortProducts(remainingProducts, currentSortType);
	let processed = filterProductsBySearch(remainingProducts, searchTerm);
	processed = applyFiltersChain(processed);
	processed = sortProducts(processed, currentSortType);

	const totalPages = Math.ceil(processed.length / 12);

	if (processed.length === 0) {
		showNotFoundPopup();
	}

	if (page < 1 || page > totalPages) return;

	currentPage = page;
	const paginatedProducts = paginateProducts(processed, currentPage);

	updateResultsText(processed.length, currentPage, 12);
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

	const input = document.querySelector(SELECTORS.searchInput);

	searchForm.addEventListener('submit', (event) => {
		event.preventDefault();
		searchTerm = input.value.trim();
		handlePageChange(1);
	});
};

const showNotFoundPopup = () => {
	const popup = document.createElement('div');
	popup.className = 'cart-notification';
	popup.textContent = 'Product not found';
	popup.style.cssText = `
		position: fixed;
		top: 120px;
		right: 20px;
		background: #dc3545;
		color: white;
		padding: 15px 25px;
		border-radius: 5px;
		box-shadow: 0 4px 6px rgba(0,0,0,0.1);
		z-index: 9999;
		animation: slideIn 0.3s ease;
	`;

	document.body.appendChild(popup);

	setTimeout(() => {
		popup.style.animation = 'slideOut 0.3s ease';
		setTimeout(() => popup.remove(), 100);
	}, 2000);
};

// ============================================================================
// CART FUNCTIONALITY
// ============================================================================

const initAddToCartButtons = () => {
	const buttons = document.querySelectorAll('.product-card__button');

	buttons.forEach((button) => {
		button.addEventListener('click', (e) => {
			e.preventDefault();
			e.stopPropagation();
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
		setTimeout(() => notification.remove(), 100);
	}, 2000);
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
// FILTER SELECTS + CHECKBOX
// ============================================================================
const initCatalogFilters = () => {
	const selects = document.querySelectorAll('.catalog-filters__select');
	const salesCheckbox = document.querySelector('#sales-filter');
	const clearBtn = document.querySelector('[data-action="clear"]');

	if (!selects.length) return;

	selects.forEach((select) => {
		select.addEventListener('change', () => {
			const type = select.previousElementSibling.textContent
				.trim()
				.toLowerCase();

			if (type === 'size') filters.size = select.value;
			if (type === 'color') filters.color = select.value;
			if (type === 'category') filters.category = select.value;

			handlePageChange(1);
		});
	});

	if (salesCheckbox) {
		salesCheckbox.addEventListener('change', () => {
			filters.salesStatus = salesCheckbox.checked ? true : null;
			handlePageChange(1);
		});
	}

	if (clearBtn) {
		clearBtn.addEventListener('click', () => {
			selects.forEach((select) => (select.value = ''));
			if (salesCheckbox) salesCheckbox.checked = false;

			filters = {
				size: '',
				color: '',
				category: '',
				salesStatus: null,
			};

			handlePageChange(1);
		});
	}
};

// ============================================================================
// SHOW/HIDE FILTERS ON HOVER (catalog.html only)
// ============================================================================

const initCatalogFiltersShowHide = () => {
	// Працюємо тільки на сторінці catalog.html
	if (!window.location.pathname.includes('catalog.html')) return;

	const navCatalog = document.querySelector(SELECTORS.navCatalog);
	const filtersBlock = document.querySelector(SELECTORS.filtersBlock);
	const hideBtn = document.querySelector(SELECTORS.hideBtn);

	if (!navCatalog || !filtersBlock || !hideBtn) return;

	let isManuallyHidden = false;

	// Старт: приховано
	filtersBlock.classList.add('is-hidden');

	// Показуємо по hover на Catalog
	navCatalog.addEventListener('mouseenter', () => {
		if (!isManuallyHidden) {
			filtersBlock.classList.remove('is-hidden');
		}
	});

	// Якщо миша переходить на сам блок фільтрів — НЕ ховаємо
	filtersBlock.addEventListener('mouseenter', () => {
		if (!isManuallyHidden) {
			filtersBlock.classList.remove('is-hidden');
		}
	});

	// Hide button — ховає фільтри повністю, поки користувач не наведе знову на Catalog
	hideBtn.addEventListener('click', () => {
		isManuallyHidden = true;
		filtersBlock.classList.add('is-hidden');

		// Повернути показ при наступному hover
		setTimeout(() => {
			isManuallyHidden = false;
		}, 300);
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
	initCatalogFilters();
	initCatalogFiltersShowHide();

	CartManager.updateCartCount();
};
