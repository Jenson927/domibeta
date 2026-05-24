import js from '@eslint/js'
import pluginVue from 'eslint-plugin-vue'
import tseslint from '@typescript-eslint/eslint-plugin'
import tsparser from '@typescript-eslint/parser'

export default [
  js.configs.recommended,
  ...pluginVue.configs['flat/recommended'],
  // TypeScript files
  {
    files: ['**/*.ts'],
    plugins: {
      '@typescript-eslint': tseslint,
    },
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
      globals: {
        document: 'readonly',
        localStorage: 'readonly',
        console: 'readonly',
        Blob: 'readonly',
        URL: 'readonly',
        File: 'readonly',
        FileReader: 'readonly',
        HTMLElement: 'readonly',
        HTMLCanvasElement: 'readonly',
        HTMLInputElement: 'readonly',
        CanvasRenderingContext2D: 'readonly',
        MouseEvent: 'readonly',
        TouchEvent: 'readonly',
        EventTarget: 'readonly',
        Event: 'readonly',
        Image: 'readonly',
        window: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        requestAnimationFrame: 'readonly',
        cancelAnimationFrame: 'readonly',
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      'no-undef': 'off',
    },
  },
  // Vue files: TypeScript parser inside <script lang="ts">
  {
    files: ['**/*.vue'],
    languageOptions: {
      parserOptions: {
        parser: tsparser,
      },
      globals: {
        document: 'readonly',
        localStorage: 'readonly',
        console: 'readonly',
        Blob: 'readonly',
        URL: 'readonly',
        File: 'readonly',
        FileReader: 'readonly',
        HTMLElement: 'readonly',
        HTMLCanvasElement: 'readonly',
        HTMLInputElement: 'readonly',
        CanvasRenderingContext2D: 'readonly',
        MouseEvent: 'readonly',
        TouchEvent: 'readonly',
        EventTarget: 'readonly',
        Event: 'readonly',
        Image: 'readonly',
        confirm: 'readonly',
        alert: 'readonly',
        prompt: 'readonly',
        location: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        window: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        requestAnimationFrame: 'readonly',
        cancelAnimationFrame: 'readonly',
      },
    },
    rules: {
      'vue/multi-word-component-names': 'off',
      // Disable pedantic formatting rules — project uses compact single-line style
      'vue/max-attributes-per-line': 'off',
      'vue/singleline-html-element-content-newline': 'off',
      'vue/html-self-closing': 'off',
      'vue/html-indent': 'off',
      'vue/first-attribute-linebreak': 'off',
      'vue/html-closing-bracket-newline': 'off',
      'vue/attributes-order': 'off',
      'vue/multiline-html-element-content-newline': 'off',
      // Computed side effects: intentional lazy-init pattern for per-kid indices
      'vue/no-side-effects-in-computed-properties': 'off',
      // do { ... } while (true) with break is intentional random-selection loop
      'no-constant-condition': 'off',
    },
  },
  {
    ignores: ['dist/**', 'legacy/**', 'node_modules/**', '**/*.test.ts'],
  },
]