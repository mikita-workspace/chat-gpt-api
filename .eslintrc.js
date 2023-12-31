module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint/eslint-plugin', 'simple-import-sort', 'file-progress'],
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  ignorePatterns: ['.eslintrc.js', '**/scripts/*.js'],
  rules: {
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    'no-var': 'error',
    'no-debugger': 'off',
    'no-shadow': 'off',
    '@typescript-eslint/no-shadow': 'error',
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': 'error',
    'no-unused-expressions': 'off',
    '@typescript-eslint/no-unused-expressions': ['error'],
    'import/extensions': 'off',
    'import/prefer-default-export': 'off',
    'no-console': 1,
    'import/no-extraneous-dependencies': 'off',
    'prettier/prettier': ['error'],
    'simple-import-sort/imports': 'error',
    'simple-import-sort/exports': 'error',
    'file-progress/activate': 1,
  },
};
