import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';

import type { ComponentProps } from 'react';

vi.mock('@/i18n/routing', () => ({
    Link: ({ children, href, ...rest }: ComponentProps<'a'>) => (
        <a href={href} {...rest}>{children}</a>
    ),
    usePathname: () => '/games',
}));

vi.mock('./provider/useAppContext', () => ({
    useAppContext: () => ({ drawerOpen: false, navigation: [] }),
}));

afterEach(() => {
    cleanup();
    vi.doUnmock('./DashboardSidebar');
    vi.resetModules();
});

describe('drawer constants module loading', () => {
    it('loads navigation modules without depending on DashboardSidebar', async () => {
        vi.resetModules();
        vi.doMock('./DashboardSidebar', () => {
            throw new Error('Navigation must not load DashboardSidebar for drawer constants');
        });

        const { DRAWER_WIDTH, MINI_DRAWER_WIDTH } = await import('./drawerConstants');
        expect(DRAWER_WIDTH).toBe(320);
        expect(MINI_DRAWER_WIDTH).toBe(84);
        expect((await import('./DashboardNavigation')).default).toBeTypeOf('function');
        expect((await import('./navigation/NavigationItem')).default).toBeTypeOf('function');
    });

    it('initializes the mini caption width when the sidebar is imported first', async () => {
        // A fresh sidebar-first import exercises the original initialization cycle:
        // Sidebar -> Navigation -> Group -> Item -> Sidebar.
        vi.resetModules();
        await import('./DashboardSidebar');
        const { default: NavigationItem } = await import('./navigation/NavigationItem');

        render(<NavigationItem title="Games Library" selected={false} />);

        expect(getComputedStyle(screen.getByText('Games Library')).maxWidth).toBe('56px');
    });
});
