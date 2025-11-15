import { buildPath } from './main.js';

export function initAbout() {
	const aboutButton = document.getElementById('about-button');
	if (aboutButton) {
		aboutButton.addEventListener('click', (event) => {
			event.preventDefault();
			const path = buildPath('html/catalog.html');
			window.location.href = path;
		});
	}
}
