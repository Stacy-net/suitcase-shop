import { initHome } from './home.js';
import { initCart } from './cart.js';
import { initAbout } from './about.js';
import { initCatalog } from './catalog.js';
import { initProduct } from './product.js';
import { initContactForm } from './contact.js';

// ============================================================================
// CONSTANTS
// ============================================================================

const SELECTORS = {
	rootHeader: '#header',
	rootFooter: '#footer',
	navLink: '.nav__link',
	dropdownItem: '.nav__item--dropdown',
};

const CLASSES = {
	navLinkActive: 'nav__link--active',
};

const ATTR = {
	ariaExpanded: 'aria-expanded',
};

// ============================================================================
// PATH UTILITIES
// ============================================================================

const getBasePath = () => {
	const { pathname } = window.location;
	return pathname.includes('/html/') ? '../' : './';
};

const buildPath = (relativePath) => {
	const base = getBasePath();

	if (relativePath === '/' || relativePath === '') {
		return base === '../' ? '../index.html' : './index.html';
	}

	if (relativePath.startsWith('html/')) {
		return base === '../' ? relativePath.replace('html/', '') : relativePath;
	}

	return base + relativePath;
};

const normalizePathname = (rawHref) => {
	try {
		const url = new URL(rawHref, location.origin);
		return url.pathname.replace(/\/+$/, '') || '/';
	} catch {
		return rawHref;
	}
};

const getCurrentPathname = () => normalizePathname(location.pathname);

// ============================================================================
// ASSET UTILITIES
// ============================================================================

const ASSETS_BASE_URL = new URL('../assets/', import.meta.url);
const ASSET = (relPath) => new URL(relPath, ASSETS_BASE_URL).pathname;

// ============================================================================
// TEMPLATES
// ============================================================================

const HEADER_TEMPLATE = `
  <div class="header__wrapper">
    <div class="header__top">
      <div class="header__socials">
        <a href="#" class="social-link" aria-label="Facebook">
          <img src="${ASSET('images/icons/facebook.svg')}" alt="Facebook">
        </a>
        <a href="#" class="social-link" aria-label="Twitter">
          <img src="${ASSET('images/icons/twitter.svg')}" alt="Twitter">
        </a>
        <a href="#" class="social-link" aria-label="Instagram">
          <img src="${ASSET('images/icons/instagram.svg')}" alt="Instagram">
        </a>
      </div>

      <a href="${buildPath('/')}">
        <div class="header__logo">
          <div class="header__logo-image">
            <img src="${ASSET(
							'images/icons/suitcase.svg'
						)}" alt="Best Shop logo" class="header__logo-icon">
          </div>
          <div class="header__logo-title">BEST SHOP</div>
        </div>
      </a>

      <div class="header__actions">
        <button id="user-icon" class="header__action" aria-label="User account">
          <img src="${ASSET('images/icons/user.svg')}" alt="User">
        </button>
        <a href="${buildPath(
					'html/cart.html'
				)}" class="header__action" aria-label="Shopping cart">
          <img src="${ASSET(
						'images/icons/shopping-cart.svg'
					)}" alt="Shopping cart">
          <span class="cart-count" data-js="cart-count" hidden>0</span>
        </a>
      </div>
    </div>

    <nav class="header__nav" aria-label="Header navigation">
      <ul class="nav__list">
        <li class="nav__item">
          <a href="${buildPath('/')}" class="nav__link">Home</a>
        </li>
        <li class="nav__item nav__item--dropdown">
          <a href="${buildPath(
						'html/catalog.html'
					)}" class="nav__link" aria-haspopup="true" aria-expanded="false">
            Catalog
            <span class="nav__arrow">
              <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8.75 0.75L4.75 4.75L0.75 0.75" stroke="#504E4A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </span>
          </a>
        </li>
        <li class="nav__item">
          <a href="${buildPath(
						'html/about.html'
					)}" class="nav__link">About us</a>
        </li>
        <li class="nav__item">
          <a href="${buildPath(
						'html/contact.html'
					)}" class="nav__link">Contact us</a>
        </li>
      </ul>
    </nav>
  </div>
`;

const FOOTER_TEMPLATE = `
  <div class="footer__benefits">
    <div class="footer__benefits-container container">
      <div class="footer__benefits-inner">
        <h3 class="footer__benefits-title">Our Benefits</h3>
        <ul class="footer__benefits-list">
          <li class="footer__benefits-item">
            <img class="footer__benefits-icon" src="${ASSET(
							'images/icons/benefit-1.svg'
						)}" alt="benefit-icon">
            <p class="footer__benefits-text">Velit nisl sodales eget donec quis. volutpat orci.</p>
          </li>
          <li class="footer__benefits-item">
            <img class="footer__benefits-icon" src="${ASSET(
							'images/icons/benefit-2.svg'
						)}" alt="benefit-icon">
            <p class="footer__benefits-text">Dolor eu varius. Morbi fermentum velit nisl.</p>
          </li>
          <li class="footer__benefits-item">
            <img class="footer__benefits-icon" src="${ASSET(
							'images/icons/benefit-3.svg'
						)}" alt="benefit-icon">
            <p class="footer__benefits-text">Malesuada fames ac ante ipsum primis in faucibus.</p>
          </li>
          <li class="footer__benefits-item">
            <img class="footer__benefits-icon" src="${ASSET(
							'images/icons/benefit-4.svg'
						)}" alt="benefit-icon">
            <p class="footer__benefits-text">Nisl sodales eget donec quis, volutpat orci.</p>
          </li>
        </ul>
      </div> 
    </div>
  </div>

  <div class="footer__contacts">
    <div class="footer__contacts-inner container">
      <nav class="footer__menu" aria-label="Footer navigation">
        <div class="footer__menu-col">
          <h4 class="footer__menu-title">About Us</h4>
          <ul class="footer__menu-list">
            <li class="footer__menu-link"><a href="#">Organisation</a></li>
            <li class="footer__menu-link"><a href="#">Partners</a></li>
            <li class="footer__menu-link"><a href="#">Clients</a></li>
          </ul>
        </div>

        <div class="footer__menu-col">
          <h4 class="footer__menu-title">Interesting Links</h4>
          <ul class="footer__menu-list">
            <li class="footer__menu-link"><a href="#">Photo Gallery</a></li>
            <li class="footer__menu-link"><a href="#">Our Team</a></li>
            <li class="footer__menu-link"><a href="#">Socials</a></li>
          </ul>
        </div>

        <div class="footer__menu-col">
          <h4 class="footer__menu-title">Achievements</h4>
          <ul class="footer__menu-list">
            <li class="footer__menu-link"><a href="#">Winning Awards</a></li>
            <li class="footer__menu-link"><a href="#">Press</a></li>
            <li class="footer__menu-link"><a href="#">Our Amazing Clients</a></li>
          </ul>
        </div>
      </nav>

      <section class="footer__contact">
        <h4 class="footer__contact-title">Contact Us</h4>
        <p class="footer__contact-intro">
          Bendum dolor eu varius. Morbi fermentum velitsodales egetonec. volutpat orci.
          Sed ipsum felis, tristique egestas et, convallis ac velitn consequat nec luctus.
        </p>

        <ul class="footer__contact-rows">
          <li class="footer__contact-row">
            <span class="footer__contact-icon">
              <img src="${ASSET(
								'images/icons/phone.svg'
							)}" alt="" aria-hidden="true">
            </span>
            <a class="footer__contact-value" href="tel:+632366322">Phone: (+63) 236 6322</a>

            <span class="footer__contact-icon">
              <img src="${ASSET(
								'images/icons/mail.svg'
							)}" alt="" aria-hidden="true">
            </span>
            <a class="footer__contact-value" href="mailto:public@news.com">public@news.com</a>
          </li>

          <li class="footer__contact-row">
            <span class="footer__contact-icon">
              <img src="${ASSET(
								'images/icons/clock.svg'
							)}" alt="" aria-hidden="true">
            </span>
            <div class="footer__contact-value">
              Mon - Fri: 10am – 6pm<br>Sat - Sun: 10am – 6pm
            </div>
          </li>

          <li class="footer__contact-row">
            <span class="footer__contact-icon">
              <img src="${ASSET(
								'images/icons/pin.svg'
							)}" alt="" aria-hidden="true">
            </span>
            <div class="footer__contact-value">639 Jade Valley, Washington Dc</div>
          </li>
        </ul>
      </section>

      <section class="footer__shipping">
        <h4 class="footer__shipping-title">Shipping Information</h4>
        <p class="footer__shipping-text">
          Nulla eleifend pulvinar purus, molestie euismod odio imperdiet ac. Ut sit amet erat nec nibh
          rhoncus varius in non lorem. Donec interdum, lectus in convallis pulvinar, enim elit porta sapien,
          vel finibus erat felis sed neque. Etiam aliquet neque sagittis erat tincidunt aliquam.
        </p>
      </section>
    </div>

    <div class="footer__copy">
      <p>© Copyright 2025</p>
    </div>
  </div>
`;

const MODAL_TEMPLATE = `
  <div id="login-modal" class="modal">
    <div class="modal-content">
      <h2 class="login-title">Log In</h2>
      <form id="login-form">

        <div class="form-group">
          <label for="email" class="form-label">
            Email Address <span class="required">*</span>
          </label>
          <input type="email" class="form-input" id="email-modal" name="email" placeholder="Enter your email" required>
        </div>

        <div class="form-group">
          <label for="password" class="form-label">
            Password <span class="required">*</span>
          </label>
          <div class="password-wrapper">
            <input type="password" id="password-modal" name="password" class="form-input" placeholder="Enter your password"
              required>
            <span id="password-toggle" class="password-toggle">
              <img src="${ASSET(
								'images/icons/eye-icon.svg'
							)}" alt="Show/Hide Password">
            </span>
          </div>
        </div>
        <div class="form-info">
          <div class="form-group">
            <label for="remember-me">
              <input type="checkbox" id="remember-me" name="remember-me" class="custom-checkbox">
              <span class="checkbox-label">Remember me</span>
            </label>
          </div>

          <div class="form-group">
            <a href="#" class="forgot-password-link">Forgot Your Password?</a>
          </div>
        </div>

        <button type="submit" class="login-button btn">Log In</button>
      </form>
    </div>
  </div>
`;

// ============================================================================
// NAVIGATION
// ============================================================================

const setActiveNavLink = (headerRoot) => {
	const current = getCurrentPathname();
	const links = headerRoot.querySelectorAll(SELECTORS.navLink);

	links.forEach((link) => {
		const href = link.getAttribute('href') || '';
		const path = normalizePathname(href);

		const isActive =
			(current === '/' && (path === '/' || path.endsWith('/index.html'))) ||
			(current !== '/' &&
				path !== '/' &&
				current.includes(path.split('/').pop()));

		link.classList.toggle(CLASSES.navLinkActive, isActive);
	});
};

const initDropdownAria = (headerRoot) => {
	const dropdownItem = headerRoot.querySelector(SELECTORS.dropdownItem);
	if (!dropdownItem) return;

	const triggerLink = dropdownItem.querySelector(SELECTORS.navLink);
	if (!triggerLink) return;

	const setExpanded = (val) =>
		triggerLink.setAttribute(ATTR.ariaExpanded, String(val));

	dropdownItem.addEventListener('mouseenter', () => setExpanded(true));
	dropdownItem.addEventListener('mouseleave', () => setExpanded(false));
	triggerLink.addEventListener('focus', () => setExpanded(true));
	triggerLink.addEventListener('blur', () => setExpanded(false));
};

// ============================================================================
// RENDER
// ============================================================================

const renderSharedHeader = () => {
	const headerEl = document.querySelector(SELECTORS.rootHeader);
	if (!headerEl) return;

	headerEl.innerHTML = HEADER_TEMPLATE;
	setActiveNavLink(headerEl);
	initDropdownAria(headerEl);

	headerEl.classList.add('visible');
};

const renderSharedFooter = () => {
	const footerEl = document.querySelector(SELECTORS.rootFooter);
	if (!footerEl) return;

	footerEl.innerHTML = FOOTER_TEMPLATE;
};

const renderLoginModal = () => {
	const body = document.querySelector('body');
	if (!body) return;

	body.insertAdjacentHTML('beforeend', MODAL_TEMPLATE);
};

// ============================================================================
// MODAL LOG IN
// ============================================================================

const openLoginModal = () => {
	const modal = document.getElementById('login-modal');
	const loginForm = modal.querySelector('#login-form');

	modal.style.display = 'block';

	loginForm.addEventListener('submit', (e) => {
		e.preventDefault();
		const email = document.getElementById('email').value;
		const password = document.getElementById('password').value;
		const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;

		if (!email.match(emailRegex)) {
			alert('Please enter a valid email');
			return;
		}

		if (!password) {
			alert('Password is required');
			return;
		}

		alert('Logged in successfully!');
		modal.style.display = 'none';
	});

	window.addEventListener('click', (event) => {
		if (event.target === modal) {
			modal.style.display = 'none';
		}
	});
};

// ============================================================================
// INITIALIZATION
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
	renderSharedHeader();
	renderSharedFooter();
	renderLoginModal();

	const isHomePage =
		window.location.pathname === '/' ||
		window.location.pathname.endsWith('index.html');

	if (isHomePage) {
		initHome();
	}

	const path = window.location.pathname;

	if (path.includes('about.html')) {
		initAbout();
	}

	const userIcon = document.getElementById('user-icon');
	if (userIcon) {
		userIcon.addEventListener('click', openLoginModal);
	}

	if (path.includes('catalog.html')) {
		initCatalog();
	}

	if (path.includes('cart.html')) {
		initCart();
	}

	if (path.includes('product-card.html')) {
		initProduct();
	}

	initContactForm();
});

export { buildPath, ASSET };
