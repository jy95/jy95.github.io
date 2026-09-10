import { describe, it, expect, vi } from 'vitest';

// Empeche createNavigation de charger next/navigation
vi.mock('next-intl/navigation', () => ({
    defineRouting: (config: unknown) => config,
    createNavigation: () => ({
        Link: vi.fn(),
        redirect: vi.fn(),
        usePathname: vi.fn(),
        useRouter: vi.fn(),
        getPathname: vi.fn(),
    }),
}));

import { routing } from './routing';

describe('i18n routing config', () => {
    it('supports exactly fr and en locales', () => {
        expect(routing.locales).toEqual(['fr', 'en']);
    });

    it('defaults to fr', () => {
        expect(routing.defaultLocale).toBe('fr');
    });

    it('uses as-needed locale prefixing', () => {
        expect(routing.localePrefix).toBe('as-needed');
    });

    it('defines non-empty pathnames configuration', () => {
        expect(Object.keys(routing.pathnames)).not.toHaveLength(0);
    });
});