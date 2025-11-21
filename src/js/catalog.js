import {
	createCartHandler,
	showNotification,
	NotificationType,
	CONFIG as HOME_CONFIG,
} from './home.js';
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
	searchForm: '[data-js="search-form"]',
	dropdown: '.catalog__dropdown',
	dropdownBtn: '.catalog__dropdown-btn',
	dropdownItems: '.catalog__dropdown-item',
	navFilter: '.catalog__filter-btn',
	filtersBlock: '.catalog-filters',
	filterSelects: '.catalog-filters__select',
	salesCheckbox: '#sales-filter',
	hideBtn: '[data-action="hide"]',
	clearBtn: '[data-action="clear"]',
	addToCartButton: '.product-card__button',
	prevBtn: '.prev-btn',
	nextBtn: '.next-btn',
	catalogPage: '.catalog__page',
};

const CONFIG = {
	...HOME_CONFIG,
	DATA_URL: '../assets/data.json',
	ITEMS_PER_PAGE: 12,
	NOTIFICATION_DURATION_MS: 2000,
	ANIMATION_DURATION_MS: 100,
};

// const DATA_URL = '../assets/data.json';
// const ASSETS_PATH = '../assets/';

const CSS_CLASSES = {
	dropdownOpen: 'open',
	filtersHidden: 'is-hidden',
	paginationActive: 'is-active',
	paginationDisabled: 'is-disabled',
};

const SORT_TYPES = {
	DEFAULT: 'default',
	PRICE_ASC: 'price-asc',
	PRICE_DESC: 'price-desc',
	NEWEST: 'newest',
	SALE: 'sale',
	POPULARITY: 'popularity',
	RATING: 'rating',
};

const BLOCK_NAMES = {
	BEST_SETS: 'Top Best Sets',
};

// ============================================================================
// STATE
// ============================================================================

const catalogState = {
	allProducts: [],
	currentPage: 1,
	currentSortType: SORT_TYPES.DEFAULT,
	searchTerm: '',
	filters: {
		size: '',
		color: '',
		category: '',
		salesStatus: null,
	},
	isManuallyHidden: false,
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

const filterProductsByCategory = (products, category) => {
	return products.filter((product) => product.blocks.includes(category));
};

const filterProductsBySearch = (products, searchTerm) => {
	if (!searchTerm) return products;
	return products.filter((product) => {
		return product.name.toLowerCase().includes(searchTerm.toLowerCase());
	});
};

const isCatalogPage = () => window.location.pathname.includes('catalog.html');

// ============================================================================
// SORTING FUNCTIONALITY
// ============================================================================

const sortStrategies = {
	[SORT_TYPES.PRICE_ASC]: (a, b) => a.price - b.price,
	[SORT_TYPES.PRICE_DESC]: (a, b) => b.price - a.price,
	[SORT_TYPES.NEWEST]: (a, b) => b.id.localeCompare(a.id),
	[SORT_TYPES.SALE]: (a, b) => b.salesStatus - a.salesStatus,
	[SORT_TYPES.POPULARITY]: (a, b) => b.popularity - a.popularity,
	[SORT_TYPES.RATING]: (a, b) => b.rating - a.rating,
	[SORT_TYPES.DEFAULT]: () => 0,
};

const sortProducts = (products, sortType) => {
	const strategy =
		sortStrategies[sortType] || sortStrategies[SORT_TYPES.DEFAULT];
	return [...products].sort(strategy);
};

// ============================================================================
// FILTERING FUNCTIONALITY
// ============================================================================
const applyFiltersChain = (products) => {
	return products.filter((item) => {
		const { size, color, category, salesStatus } = catalogState.filters;

		const matchesSize = !size || item.size === size;
		const matchesColor = !color || item.color === color;
		const matchesCategory = !category || item.category === category;
		const matchesSales =
			salesStatus === null || item.salesStatus === salesStatus;

		return matchesSize && matchesColor && matchesCategory && matchesSales;
	});
};

const resetFilters = () => {
	catalogState.filters = {
		size: '',
		color: '',
		category: '',
		salesStatus: null,
	};
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

const renderProducts = (products) => {
	const productGrid = document.querySelector(SELECTORS.productGrid);
	if (!productGrid) return;

	if (products.length === 0) {
		productGrid.innerHTML = '<p>No products available.</p>';
		return;
	}

	productGrid.innerHTML = products.map(createProductCard).join('');
};

const renderBestSets = (bestSets) => {
	const sidebarBestSets = document.querySelector(SELECTORS.sidebarBestSets);
	if (!sidebarBestSets) return;

	sidebarBestSets.innerHTML = bestSets
		.map((product) => {
			return `
      <li class="widget-best__item">
        <a href="#" class="widget-best__link">
          <img class="widget-best__thumb" src="${CONFIG.ASSETS_PATH}${product.imageUrl}" alt="${product.name}">
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

const paginateProducts = (products, page = 1) => {
	const start = (page - 1) * CONFIG.ITEMS_PER_PAGE;
	const end = start + CONFIG.ITEMS_PER_PAGE;
	return products.slice(start, end);
};

const updateResultsText = (totalProducts, currentPage) => {
	const resultsTextElement = document.querySelector(SELECTORS.resultsText);
	if (!resultsTextElement) return;

	const start = (currentPage - 1) * CONFIG.ITEMS_PER_PAGE + 1;
	const end = Math.min(currentPage * CONFIG.ITEMS_PER_PAGE, totalProducts);
	resultsTextElement.textContent = `Showing ${start}–${end} of ${totalProducts} Results`;
};

// const renderPagination = (totalPages, currentPage) => {
// 	const paginationContainer = document.querySelector(SELECTORS.pagination);
// 	if (!paginationContainer) return;

// 	paginationContainer.innerHTML = '';

// 	const prevButton = document.createElement('a');
// 	prevButton.classList.add('catalog__page', 'prev-btn');
// 	prevButton.href = '#';
// 	prevButton.textContent = 'Prev';
// 	prevButton.addEventListener('click', (e) => {
// 		e.preventDefault();
// 		handlePageChange(currentPage - 1);
// 	});
// 	if (currentPage === 1) prevButton.classList.add('is-disabled');
// 	paginationContainer.appendChild(prevButton);

// 	const pageNumbersContainer = document.createElement('div');
// 	for (let i = 1; i <= totalPages; i++) {
// 		const pageButton = document.createElement('a');
// 		pageButton.classList.add('catalog__page');
// 		if (i === currentPage) pageButton.classList.add('is-active');
// 		pageButton.href = '#';
// 		pageButton.textContent = i;
// 		pageButton.addEventListener('click', (e) => {
// 			e.preventDefault();
// 			handlePageChange(i);
// 		});
// 		pageNumbersContainer.appendChild(pageButton);
// 	}
// 	paginationContainer.appendChild(pageNumbersContainer);

// 	const nextButton = document.createElement('a');
// 	nextButton.classList.add('catalog__page', 'next-btn');
// 	nextButton.href = '#';
// 	nextButton.textContent = 'Next';
// 	nextButton.addEventListener('click', (e) => {
// 		e.preventDefault();
// 		handlePageChange(currentPage + 1);
// 	});
// 	if (currentPage === totalPages) nextButton.classList.add('is-disabled');
// 	paginationContainer.appendChild(nextButton);
// };

const createPaginationButton = (
	text,
	page,
	isActive = false,
	isDisabled = false
) => {
	const button = document.createElement('a');
	button.classList.add(SELECTORS.catalogPage.substring(1));
	button.href = '#';
	button.textContent = text;

	if (isActive) button.classList.add(CSS_CLASSES.paginationActive);
	if (isDisabled) button.classList.add(CSS_CLASSES.paginationDisabled);

	button.addEventListener('click', (e) => {
		e.preventDefault();
		if (!isDisabled) {
			handlePageChange(page);
		}
	});

	return button;
};

const renderPagination = (totalPages, currentPage) => {
	const paginationContainer = document.querySelector(SELECTORS.pagination);
	if (!paginationContainer) return;

	paginationContainer.innerHTML = '';

	// Prev button
	const prevButton = createPaginationButton(
		'Prev',
		currentPage - 1,
		false,
		currentPage === 1
	);
	prevButton.classList.add('prev-btn');
	paginationContainer.appendChild(prevButton);

	// Page numbers
	const pageNumbersContainer = document.createElement('div');
	for (let i = 1; i <= totalPages; i++) {
		const pageButton = createPaginationButton(
			i.toString(),
			i,
			i === currentPage
		);
		pageNumbersContainer.appendChild(pageButton);
	}
	paginationContainer.appendChild(pageNumbersContainer);

	// Next button
	const nextButton = createPaginationButton(
		'Next',
		currentPage + 1,
		false,
		currentPage === totalPages
	);
	nextButton.classList.add('next-btn');
	paginationContainer.appendChild(nextButton);
};

const getProcessedProducts = () => {
	const bestSets = filterProductsByCategory(
		catalogState.allProducts,
		BLOCK_NAMES.BEST_SETS
	);
	const remainingProducts = catalogState.allProducts.filter(
		(product) => !product.blocks.includes(BLOCK_NAMES.BEST_SETS)
	);

	let processed = filterProductsBySearch(
		remainingProducts,
		catalogState.searchTerm
	);
	processed = applyFiltersChain(processed);
	processed = sortProducts(processed, catalogState.currentSortType);

	return { bestSets, processed };
};

const handlePageChange = (page) => {
	const { bestSets, processed } = getProcessedProducts();
	const totalPages = Math.ceil(processed.length / CONFIG.ITEMS_PER_PAGE);

	if (processed.length === 0) {
		showNotification('Product not found', NotificationType.ERROR);
	}

	if (page < 1 || page > totalPages) return;

	catalogState.currentPage = page;
	const paginatedProducts = paginateProducts(
		processed,
		catalogState.currentPage
	);

	updateResultsText(processed.length, catalogState.currentPage);
	renderBestSets(bestSets);
	renderProducts(paginatedProducts);
	renderPagination(totalPages, catalogState.currentPage);

	const cartHandler = createCartHandler(catalogState.allProducts);
	cartHandler.initButtons();
};

// ============================================================================
// SEARCH FUNCTIONALITY
// ============================================================================

const initSearch = () => {
	const searchForm = document.querySelector(SELECTORS.searchForm);
	if (!searchForm) return;

	const input = document.querySelector(SELECTORS.searchInput);

	searchForm.addEventListener('submit', (event) => {
		event.preventDefault();
		catalogState.searchTerm = input?.value.trim() || '';
		handlePageChange(1);
	});
};

// ============================================================================
// DROPDOWN FUNCTIONALITY
// ============================================================================

const initDropdown = () => {
	const dropdown = document.querySelector(SELECTORS.dropdown);
	if (!dropdown) return;

	const dropdownBtn = dropdown.querySelector(SELECTORS.dropdownBtn);
	const dropdownItems = dropdown.querySelectorAll(SELECTORS.dropdownItems);

	const toggleDropdown = (event) => {
		event.stopPropagation();
		dropdown.classList.toggle(CSS_CLASSES.dropdownOpen);
	};

	const closeDropdown = () => {
		dropdown.classList.remove(CSS_CLASSES.dropdownOpen);
	};

	const handleItemClick = (event, item) => {
		event.preventDefault();
		event.stopPropagation();

		closeDropdown();
		dropdownBtn.textContent = item.textContent;

		catalogState.currentSortType = item.dataset.value;
		handlePageChange(1);
	};
	dropdownBtn.addEventListener('click', toggleDropdown);

	dropdownItems.forEach((item) => {
		item.addEventListener('click', (event) => handleItemClick(event, item));
	});

	document.addEventListener('click', (event) => {
		if (!dropdown.contains(event.target)) {
			closeDropdown();
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
			const type = select.previousElementSibling?.textContent
				.trim()
				.toLowerCase();

			if (type === 'size') catalogState.filters.size = select.value;
			if (type === 'color') catalogState.filters.color = select.value;
			if (type === 'category') catalogState.filters.category = select.value;

			handlePageChange(1);
		});
	});

	if (salesCheckbox) {
		salesCheckbox.addEventListener('change', () => {
			catalogState.filters.salesStatus = salesCheckbox.checked ? true : null;
			handlePageChange(1);
		});
	}

	if (clearBtn) {
		clearBtn.addEventListener('click', () => {
			selects.forEach((select) => (select.value = ''));
			if (salesCheckbox) salesCheckbox.checked = false;

			resetFilters();
			handlePageChange(1);
		});
	}
};

// ============================================================================
// SHOW/HIDE FILTERS ON HOVER (catalog.html only)
// ============================================================================

const initCatalogFiltersShowHide = () => {
	if (!isCatalogPage()) return;

	const navFilter = document.querySelector(SELECTORS.navFilter);
	const filtersBlock = document.querySelector(SELECTORS.filtersBlock);
	const hideBtn = document.querySelector(SELECTORS.hideBtn);

	if (!navFilter || !filtersBlock || !hideBtn) return;

	filtersBlock.classList.add(CSS_CLASSES.filtersHidden);

	const showFilters = () => {
		if (!catalogState.isManuallyHidden) {
			filtersBlock.classList.remove(CSS_CLASSES.filtersHidden);
		}
	};

	const hideFilters = () => {
		catalogState.isManuallyHidden = true;
		filtersBlock.classList.add(CSS_CLASSES.filtersHidden);

		setTimeout(() => {
			catalogState.isManuallyHidden = false;
		}, 300);
	};

	navFilter.addEventListener('mouseenter', showFilters);
	filtersBlock.addEventListener('mouseenter', showFilters);
	hideBtn.addEventListener('click', hideFilters);
};

// ============================================================================
// INITIALIZATION
// ============================================================================

export const initCatalog = async () => {
	catalogState.allProducts = await fetchProducts();

	const bestSets = filterProductsByCategory(
		catalogState.allProducts,
		BLOCK_NAMES.BEST_SETS
	);
	const remainingProducts = catalogState.allProducts.filter(
		(product) => !product.blocks.includes(BLOCK_NAMES.BEST_SETS)
	);

	const totalPages = Math.ceil(
		remainingProducts.length / CONFIG.ITEMS_PER_PAGE
	);
	const paginatedProducts = paginateProducts(
		remainingProducts,
		catalogState.currentPage
	);

	renderBestSets(bestSets);
	renderProducts(paginatedProducts);
	renderPagination(totalPages, catalogState.currentPage);
	updateResultsText(remainingProducts.length, catalogState.currentPage);

	const cartHandler = createCartHandler(catalogState.allProducts);
	cartHandler.initButtons();

	initSearch();
	initDropdown();
	initCatalogFilters();
	initCatalogFiltersShowHide();

	CartManager.updateCartCount();
};
