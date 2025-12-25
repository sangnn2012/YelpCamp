// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt({
  rules: {
    // Vue rules
    'vue/multi-word-component-names': 'off',
    'vue/no-multiple-template-root': 'off',
    'vue/require-default-prop': 'off',
    'vue/no-v-html': 'warn',

    // TypeScript rules
    '@typescript-eslint/no-unused-vars': ['error', {
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_'
    }],
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-non-null-assertion': 'warn',

    // General rules
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'no-debugger': 'warn',
    'prefer-const': 'error',
    'no-var': 'error',
    'eqeqeq': ['error', 'always'],
    'curly': ['error', 'all'],

    // Import rules
    'import/order': ['error', {
      'groups': [
        'builtin',
        'external',
        'internal',
        ['parent', 'sibling'],
        'index',
        'type'
      ],
      'newlines-between': 'never',
      'alphabetize': {
        order: 'asc',
        caseInsensitive: true
      }
    }]
  }
}, {
  // Test files specific rules
  files: ['tests/**/*.ts', 'tests/**/*.test.ts', 'tests/**/*.spec.ts'],
  rules: {
    '@typescript-eslint/no-explicit-any': 'off',
    'no-console': 'off'
  }
})
