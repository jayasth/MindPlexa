module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'next/core-web-vitals'
  ],
  overrides: [
    {
      files: ['.eslintrc.{js,cjs}', 'server/**/*.js'],
      env: {
        node: true
      },
      parserOptions: {
        sourceType: 'script'
      },
      rules: {
        '@typescript-eslint/no-var-requires': 'off'
      }
    }
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true
    },
    ecmaVersion: 2022,
    sourceType: 'module'
  },
  plugins: ['@typescript-eslint', 'react', 'react-hooks'],
  rules: {
    'no-case-declarations': 'off',
    '@typescript-eslint/no-explicit-any': 'error',
    'react-hooks/rules-of-hooks': 'error',
    'react/no-unescaped-entities': ['error', { forbid: ['>', '}'] }],
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'prefer-const': 'error',
    'react-hooks/exhaustive-deps': 'warn'
  },
  globals: {
    process: 'readonly'
  }
};
