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
						<div class="footer__benefits-icon">
            	<svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
								<path d="M30 60C46.5685 60 60 46.5685 60 30C60 13.4315 46.5685 0 30 0C13.4315 0 0 13.4315 0 30C0 46.5685 13.4315 60 30 60Z" fill="url(#pattern0_1_82)"/>
								<defs>
								<pattern id="pattern0_1_82" patternContentUnits="objectBoundingBox" width="1" height="1">
								<use xlink:href="#image0_1_82" transform="scale(0.00621118)"/>
								</pattern>
								<image id="image0_1_82" width="161" height="161" preserveAspectRatio="none" xlink:href="data:image/png;base64,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"/>
								</defs>
							</svg>
						</div>
            <p class="footer__benefits-text">Velit nisl sodales eget donec quis. volutpat orci.</p>
          </li>
          <li class="footer__benefits-item">
            <div class="footer__benefits-icon">
							<svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
								<path d="M30 60C46.5685 60 60 46.5685 60 30C60 13.4315 46.5685 0 30 0C13.4315 0 0 13.4315 0 30C0 46.5685 13.4315 60 30 60Z" fill="url(#pattern0_1_77)"/>
								<defs>
								<pattern id="pattern0_1_77" patternContentUnits="objectBoundingBox" width="1" height="1">
								<use xlink:href="#image0_1_77" transform="scale(0.00621118)"/>
								</pattern>
								<image id="image0_1_77" width="161" height="161" preserveAspectRatio="none" xlink:href="data:image/png;base64,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"/>
								</defs>
							</svg>
						</div>
            <p class="footer__benefits-text">Dolor eu varius. Morbi fermentum velit nisl.</p>
          </li>
          <li class="footer__benefits-item">
            <div class="footer__benefits-icon">
							<svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
								<path d="M30 60C46.5685 60 60 46.5685 60 30C60 13.4315 46.5685 0 30 0C13.4315 0 0 13.4315 0 30C0 46.5685 13.4315 60 30 60Z" fill="url(#pattern0_1_72)"/>
								<defs>
								<pattern id="pattern0_1_72" patternContentUnits="objectBoundingBox" width="1" height="1">
								<use xlink:href="#image0_1_72" transform="scale(0.00621118)"/>
								</pattern>
								<image id="image0_1_72" width="161" height="161" preserveAspectRatio="none" xlink:href="data:image/png;base64,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"/>
								</defs>
							</svg>
						</div>
            <p class="footer__benefits-text">Malesuada fames ac ante ipsum primis in faucibus.</p>
          </li>
          <li class="footer__benefits-item">
            <div class="footer__benefits-icon">
							<svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
								<path d="M30 60C46.5685 60 60 46.5685 60 30C60 13.4315 46.5685 0 30 0C13.4315 0 0 13.4315 0 30C0 46.5685 13.4315 60 30 60Z" fill="url(#pattern0_1_67)"/>
								<defs>
								<pattern id="pattern0_1_67" patternContentUnits="objectBoundingBox" width="1" height="1">
								<use xlink:href="#image0_1_67" transform="scale(0.00621118)"/>
								</pattern>
								<image id="image0_1_67" width="161" height="161" preserveAspectRatio="none" xlink:href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAKEAAAChCAYAAACvUd+2AAAACXBIWXMAABYlAAAWJQFJUiTwAAAQ2ElEQVR4nO2dbYwkx1nH/0/13N7u3fk8xgaEIU5fcHgz4eZCZELisHMOWEYO2TkR4AMiuyeExIsU7yGLIJNwNsqHIFnaNQgRCYnbFSDxIeJ6ZSOCQ3K9VhyEhXJzYGKMAA8GJQrk4jm/7OzrPHyo6u7qnp7zzm7PdPfM85NWuzvbM1Mz+5+nqp76P1WAIAiCIAiCIAiCIAiCIAiCIAiCIAiCIAiCIAiCIAiCIAiCIAiCIAiCIAiCIAiCIOQM5d2A0rK11QBoFkANQAvAOgAPR6faubarhIgI98v2Vg1AHcAcGHV9Y9rbR00Aa2B4mD7SHFXzyoyIsB/bm1UEogPVAbgAAA4uSBUg4tegDcADaB2Aj+lKaxhNLTsiQpvtzSjaoU+04/A2IzBcA3BaX09udE1A7P5NAD6Y1jDj+Fk1u+xMtgh3OlG0YyvahfQIUHe1IA9Hp3q72q0dF4wGgFkAjb5vL4ci9vXjwceM0zrgqyg9kyfCnU4NQAM62tX0jZSIXgEURDs96Zg6OtikY3PXEmTQnfftxnWUBNYxo7yBnqfkjL8IdzaqQBCdqAGg2nNNXBg+dLTzMXU0u4nF5q4LJluUFtbzR2POSPzHqJVZOwrIeIpwd0NHO7ajHZD6cplasLvFqenRpFg6e3VEk56ojdGYEwCgGFCMlmJ4DmO9c5LGLkqOhwh333QRm1CQjnb9Jwg+AtEdmck/jdLpugDq5kNTD9pPMCLsAg6HgoTThacY64rhX7+D8m//ISmvCHffqAMUzGJ7o118jNeyujcfR2aKnVDe4DqAOcWoO4xaIETFlhgjYbYchq+6WFMM/5U7qdivLYXyiHDvDRcp0aKXcJIRjamOHGuNoonDYOp1do0YZ1UXDcWopggxEmgXvmKsOQz/pbvKESWLLcK914OlsTqCaNc/WdwKo13l2NiNmwJuu841xWgoxpzDqPVESN1dh2NJO0pevbuYUbJYItx73QWQmEGmzhyBKM+mo13leGskbSwQd36Dq8RoOF3MKkbDYVRThGh34U2HsaYY3pd/oDhRMn8Rdl9rgCmeSwtJSxaTD2ANleP+KJpXJu7+bx0lHcasYtT7dNfBz23F8Jwu1onh/d2P5BclRy/C7mvB0lgU7foncKNVBYaPyonWKJo4DrzrZa4aIc45jLpiuEkh2r87jKYyUfKpd482Sg5fhN0b6UaAgF4BmpUDWoNzwh928yaFH3uJa2aCM6e6qN8kQkLpKOk7Ziz5l+8dbrJ8OCLkGzra8U2MAOG1iaUx55ZCDp7HifoLXFVAXXUx6+hJjpsaIeNR0ncYa5fuIz/r9mQjQm73RruetdgeN8kamDw4txRmgDypPHSVXTPjnnV0GqhfThKK0XZMGkgx/D+6//BR8uAi5HaKEcB6yPhqRTzaqZMS7QrMzz3P4Yw7GSVTUkFNh+ErxvoTDxxsSXEwEXLbBXARWnwpyeKYAH0ES2PqVol2JeWjz8WiZD2WLE9ESSNWTzGe/NRD+++2BxXhZfQ4QMKHasGeyapbJdqNIb/qc93p9i4pJiY67d97iG7b72NWBmxDMvr5CKIdSbSbBD5TJx/6/44Ln2eXGHUFzJFOA1UVA8RpvWR/Bo2EVxDOdnEWVPUHur8w1nzir5mDbvniz9C+taWG2ShhslDQ3TGlutRvfj9ByATiyAM5CCJCITOCicmgeT8RoZAZZM2QB+EQIszfgCMUi2A8OKIxIQHAHLo33IPdXxg3PrXG1bAmZkARDponhLUqsghgEd0bTQCrAHlQJ1uDP55QVi4+zS6Z1RTzHYTBI+GgIlxDlCcMqAFUA7CE7mst6DXiVaiTkrweQx79m1B482DUgugXdMOKAaV3Kds3gw/s+Eaw1cU8tAD7XEctBIIUp0ypeeQZrpFepptXN69raSnWa8e/+ZH9u2sON7vo3nDNrgZGkIZeo2rLFCGtwjkhgiwBH/sC15QWXUN1jZMmxQRrCW/1t88dzJGd3RS3+5oLoAGmuCB7n6oFNhGyIoIsEr92xRKeXQ6QYlJQ2r514ZMfPnwpwHDyLFHVXHqXHW110ULgM6wcH9syzSLzy89yQ7F2xYTewXTRNRVj1eliPnTPME79zlyeptb9svdGsCHRHPT+MP2eum267LVxrhsuAh99LhReI3C+pJaIBjXLgPfpB7XYHnuKrxjBQjHOPto4vN3/ACmaAXFOtAGsAFjBbiBI0oKMQVUAC2AsYGcj2OF0DUdmRJCH5Bf+gavGajWnGA1iVGOzWSu1ohgeMdYAeE880FsGquLRMROGL8LYs9mCfDMeIQG7JEALEljATicoDRBBDsC5f+SqiXRzYDTsRDJx3PFCRngEeE/+5M3rjwmRYLPqRkcrwtgzH7cEudEryOglxgXJpsuemhZBJvjQV7iqgAYFwkvk76yf28TwyBiS//js/gvfwyiIskbCflSORYKMbWqZqGVhigS5vQkEXfZBdlEdEx64FtaAzINRQ6KLtaJfm6CF96cfOPgeh0lRZ0ExRGhzxBZk5xqAJQB9dmlAw3xdwvaWBzOWwdHxFuTZF/SqhcOYJ7NqQYh3sZYQWwRc+PP3ZbO5ZqxLH1sRxrFrFR6HrlcOuuxqYrMkI0i6hK1t3WWP0eE2738x2o0LjJpCbDIRdbdASzGaFHXHrb/48ex2dx1GJCyHnzCIglPTHqamz2Nq+jaAzkFHzDSR6egIvIqt7cvY2lnA1s5AxTdF4N5/49p7X+Kl9/0rv0zAVQIuKpOjC8UALTRiLBPjzOX30CnFeDLrGWyAQvicmYmn6JGwXzcMTB31oGfN5/URX332utHLig0wLmFzxxTgk1fUg21q/8FhKgUMt2dygfD3JjFWwfCefnc8YWyPB7OKVgGWSWGMx4Q2/QSY5GgoSGBruwa9UtMAyNWPE14ZjCGXsLlrLGjIXZD3tKLkMXV1Dq/P5KJJjFUCvGdO91+pCAWIIUTCxIciC4otwoOgD7lpAriArR1LkEGEDIVdM19L6OxFghzRoTbvfMUSnp08RvwfbVIp6wR4V354f0tksclJxu22u/nJiISH5eiRSJCbaYIMSREkeZhRrayactfXouSxYtSJUbXHV7FcnkmlEOA994ODb16ZEHGmJIcHWTDeIrSZtgW5GwmSyU1cGZl0O10tSIaHY4ML8ru+oYVH1qpFMpViRNdWgG+Sx97z33e4XVOTS3JZEnxwgu4+C0okwgy9FtOVSJCdvRq0W3wevRa0GthEyA1uITDpHutvX7r9m3q3/WC5DOjN31GQPDbLZf/0jmwPyElMYDLF+uBIJMyMGScQ5DI6e26qSVd/AFwAiwQsqje45Rgj5+ZJap58NSV5nBg7GSGGwnvRHd7JTOHzYzgTk3IbGA7MiMpL9aRkGcAyOt1EGYM1UwVcYiwqxuKJNrcRbQTUk8IwOTyPGGv//rbsdzlNI9HVZ4o9JpygiUlO9c16UqIFucEutDFAR7r40lU1YYWKhAesvnLn6I9qGOqYcPIiYUEK7PUpm8tdYLmiT1hqEMJZbpg8VmZi8fXvzPeMkKHOjhHPQ2ZBwUVYPLZv0YIEsHzrt7hKQI2A1vU7inMcrD1xGFYknMyJScZvZhbc+DZqw2wYWSTC8SiGNzueQAND3g0oF/Z4cFgrJlkmq8shQgCFGR+WgGROMksmMxJKFBwYGkK0ChiGlavYIgzfQImCg5B032TJ5Fm5AIgAB2eYE5NhWLmKHQlFgAciuXKTJWLlEvZF2axcBY+EwkEQK1dJoQ12KTpMsBasCZt9WU4rxuq3bo+cL2/7OrvEWFL9z3prK8Zq83vjbpkPfJVdYlSfvWd4S3ti5RoaGXzuOt26+amJGRUZRze4AeCy/QYH5lMrqtQR1LFoFgho2NcEaQvLzNCwG37fi1wH44oCcP8LHAjWN2JfV120FeB5P3q4JUCxchWFzl4d2qx62jil3fBvjBaAU8GvBLPVGXp9gFbVWsztrPRWaT3rtIkURuw+ZHazigk2MkHUjXguAtj34YRpiJVrKAzwVnb2XABXkXoULoLcY+xvxu83Z4TRDlwxxLgRdm26xjnkv+4k7x3/w2coKFKC9aVLNd3kfQhYJt21NxJmV1v8sbb90pe5QYzLZpjQdPRh195n6v27c7FyZU7sDOU4m7sugDamK3bEWUBMZDEBt6Fd1E/aN3aPU7MLnBm0Zf/5PYON6579IWoDOBf8/mCTa8QInDhVYsyC420jq9hdATXjZ7z4G1/ktsNYUV2sLv9UvB1i5cqUPgLc3F2AdjzXAbSxuXvGqh1eMX+rQjtcrpnv8XFgAfhcLRSP3+8aE6XnVVAIjyhiEmNRAYuPPMOPP/EAPWbdJ4yww7RyTVh3bNjcqQO0hHhBUtX83gIQWPRPYUxYvY+aAE79yrreQV8xZgm6O7ci3mn7PqOwcmX5uMUXYfRi5wFcTLnCB4+mdiNP/mSWwoKsj32Bq2T2ITQR8XH72lFYubKk2CKMv1g3MQpZAbCK6Yo/svYUhD/4IEXb5yV47CleIMbSMK1cWVNsEcYIBajrhSdQfPuBgHlCVP2XuYsm24cDUL5luxUAZ0WA/VGM9WFauYZBSURIALCM6cr5RDpGSPDJD9NjyqzCDCNFMwxKIMKwA7iRZyvKhGKsh2mavBuzDwrextjGQG/PrRklw8yaw3rovNvzVhRchFgBcMH8vIDN3avo7JVu299R8vt/xUuE2C4Ra3m36a0otginK21MV5atW2oAXkZnbyGnFhUeFTdjrDz888XPoRZbhBErAILtg6sALqGzJ2JMgRgXiOETx3qRQlOOPOF05Tw6e9GZJhoXoEvodJcAnMWMKvzYJyt+9+meI2HPP9qgFQB45GepCeBsvi0cjHKIEABmnGV09jxoITasvwQnQI2tCD/+OX1AosOYVXrnV9d2syjGPFJWT8pCeUQIBOaEc3p3VXoY2rYV3w9mg6vQZ364xn/XVIxrDqP55q3FHx8l+a2/1W5sy6sYN97q21dzbuahKJcIA/TuqufNV5IaoE8tt/x3IAZOvspQjJbThXf9Dsp1vLTwJa4bIdVMncqs0mcON//wg1HbAud1iglWHyfB8D5+rjg7gh2Ecorw5jSV/gfV+jiXXQIWv+P/ePV/v137+d7+NXaJcdUUN7VN9AwOom4q7bBufuXueNHS7L9wXUUHUMM+Nd3c1vTeE93nF/+eXWJcUWmH5ERLbXVYEwrS2xLPm2t9YqwD8D+RwYnrRWH8RHiM2l3gTOV1do0QawTMKv1zcFBNOxAgAJAuWqpaZtG6ZdwMIxGs5Zuf+Gp6NxmKCfo+H3meT332Xi0Y81huSv1KJMbAF2n49E9rP+Fw37R8GT8RGsxmli1YFXK3f1NvaonEJIYYK4rxsLHYx4WBdEuULaabFUnBOnuP9Jpum0zEVYymEfE66dsDz+BEMbYiTOP6HembWr783dQCcNv3vxLuvBp2jVYRU+x+6/fQyv3/zK5izBrBtgm4loiK/mfvjZYe/+z9+nmG9gJLykSJ8K146a4ekfrpV2q++K6orkM4OGVZMRHGGBGhkDsiQiF3RIRC7ogIhdwREQq5IyIUckdEKOSOiFDIHRGhkDsiQiF3RIRC7ogIhdwREQq5IyIUckdEKOSOiFDIHRGhkDsiQiF3RIRC7ogIhdwREQqHIZP9w6XkUxiUCzC7oD3468M7s1kQBEEQBEEQBEEQBEEQBEEQBEEQBEEQBEEQBEEQBEEQBEEQBEEQBEEQBEEQhMni/wGYYa/KsnL8wQAAAABJRU5ErkJggg=="/>
								</defs>
							</svg>
						</div>
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

		const fields = [
			{
				selector: SELECTORS.emailInput,
				validate: isValidEmail,
				message: LOGIN_MESSAGES.invalidEmail,
			},
			{
				selector: SELECTORS.passwordInput,
				validate: isValidPassword,
				message: LOGIN_MESSAGES.invalidPassword,
			},
		];

		let hasErrors = false;

		fields.forEach(({ selector, validate, message }) => {
			const input = document.querySelector(selector);
			const value = input?.value || '';
			clearFieldError(input);

			if (input && !validate(value)) {
				showFieldError(input, message, loginForm);
				if (!hasErrors) input.focus();
				hasErrors = true;
			}
		});

		if (hasErrors) return;

		alert(LOGIN_MESSAGES.success);
		closeLoginModal();
		loginForm.reset();

		fields.forEach(({ selector }) =>
			clearFieldError(document.querySelector(selector))
		);
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
