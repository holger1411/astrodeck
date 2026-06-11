import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintPluginAstro from 'eslint-plugin-astro';
import globals from 'globals';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  ...eslintPluginAstro.configs.recommended,
  {
    ignores: ['dist/**', 'node_modules/**', '.astro/**'],
  },
  {
    // Node.js tooling scripts (hooks, KPI checks) run outside the browser
    files: ['.claude/**/*.mjs', 'eslint.config.mjs', 'astro.config.mjs'],
    languageOptions: {
      globals: globals.node,
    },
  },
  {
    rules: {
      // Allow unused vars starting with underscore
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      // Allow any types in some cases (starter kit flexibility)
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  }
);
