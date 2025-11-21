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

// export const initContactForm = () => {
// 	const form = document.querySelector('.feedback__form');
// 	if (!form) return;

// 	const inputs = Array.from(
// 		form.querySelectorAll('input[required], textarea[required]')
// 	);
// 	const emailInput = form.querySelector('input[type="email"]');

// 	// helper: email regex (reasonably strict)
// 	const isValidEmail = (value) => {
// 		return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());
// 	};

// 	const createErrorNode = (input) => {
// 		let id = input.id
// 			? `${input.id}-error`
// 			: `err-${Math.random().toString(36).slice(2, 8)}`;
// 		let existing = form.querySelector(`#${id}`);
// 		if (existing) return existing;
// 		const el = document.createElement('div');
// 		el.className = 'form-error';
// 		el.id = id;
// 		el.setAttribute('aria-live', 'polite');
// 		input.insertAdjacentElement('afterend', el);
// 		input.setAttribute('aria-describedby', id);
// 		return el;
// 	};

// 	const showFieldError = (input, message) => {
// 		input.classList.add('input-error');
// 		input.setAttribute('aria-invalid', 'true');
// 		const err = createErrorNode(input);
// 		err.textContent = message;
// 	};

// 	const clearFieldError = (input) => {
// 		input.classList.remove('input-error');
// 		input.removeAttribute('aria-invalid');
// 		const desc = input.getAttribute('aria-describedby');
// 		if (desc) {
// 			const node = document.getElementById(desc);
// 			if (node) node.remove();
// 			input.removeAttribute('aria-describedby');
// 		}
// 	};

// 	// real-time validation
// 	inputs.forEach((input) => {
// 		input.addEventListener('input', () => {
// 			// required check
// 			if (input.value.trim() === '') {
// 				showFieldError(input, 'This field is required');
// 				return;
// 			} else {
// 				clearFieldError(input);
// 			}

// 			// extra email check
// 			if (input === emailInput) {
// 				if (!isValidEmail(emailInput.value)) {
// 					showFieldError(emailInput, 'Please enter a valid email address');
// 				} else {
// 					clearFieldError(emailInput);
// 				}
// 			}
// 		});

// 		// validate on blur as well
// 		input.addEventListener('blur', () => {
// 			if (input.value.trim() === '') {
// 				showFieldError(input, 'This field is required');
// 				return;
// 			} else {
// 				clearFieldError(input);
// 			}

// 			if (input === emailInput && !isValidEmail(emailInput.value)) {
// 				showFieldError(emailInput, 'Please enter a valid email address');
// 			}
// 		});
// 	});

// 	// helper notification (success / error)
// 	const showNotification = (text, type = 'success') => {
// 		const n = document.createElement('div');
// 		n.className = `contact-notification contact-notification--${type}`;
// 		n.textContent = text;
// 		n.style.zIndex = 9999;
// 		document.body.appendChild(n);
// 		setTimeout(() => {
// 			n.style.opacity = '0';
// 			setTimeout(() => n.remove(), 300);
// 		}, 2500);
// 	};

// 	// on submit
// 	form.addEventListener('submit', (e) => {
// 		e.preventDefault();

// 		// clear previous errors
// 		inputs.forEach(clearFieldError);

// 		// validate all required fields
// 		let firstInvalid = null;
// 		inputs.forEach((input) => {
// 			if (input.value.trim() === '') {
// 				showFieldError(input, 'This field is required');
// 				if (!firstInvalid) firstInvalid = input;
// 			} else if (input === emailInput && !isValidEmail(input.value)) {
// 				showFieldError(input, 'Please enter a valid email address');
// 				if (!firstInvalid) firstInvalid = input;
// 			}
// 		});

// 		if (firstInvalid) {
// 			firstInvalid.focus();
// 			showNotification('Please fix errors in the form', 'error');
// 			return;
// 		}

// 		// все валідно — симулюємо успішну відправку (без перезавантаження)
// 		// тут можна викликати fetch(...) якщо є бекенд
// 		const formData = Object.fromEntries(new FormData(form).entries());
// 		// console.log('Form data to send:', formData);

// 		// показати успіх
// 		showNotification('Thank you! Your message has been sent.', 'success');

// 		// опціонально: очистити форму
// 		form.reset();
// 	});
// };
