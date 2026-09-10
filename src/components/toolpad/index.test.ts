import { describe, it, expect, vi } from 'vitest';

// Moquer le routing interne pour couper la dépendance vers next-intl/navigation
vi.mock('@/i18n/routing', () => ({
    Link: () => null,
    redirect: vi.fn(),
    usePathname: () => '',
    useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
    getPathname: vi.fn(),
}));

import * as toolpad from './index';

describe('toolpad barrel file', () => {
    it('re-exports DashboardLayout, DashboardSidebar and DashboardAppProvider', () => {
        expect(toolpad.DashboardLayout).toBeDefined();
        expect(toolpad.DashboardSidebar).toBeDefined();
        expect(toolpad.DashboardAppProvider).toBeDefined();
    });

    it('exports each as a function component', () => {
        expect(typeof toolpad.DashboardLayout).toBe('function');
        expect(typeof toolpad.DashboardSidebar).toBe('function');
        expect(typeof toolpad.DashboardAppProvider).toBe('function');
    });
});