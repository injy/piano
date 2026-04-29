import js from '@eslint/js';

export default [
  js.configs.recommended,
  {
    files: ['src/**/*.js'],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'module',
      globals: {
        window: 'readonly',
        document: 'readonly',
        fetch: 'readonly'
      }
    },
    rules: {
      indent: ['error', 2],
      'no-unused-vars': ['warn', { vars: 'local', args: 'none' }],
      'linebreak-style': 'off',
      quotes: ['error', 'single'],
      semi: ['error', 'always']
    }
  }
];
