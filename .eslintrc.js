const OFF = 0,
  WARN = 1,
  ERROR = 2

module.exports = {
  parser: '@typescript-eslint/parser',
  extends: ['plugin:@typescript-eslint/recommended', 'prettier'],
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint', 'prettier', 'simple-import-sort', 'sort-class-members'],
  rules: {
    'prettier/prettier': ERROR,
    eqeqeq: ERROR,
    'no-console': ERROR,
    '@typescript-eslint/no-namespace': OFF,
    '@typescript-eslint/member-delimiter-style': [
      WARN,
      {
        multiline: { delimiter: 'none' },
        singleline: { delimiter: 'semi' },
      },
    ],
    'simple-import-sort/sort': ERROR,
    '@typescript-eslint/no-explicit-any': [
      ERROR,
      {
        ignoreRestArgs: true,
      },
    ],
    'sort-class-members/sort-class-members': [
      ERROR,
      {
        order: [
          '[static-properties]',
          '[static-methods]',
          '[properties]',
          'constructor',
          '[public-methods]',
          '[arrow-function-properties]',
          '[private-methods]',
        ],
        accessorPairPositioning: 'getThenSet',
      },
    ],
    '@typescript-eslint/no-empty-interface': OFF,
    '@typescript-eslint/array-type': [
      ERROR,
      {
        default: 'generic',
      },
    ],
    "@typescript-eslint/explicit-function-return-type": ERROR
  },
}
