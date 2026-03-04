import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import antfu from '@antfu/eslint-config';
import boundaries from 'eslint-plugin-boundaries';
import jsdoc from 'eslint-plugin-jsdoc';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import playwright from 'eslint-plugin-playwright';
import storybook from 'eslint-plugin-storybook';
import tailwind from 'eslint-plugin-tailwindcss';

export default antfu(
  {
    react: true,
    nextjs: true,
    typescript: true,

    // Configuration preferences
    lessOpinionated: true,
    isInEditor: false,

    // Code style
    stylistic: {
      semi: true,
    },

    // Format settings
    formatters: {
      css: true,
    },

    // Ignored paths
    ignores: [
      'migrations/**/*',
      'docs/**',
      '**/*.md',
      'lighthouserc.js',
    ],
  },
  // --- Accessibility Rules ---
  jsxA11y.flatConfigs.recommended,
  // --- Tailwind CSS Rules ---
  ...tailwind.configs['flat/recommended'],
  {
    settings: {
      tailwindcss: {
        config: `${dirname(fileURLToPath(import.meta.url))}/src/styles/global.css`,
      },
    },
  },
  // --- E2E Testing Rules ---
  {
    files: [
      '**/*.spec.ts',
      '**/*.e2e.ts',
    ],
    ...playwright.configs['flat/recommended'],
  },
  // --- Storybook Rules ---
  ...storybook.configs['flat/recommended'],
  // --- Custom Rule Overrides ---
  {
    rules: {
      // --- JSDoc Rules ---
      // To avoid redefine errors with Antfu, JSDoc rules are added here
      ...jsdoc.configs['flat/recommended-typescript'].rules,

      'antfu/no-top-level-await': 'off', // Allow top-level await
      'style/brace-style': ['error', '1tbs'], // Use the default brace style
      'ts/consistent-type-definitions': ['error', 'type'], // Use `type` instead of `interface`
      'react/prefer-destructuring-assignment': 'off', // Vscode doesn't support automatically destructuring, it's a pain to add a new variable
      'react-hooks/incompatible-library': 'off', // Disable warning for compilation skipped
      'react-hooks/exhaustive-deps': 'error', // Enforce full effect dependencies
      'node/prefer-global/process': 'off', // Allow using `process.env`
      'ts/no-explicit-any': 'error', // Disallow `any`
      'test/padding-around-all': 'error', // Add padding in test files
      'test/prefer-lowercase-title': 'off', // Allow using uppercase titles in test titles
      'jsdoc/require-jsdoc': 'off', // JSDoc comments are optional
      'jsdoc/require-returns': 'off', // Return types are optional
      'jsdoc/require-hyphen-before-param-description': 'error', // Enforce hyphen before param description
      'no-await-in-loop': 'error',
      'require-await': 'warn', // async function that never awaits anything = probably a mistake
      'no-async-promise-executor': 'error', // Catches new Promise(async (resolve) => ...) anti-pattern
      'no-promise-executor-return': 'error', // Catches returning a value inside a Promise executor
      'no-return-await': 'warn', // Avoids redundant `return await value` outside of try/catch

    },
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    plugins: {
      boundaries,
    },
    settings: {
      'boundaries/include': ['src/**/*.{ts,tsx}'],
      'boundaries/elements': [
        { type: 'app', pattern: 'src/app/**' },
        { type: 'modules', pattern: 'src/modules/**' },
        { type: 'server', pattern: 'src/server/**' },
        { type: 'shared', pattern: 'src/shared/**' },
      ],
    },
    rules: {
      'boundaries/element-types': ['error', {
        default: 'allow',
        rules: [
          { from: 'shared', disallow: ['modules', 'app', 'server'] },
          { from: 'modules', disallow: ['app'] },
          { from: 'server', disallow: ['app'] },
          { from: 'app', allow: ['app', 'modules', 'server', 'shared'] },
        ],
      }],
    },
  },
  // Ensure docs and markdown are never linted as code
  {
    ignores: ['**/docs/**', '**/*.md', '**/lighthouserc.js', '**/postcss.config.mjs'],
  },
);
