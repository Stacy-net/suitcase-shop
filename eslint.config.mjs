import js from '@eslint/js';
import globals from 'globals';
import prettier from 'eslint-config-prettier';

export default [
	js.configs.recommended,
	prettier,

	{
		files: ['**/*.js'],
		ignores: ['dist/**', 'node_modules/**'],
		languageOptions: {
			ecmaVersion: 'latest',
			sourceType: 'module',
			globals: {
				...globals.browser,
			},
		},
		rules: {
			'no-unused-vars': 'warn',
			'no-console': 'warn',
			'prefer-const': 'warn',
			'no-multiple-empty-lines': ['warn', { max: 1 }],
		},
	},
];
