// Contact form validation + submit (real-time + no-page-reload)
export const initContactForm = () => {
	const form = document.querySelector('.feedback__form');
	if (!form) return;

	const inputs = Array.from(
		form.querySelectorAll('input[required], textarea[required]')
	);
	const emailInput = form.querySelector('input[type="email"]');

	// helper: email regex (reasonably strict)
	const isValidEmail = (value) => {
		return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());
	};

	const createErrorNode = (input) => {
		let id = input.id
			? `${input.id}-error`
			: `err-${Math.random().toString(36).slice(2, 8)}`;
		let existing = form.querySelector(`#${id}`);
		if (existing) return existing;
		const el = document.createElement('div');
		el.className = 'form-error';
		el.id = id;
		el.setAttribute('aria-live', 'polite');
		input.insertAdjacentElement('afterend', el);
		input.setAttribute('aria-describedby', id);
		return el;
	};

	const showFieldError = (input, message) => {
		input.classList.add('input-error');
		input.setAttribute('aria-invalid', 'true');
		const err = createErrorNode(input);
		err.textContent = message;
	};

	const clearFieldError = (input) => {
		input.classList.remove('input-error');
		input.removeAttribute('aria-invalid');
		const desc = input.getAttribute('aria-describedby');
		if (desc) {
			const node = document.getElementById(desc);
			if (node) node.remove();
			input.removeAttribute('aria-describedby');
		}
	};

	// real-time validation
	inputs.forEach((input) => {
		input.addEventListener('input', () => {
			// required check
			if (input.value.trim() === '') {
				showFieldError(input, 'This field is required');
				return;
			} else {
				clearFieldError(input);
			}

			// extra email check
			if (input === emailInput) {
				if (!isValidEmail(emailInput.value)) {
					showFieldError(emailInput, 'Please enter a valid email address');
				} else {
					clearFieldError(emailInput);
				}
			}
		});

		// validate on blur as well
		input.addEventListener('blur', () => {
			if (input.value.trim() === '') {
				showFieldError(input, 'This field is required');
				return;
			} else {
				clearFieldError(input);
			}

			if (input === emailInput && !isValidEmail(emailInput.value)) {
				showFieldError(emailInput, 'Please enter a valid email address');
			}
		});
	});

	// helper notification (success / error)
	const showNotification = (text, type = 'success') => {
		const n = document.createElement('div');
		n.className = `contact-notification contact-notification--${type}`;
		n.textContent = text;
		n.style.zIndex = 9999;
		document.body.appendChild(n);
		setTimeout(() => {
			n.style.opacity = '0';
			setTimeout(() => n.remove(), 300);
		}, 2500);
	};

	// on submit
	form.addEventListener('submit', (e) => {
		e.preventDefault();

		// clear previous errors
		inputs.forEach(clearFieldError);

		// validate all required fields
		let firstInvalid = null;
		inputs.forEach((input) => {
			if (input.value.trim() === '') {
				showFieldError(input, 'This field is required');
				if (!firstInvalid) firstInvalid = input;
			} else if (input === emailInput && !isValidEmail(input.value)) {
				showFieldError(input, 'Please enter a valid email address');
				if (!firstInvalid) firstInvalid = input;
			}
		});

		if (firstInvalid) {
			firstInvalid.focus();
			showNotification('Please fix errors in the form', 'error');
			return;
		}

		// все валідно — симулюємо успішну відправку (без перезавантаження)
		// тут можна викликати fetch(...) якщо є бекенд
		const formData = Object.fromEntries(new FormData(form).entries());
		// console.log('Form data to send:', formData);

		// показати успіх
		showNotification('Thank you! Your message has been sent.', 'success');

		// опціонально: очистити форму
		form.reset();
	});
};
