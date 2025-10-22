import configPrettier from 'eslint-config-prettier';
import prettier from 'eslint-plugin-prettier';
import tseslint from 'typescript-eslint';

export default [
  {
    ignores: ['dist', 'node_modules', 'coverage', 'example', 'eslint.config.*'],
  },
  // Base JS recs off by default to avoid linting config files; enable if you add src JS files
  // js.configs.recommended,
  ...tseslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        // Enable typed rules without specifying a fixed tsconfig; uses workspace service
        projectService: true,
      },
    },
    plugins: {
      prettier,
      '@typescript-eslint': tseslint.plugin,
    },
    rules: {
      'prettier/prettier': 'error',
      'no-console': 'off',
      '@typescript-eslint/restrict-template-expressions': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-floating-promises': 'off',
      '@typescript-eslint/no-unsafe-enum-comparison': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { fixStyle: 'inline-type-imports' },
      ],

      // Enforce member ordering according to project guidelines
      '@typescript-eslint/member-ordering': [
        'error',
        {
          default: {
            order: 'as-written',
            memberTypes: [
              // 1. Static & private fields first (also protected fields)
              'private-static-field',
              'protected-static-field',
              'private-instance-field',
              'protected-instance-field',
              // 2. Static methods
              'private-static-method',
              'protected-static-method',
              'public-static-method',
              // 3. Constructor
              'constructor',
              // 4. Getters and setters
              'public-get',
              'public-set',
              'protected-get',
              'protected-set',
              'private-get',
              'private-set',
              // 5-7. Public, protected, private methods
              'public-instance-method',
              'protected-instance-method',
              'private-instance-method',
              'public-method',
              'protected-method',
              'private-method',
              // 8. Abstract methods (if any)
              'abstract-method',
            ],
          },
        },
      ],

      // Naming conventions per project guidelines
      '@typescript-eslint/naming-convention': [
        'error',
        // Types, classes, interfaces, enums
        { selector: 'typeLike', format: ['PascalCase'] },
        // Default variables/functions: camelCase
        { selector: 'variable', format: ['camelCase', 'UPPER_CASE'] },
        { selector: 'function', format: ['camelCase'] },
        // Exported consts (global constants functions): camelCase
        {
          selector: 'variable',
          modifiers: ['const', 'exported', 'function'],
          format: ['camelCase'],
          leadingUnderscore: 'forbid',
        },
        // Exported consts (global constants): UPPER_CASE
        {
          selector: 'variable',
          modifiers: ['const', 'exported'],
          format: ['UPPER_CASE'],
          leadingUnderscore: 'forbid',
        },
        // Protected members must start with underscore and be camelCase otherwise
        {
          selector: ['classProperty', 'property'],
          modifiers: ['protected'],
          format: ['camelCase'],
          leadingUnderscore: 'require',
        },
        {
          selector: ['classMethod', 'method'],
          modifiers: ['protected'],
          format: ['camelCase'],
          leadingUnderscore: 'require',
        },
      ],

      // Forbid public class fields; prefer getters/setters, protected _name, or #private
      'no-restricted-syntax': [
        'error',
        {
          selector: "PropertyDefinition[accessibility='public']",
          message:
            'Public class fields are not allowed. Use getters/setters, protected _name, or #private.',
        },
        {
          selector:
            "PropertyDefinition[key.type='Identifier']:not([accessibility='protected'])",
          message:
            'Public class fields are not allowed. Use getters/setters, protected _name, or #private.',
        },
        {
          selector: "PropertyDefinition[accessibility='private']",
          message:
            'Use JS private fields (#name) instead of TypeScript private accessibility.',
        },
        {
          selector: "MethodDefinition[accessibility='private']",
          message:
            'Use JS private methods (#method) instead of TypeScript private accessibility.',
        },
      ],
    },
  },
  // Disable any formatting rules that may conflict with Prettier
  configPrettier,
];
