export default {
	extends: ['stylelint-config-standard', 'stylelint-config-standard-scss'],
	plugins: ['stylelint-scss'],
	rules: {
		'no-empty-source': null,
		'selector-class-pattern': null,
		'scss/at-rule-no-unknown': true,
		'block-no-empty': true,
		'color-no-invalid-hex': true,
		'declaration-block-no-duplicate-properties': true,
	},
	ignoreFiles: ['dist/**/*.css'],
};
