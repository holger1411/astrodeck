import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import { defineConfig } from 'eslint/config';
import eslintPluginAstro from 'eslint-plugin-astro';
import globals from 'globals';

export default defineConfig(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  ...eslintPluginAstro.configs.recommended,
  {
    // brief/ holds user input files (any format); .vibe2prod/ holds audit output. Never lint them.
    ignores: [
      'dist/**',
      'node_modules/**',
      '.astro/**',
      'tests/fixtures/**',
      'brief/**',
      'evals/cases/*/brief/**',
      '.agents/skills/vibe2prod/**',
      '.claude/skills/vibe2prod/**',
      '.vibe2prod/**',
    ],
  },
  {
    // Node.js tooling scripts (hooks, KPI checks) run outside the browser
    files: [
      '.claude/**/*.mjs',
      'scripts/**/*.mjs',
      'tests/**/*.mjs',
      'eslint.config.mjs',
      'astro.config.mjs',
    ],
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
