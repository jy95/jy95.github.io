import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const eslintConfig = [...nextCoreWebVitals, ...nextTypescript, {
  files: [
    'src/domain/selection/**/*.{ts,tsx}',
    'src/features/selection/**/*.{ts,tsx}',
    'src/features/games/components/{CardEntry,CardGrid,GroupedGamesAccordion}.tsx',
    'src/features/games/detail/{GameToolbar,GameDetailView}.tsx',
    'src/app/api/selection/route.ts',
    'src/app/[[]locale]/selection/page.tsx',
    'src/app/[[]locale]/tier/backlog/page.tsx',
    'src/redux/services/selectionAPI.tsx',
  ],
  ignores: ['**/*.test.{ts,tsx}'],
  rules: { complexity: ['error', { max: 8 }] },
}, {
  ignores: [
    'node_modules/**',
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
  ],
}]

export default eslintConfig