import { CartManager } from './cart.js';

// ============================================================================
// CONSTANTS
// ============================================================================

const SELECTORS = {
	form: '.feedback__form',
	requiredInputs: 'input[required], textarea[required]',
	emailInput: 'input[type="email"]',
};

const CONFIG = {
	NOTIFICATION_DURATION_MS: 2500,
	NOTIFICATION_FADE_MS: 300,
	EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/,
};

const CSS_CLASSES = {
	inputError: 'input-error',
	formError: 'form-error',
	notification: 'contact-notification',
};

const MESSAGES = {
	required: 'This field is required',
	invalidEmail: 'Please enter a valid email address',
	formErrors: 'Please fix errors in the form',
	success: 'Thank you! Your message has been sent.',
};

const NotificationType = {
	SUCCESS: 'success',
	ERROR: 'error',
};

// ============================================================================
// VALIDATION UTILITIES
// ============================================================================

const isValidEmail = (value) => {
	return CONFIG.EMAIL_REGEX.test(value.trim());
};

const createErrorNode = (input, form) => {
	const id = input.id
		? `${input.id}-error`
		: `error-${Math.random().toString(36).slice(2, 8)}`;

	form.setAttribute('novalidate', '');

	const existing = form.querySelector(`#${id}`);
	if (existing) return existing;

	const errorElement = document.createElement('div');
	errorElement.className = CSS_CLASSES.formError;
	errorElement.id = id;
	errorElement.setAttribute('aria-live', 'polite');

	input.insertAdjacentElement('afterend', errorElement);
	input.setAttribute('aria-describedby', id);

	return errorElement;
};

const showFieldError = (input, message, form) => {
	input.classList.add(CSS_CLASSES.inputError);
	input.setAttribute('aria-invalid', 'true');

	const errorNode = createErrorNode(input, form);
	errorNode.textContent = message;
};

const clearFieldError = (input) => {
	input.classList.remove(CSS_CLASSES.inputError);
	input.removeAttribute('aria-invalid');

	const errorId = input.getAttribute('aria-describedby');
	if (errorId) {
		const errorNode = document.getElementById(errorId);
		if (errorNode) errorNode.remove();
		input.removeAttribute('aria-describedby');
	}
};

// ============================================================================
// VALIDATION LOGIC
// ============================================================================

const validateInput = (input, emailInput) => {
	const value = input.value.trim();

	if (value === '') {
		return { isValid: false, message: MESSAGES.required };
	}

	if (input === emailInput && !isValidEmail(value)) {
		return { isValid: false, message: MESSAGES.invalidEmail };
	}

	return { isValid: true, message: '' };
};

const handleInputValidation = (input, emailInput, form) => {
	const result = validateInput(input, emailInput);

	if (!result.isValid) {
		showFieldError(input, result.message, form);
	} else {
		clearFieldError(input);
	}
};

// ============================================================================
// NOTIFICATION
// ============================================================================

const showNotification = (message, type = NotificationType.SUCCESS) => {
	const notification = document.createElement('div');
	notification.className = `${CSS_CLASSES.notification} ${CSS_CLASSES.notification}--${type}`;
	notification.textContent = message;
	notification.style.zIndex = '9999';

	document.body.appendChild(notification);

	setTimeout(() => {
		notification.style.opacity = '0';
		setTimeout(() => {
			notification.remove();
		}, CONFIG.NOTIFICATION_FADE_MS);
	}, CONFIG.NOTIFICATION_DURATION_MS);
};

// ============================================================================
// FORM VALIDATION
// ============================================================================

const validateForm = (inputs, emailInput, form) => {
	let firstInvalid = null;

	inputs.forEach((input) => {
		const result = validateInput(input, emailInput);

		if (!result.isValid) {
			showFieldError(input, result.message, form);
			if (!firstInvalid) firstInvalid = input;
		}
	});

	return firstInvalid;
};

// ============================================================================
// EVENT HANDLERS
// ============================================================================

const initInputValidation = (inputs, emailInput, form) => {
	inputs.forEach((input) => {
		input.addEventListener('input', () => {
			handleInputValidation(input, emailInput, form);
		});

		input.addEventListener('blur', () => {
			handleInputValidation(input, emailInput, form);
		});
	});
};

const handleFormSubmit = (e, form, inputs, emailInput) => {
	e.preventDefault();

	inputs.forEach(clearFieldError);

	const firstInvalid = validateForm(inputs, emailInput, form);

	if (firstInvalid) {
		firstInvalid.focus();
		showNotification(MESSAGES.formErrors, NotificationType.ERROR);
		return;
	}

	showNotification(MESSAGES.success, NotificationType.SUCCESS);

	form.reset();
};

// ============================================================================
// INITIALIZATION
// ============================================================================

export const initContactForm = () => {
	const form = document.querySelector(SELECTORS.form);
	if (!form) return;

	const inputs = Array.from(form.querySelectorAll(SELECTORS.requiredInputs));
	const emailInput = form.querySelector(SELECTORS.emailInput);

	initInputValidation(inputs, emailInput, form);

	form.addEventListener('submit', (e) => {
		handleFormSubmit(e, form, inputs, emailInput);
	});

	CartManager.updateCartCount();
};

export { isValidEmail, showFieldError, clearFieldError };
