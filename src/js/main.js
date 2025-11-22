import { initHome } from './home.js';
import { initCart } from './cart.js';
import { initAbout } from './about.js';
import { initCatalog } from './catalog.js';
import { initProduct } from './product.js';
import {
	initContactForm,
	isValidEmail,
	showFieldError,
	clearFieldError,
} from './contact.js';

// ============================================================================
// CONSTANTS
// ============================================================================

const SELECTORS = {
	rootHeader: '#header',
	rootFooter: '#footer',
	rootBody: 'body',
	navLink: '.nav__link',
	dropdownItem: '.nav__item--dropdown',
	userIcon: '#user-icon',
	loginModal: '#login-modal',
	loginForm: '#login-form',
	emailInput: '#email-modal',
	passwordInput: '#password-modal',
	passwordToggle: '#password-toggle',
	burger: '[data-js="burger"]',
	nav: '.header__nav',
};

const CLASSES = {
	navLinkActive: 'nav__link--active',
	headerVisible: 'visible',
	modalOpen: 'modal--open',
	burgerActive: 'burger--active',
	navOpen: 'header__nav--open',
	bodyNoScroll: 'body--no-scroll',
};

const ATTR = {
	ariaExpanded: 'aria-expanded',
};

const PAGE_PATHS = {
	home: ['/', 'index.html'],
	about: 'about.html',
	catalog: 'catalog.html',
	cart: 'cart.html',
	product: 'product-card.html',
};

const BURGER_CONFIG = {
	MOBILE_BREAKPOINT: 480,
};

const LOGIN_MESSAGES = {
	invalidEmail: 'Please enter a valid email address',
	invalidPassword: 'Password is required',
	success: 'Logged in successfully!',
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

const isCurrentPage = (pageName) => {
	const path = window.location.pathname;

	if (Array.isArray(pageName)) {
		return pageName.some((p) => path === p || path.endsWith(p));
	}

	return path.includes(pageName);
};

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
      <button class="burger" data-js="burger" aria-label="Toggle menu" aria-expanded="false">
        <span class="burger__line"></span>
        <span class="burger__line"></span>
        <span class="burger__line"></span>
      </button>

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
      

      <a class="header__logo-link" href="${buildPath('/')}">
        <div class="header__logo">
          <div class="header__logo-image">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
							<rect width="32" height="32" fill="url(#pattern0_7064_3)"/>
							<defs>
							<pattern id="pattern0_7064_3" patternContentUnits="objectBoundingBox" width="1" height="1">
							<use xlink:href="#image0_7064_3" transform="scale(0.00666667)"/>
							</pattern>
							<image id="image0_7064_3" width="150" height="150" preserveAspectRatio="none" xlink:href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJYAAACWCAMAAAAL34HQAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAABmUExURQAAAP///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////5WfaagAAAAidFJOUwAQIECPz+//359gcK+/MFAcGFTjgKNuCERsZWQ51+5o89uQKq+OAAAACXBIWXMAABcRAAAXEQHKJvM/AAACH0lEQVR4Xu3b0VLaUACEYSFIBCtRFNFWrb7/S3ZMOtnkz9bBdnLsxf6XycH9BhjGm5ydpZRSSimllNJ/1GI5acEzhatW5+vadbGqeLZYiw01wzZf9J5VF5SMW2/5ihJdkjHtC1xL/6UatV7yVbP3jQbXFV81d1sKfKU/xpPerOJv1+KEb1Zb2V+JXb97vq0mNVf97R1fOWtVv2t/zRcf356tpt+1n5JYDW/NWlifKazPFNbvrpvtoJv22m546b1Vv3vJW+/pn54Nb3W/rzfDS801CNP2t/1fbOt+Du/GF/+lu/YP6ue47XYPBjqMj5di1fUGkFH3PF2MVd+DMug4/b+gGGt9BEY98GxBVv0AjHrk0ZKsR2CUWS/H6m64zHpYwCizHhYwyqyHBYwy62EBo8x6WMAosx4WMMqshwWMMuthAaPMeljAKLMeFjDKrIcFjDLrYQGjzHpYwCizHhYwyqyHBYwy62EBo8x6WMAosx4WMMqshwWMMuthAaPMeljAKLMeFjDKrIcFjDLrYQGjzHpYwCizHhYwyqyHBYwy62EBo8x6WMAosx4WMMqshwWMMuthAaPMeljAKLMeFjDKrIcFjDLrYQGjzHpYwKjvPFqS9QMY9cSjJVlPwAx65tlyrGdQhu1feLoU6+XDpzF+vuJ4Idbrn79ZbcvD2+h8Edbb4YRnd0dPu3dPSJgH4P+27nGl4/RSSimllFJKKc3VLyXhNx4FpV0aAAAAAElFTkSuQmCC"/>
							</defs>
						</svg>
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
          <a href="${buildPath(
						'html/about.html'
					)}" class="footer-link"><h4 class="footer__menu-title">About Us</h4></a>
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
        <a href="${buildPath(
					'html/contact.html'
				)}" class="footer-link"><h4 class="footer__contact-title">Contact Us</h4>
        <p class="footer__contact-intro"></a>
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
          </li>
          <li class="footer__contact-row">
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
// BURGER MENU
// ============================================================================

let isBurgerMenuOpen = false;

const isMobileView = () => window.innerWidth < BURGER_CONFIG.MOBILE_BREAKPOINT;

const toggleBodyScroll = (shouldLock) => {
	const body = document.querySelector(SELECTORS.rootBody);
	if (body) {
		body.classList.toggle(CLASSES.bodyNoScroll, shouldLock);
	}
};

const openBurgerMenu = (burger, nav) => {
	isBurgerMenuOpen = true;
	burger.classList.add(CLASSES.burgerActive);
	nav.classList.add(CLASSES.navOpen);
	burger.setAttribute(ATTR.ariaExpanded, 'true');
	toggleBodyScroll(true);
};

const closeBurgerMenu = (burger, nav) => {
	isBurgerMenuOpen = false;
	burger.classList.remove(CLASSES.burgerActive);
	nav.classList.remove(CLASSES.navOpen);
	burger.setAttribute(ATTR.ariaExpanded, 'false');
	toggleBodyScroll(false);
};

const toggleBurgerMenu = (burger, nav) => {
	if (isBurgerMenuOpen) {
		closeBurgerMenu(burger, nav);
	} else {
		openBurgerMenu(burger, nav);
	}
};

const handleBurgerClick = (e, burger, nav) => {
	e.stopPropagation();
	toggleBurgerMenu(burger, nav);
};

const handleBurgerOutsideClick = (e, burger, nav) => {
	if (!isBurgerMenuOpen || !isMobileView()) return;

	const isClickInsideNav = nav.contains(e.target);
	const isClickOnBurger = burger.contains(e.target);

	if (!isClickInsideNav && !isClickOnBurger) {
		closeBurgerMenu(burger, nav);
	}
};

const handleNavLinkClickInBurger = (burger, nav) => {
	if (isMobileView()) {
		closeBurgerMenu(burger, nav);
	}
};

const handleBurgerResize = (burger, nav) => {
	if (!isMobileView() && isBurgerMenuOpen) {
		closeBurgerMenu(burger, nav);
	}
};

const handleBurgerEscape = (e, burger, nav) => {
	if (e.key === 'Escape' && isBurgerMenuOpen) {
		closeBurgerMenu(burger, nav);
	}
};

const initBurgerMenu = () => {
	const burger = document.querySelector(SELECTORS.burger);
	const nav = document.querySelector(SELECTORS.nav);

	if (!burger || !nav) {
		return null;
	}

	const onBurgerClick = (e) => handleBurgerClick(e, burger, nav);
	const onOutsideClick = (e) => handleBurgerOutsideClick(e, burger, nav);
	const onResize = () => handleBurgerResize(burger, nav);
	const onEscape = (e) => handleBurgerEscape(e, burger, nav);

	burger.addEventListener('click', onBurgerClick);
	document.addEventListener('click', onOutsideClick);
	window.addEventListener('resize', onResize);
	document.addEventListener('keydown', onEscape);

	const navLinks = nav.querySelectorAll(SELECTORS.navLink);
	navLinks.forEach((link) => {
		link.addEventListener('click', () =>
			handleNavLinkClickInBurger(burger, nav)
		);
	});

	return () => {
		burger.removeEventListener('click', onBurgerClick);
		document.removeEventListener('click', onOutsideClick);
		window.removeEventListener('resize', onResize);
		document.removeEventListener('keydown', onEscape);

		navLinks.forEach((link) => {
			link.removeEventListener('click', () =>
				handleNavLinkClickInBurger(burger, nav)
			);
		});

		if (isBurgerMenuOpen) {
			closeBurgerMenu(burger, nav);
		}
	};
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

const isValidPassword = (value) => {
	return value && value.trim().length > 0;
};

const initPasswordToggle = () => {
	const passwordToggle = document.querySelector(SELECTORS.passwordToggle);
	const passwordInput = document.querySelector(SELECTORS.passwordInput);

	if (!passwordToggle || !passwordInput) return;

	passwordToggle.addEventListener('click', () => {
		const type = passwordInput.type === 'password' ? 'text' : 'password';
		passwordInput.type = type;
		passwordToggle.classList.toggle('password-toggle--visible');
	});
};

const closeLoginModal = () => {
	const modal = document.querySelector(SELECTORS.loginModal);
	if (modal) {
		modal.style.display = 'none';
		modal.classList.remove(CLASSES.modalOpen);
	}
};

const openLoginModal = () => {
	const modal = document.querySelector(SELECTORS.loginModal);
	const loginForm = modal?.querySelector(SELECTORS.loginForm);

	if (!modal || !loginForm) return;

	modal.style.display = 'block';
	modal.classList.add(CLASSES.modalOpen);

	loginForm.setAttribute('novalidate', '');

	const emailInput = document.querySelector(SELECTORS.emailInput);
	const passwordInput = document.querySelector(SELECTORS.passwordInput);

	initPasswordToggle();

	if (emailInput) {
		emailInput.addEventListener('input', () => {
			const value = emailInput.value.trim();

			if (value === '') {
				showFieldError(emailInput, 'Email is required', loginForm);
			} else if (!isValidEmail(value)) {
				showFieldError(emailInput, LOGIN_MESSAGES.invalidEmail, loginForm);
			} else {
				clearFieldError(emailInput);
			}
		});

		emailInput.addEventListener('blur', () => {
			const value = emailInput.value.trim();

			if (value === '') {
				showFieldError(emailInput, 'Email is required', loginForm);
			} else if (!isValidEmail(value)) {
				showFieldError(emailInput, LOGIN_MESSAGES.invalidEmail, loginForm);
			}
		});
	}

	if (passwordInput) {
		passwordInput.addEventListener('input', () => {
			const value = passwordInput.value;

			if (value === '') {
				showFieldError(
					passwordInput,
					LOGIN_MESSAGES.invalidPassword,
					loginForm
				);
			} else {
				clearFieldError(passwordInput);
			}
		});

		passwordInput.addEventListener('blur', () => {
			const value = passwordInput.value;

			if (value === '') {
				showFieldError(
					passwordInput,
					LOGIN_MESSAGES.invalidPassword,
					loginForm
				);
			}
		});
	}

	const handleSubmit = (e) => {
		e.preventDefault();

		const emailInput = document.querySelector(SELECTORS.emailInput);
		const passwordInput = document.querySelector(SELECTORS.passwordInput);

		const email = emailInput?.value || '';
		const password = passwordInput?.value || '';

		if (emailInput) clearFieldError(emailInput);
		if (passwordInput) clearFieldError(passwordInput);

		let hasErrors = false;

		if (!isValidEmail(email)) {
			if (emailInput) {
				showFieldError(emailInput, LOGIN_MESSAGES.invalidEmail, loginForm);
				if (!hasErrors) emailInput.focus();
			}
			hasErrors = true;
		}

		if (!isValidPassword(password)) {
			if (passwordInput) {
				showFieldError(
					passwordInput,
					LOGIN_MESSAGES.invalidPassword,
					loginForm
				);
				if (!hasErrors) passwordInput.focus();
			}
			hasErrors = true;
		}

		if (hasErrors) return;

		alert(LOGIN_MESSAGES.success);
		closeLoginModal();
		loginForm.reset();

		if (emailInput) clearFieldError(emailInput);
		if (passwordInput) clearFieldError(passwordInput);
	};

	loginForm.removeEventListener('submit', handleSubmit);
	loginForm.addEventListener('submit', handleSubmit);
};

const initModalOutsideClick = () => {
	window.addEventListener('click', (event) => {
		const modal = document.querySelector(SELECTORS.loginModal);
		if (event.target === modal) {
			closeLoginModal();
		}
	});
};

// ============================================================================
// PAGE ROUTING
// ============================================================================

const initCurrentPage = () => {
	if (isCurrentPage(PAGE_PATHS.home)) {
		initHome();
	}

	if (isCurrentPage(PAGE_PATHS.about)) {
		initAbout();
	}

	if (isCurrentPage(PAGE_PATHS.catalog)) {
		initCatalog();
	}

	if (isCurrentPage(PAGE_PATHS.cart)) {
		initCart();
	}

	if (isCurrentPage(PAGE_PATHS.product)) {
		initProduct();
	}

	initContactForm();
};

// ============================================================================
// INITIALIZATION
// ============================================================================

let cleanupBurger = null;

const initApp = () => {
	renderSharedHeader();
	renderSharedFooter();
	renderLoginModal();

	cleanupBurger = initBurgerMenu();

	const userIcon = document.querySelector(SELECTORS.userIcon);
	if (userIcon) {
		userIcon.addEventListener('click', openLoginModal);
	}

	initModalOutsideClick();
	initCurrentPage();
};

window.addEventListener('beforeunload', () => {
	if (cleanupBurger) {
		cleanupBurger();
	}
});

document.addEventListener('DOMContentLoaded', initApp);

export { buildPath, ASSET };
