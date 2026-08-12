import { defineConfig } from 'vitest/config';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
    test: {
        environment: 'jsdom',
        globals: true,
        setupFiles: ['./src/test/setup.ts'],
        include: ['src/**/*.test.ts', 'src/**/*.test.tsx', 'scripts/**/*.test.ts'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'html', 'lcov'],
            include: ['src/**/*.{ts,tsx}', 'scripts/**/*.ts'],
            exclude: ['**/*.test.ts', '**/*.test.tsx', '**/*.d.ts'],
        },
        env: {
            NEXT_PUBLIC_SUPABASE_URL: 'https://placeholder.supabase.co',
            NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'placeholder-key',
        },
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
});