import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import reactHooks from 'eslint-plugin-react-hooks'
import prettier from 'eslint-plugin-prettier'
import prettierConfig from 'eslint-config-prettier'

export default tseslint.config(
    js.configs.recommended,
    ...tseslint.configs.recommended,
    prettierConfig,
    {
        plugins: {
            'react-hooks': reactHooks,
            prettier: prettier,
        },
        rules: {
            ...reactHooks.configs.recommended.rules,

            // Let Prettier handle formatting
            'prettier/prettier': 'error',

            // Avoid issues with no-semicolon style (ASI protection)
            'no-unexpected-multiline': 'error',
        },
    },
    {
        ignores: ['dist/', 'node_modules/', '*.config.js'],
    }
)
