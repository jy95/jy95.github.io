import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import NavigationMenu from '@/components/dashboard/MenuEntries';
import { echoTranslations } from '@/test/mocks/nextIntl';
import type { ReactNode } from 'react';

let mockPathname = '/games';
let mockDrawerOpen = true;

vi.mock('@/i18n/routing', () => ({
    usePathname: () => mockPathname,
    Link: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>,
}));

vi.mock('next-intl', () => echoTranslations());

vi.mock('../provider/useAppContext', () => ({
    useAppContext: () => ({ drawerOpen: mockDrawerOpen }),
}));

// Stub NavigationItem so we can assert exactly what NavigationGroup computed
// and passed down, without needing to exercise MUI's ListItemButton/Popper
// machinery in this test.
vi.mock('./NavigationItem', () => ({
    default: (props: {
        title: string;
        href?: string;
        selected: boolean;
        onClick?: () => void;
        hasChildren?: boolean;
        expanded?: boolean;
        miniPopoverContent?: ReactNode;
    }) => (
        <div
            data-testid="nav-item"
            data-title={props.title}
            data-href={props.href ?? ''}
            data-selected={String(props.selected)}
            data-haschildren={String(props.hasChildren)}
            data-expanded={String(props.expanded)}
        >
            {props.hasChildren && !props.href && <button onClick={props.onClick}>toggle</button>}
            {props.hasChildren && props.href && props.miniPopoverContent}
        </div>
    ),
}));

import NavigationGroup from './NavigationGroup';
import type { NavigationItem as Item } from '../types';

describe('NavigationGroup', () => {
    beforeEach(() => {
        mockPathname = '/games';
        mockDrawerOpen = true;
    });

    it('renders a leaf item with its href set to the joined parent path + segment', () => {
        const item: Item = { titleKey: 'gamesTabs.grid', segment: 'grid' };
        render(<NavigationGroup item={item} parentPath="/games" />);
        expect(screen.getByTestId('nav-item')).toHaveAttribute('data-href', '/games/grid');
    });

    it('marks a leaf item selected when the pathname matches it exactly', () => {
        mockPathname = '/games/grid';
        const item: Item = { titleKey: 'gamesTabs.grid', segment: 'grid' };
        render(<NavigationGroup item={item} parentPath="/games" />);
        expect(screen.getByTestId('nav-item')).toHaveAttribute('data-selected', 'true');
    });

    it('does not mark a leaf item selected when the pathname differs', () => {
        mockPathname = '/backlog';
        const item: Item = { titleKey: 'gamesTabs.grid', segment: 'grid' };
        render(<NavigationGroup item={item} parentPath="/games" />);
        expect(screen.getByTestId('nav-item')).toHaveAttribute('data-selected', 'false');
    });

    it('gives a group item no href (so it toggles instead of navigating) when the drawer is expanded', () => {
        const item: Item = {
            titleKey: 'tierTabs',
            segment: 'tier',
            children: [{ titleKey: 'gamesTabs.grid', segment: 'games' }],
        };
        render(<NavigationGroup item={item} parentPath="" />);
        expect(screen.getByTestId('nav-item')).toHaveAttribute('data-href', '');
        expect(screen.getByTestId('nav-item')).toHaveAttribute('data-haschildren', 'true');
    });

    it('starts collapsed and mounts child NavigationGroups only after the toggle is clicked', () => {
        const item: Item = {
            titleKey: 'tierTabs',
            segment: 'tier',
            children: [{ titleKey: 'gamesTabs.grid', segment: 'games' }],
        };
        render(<NavigationGroup item={item} parentPath="" />);
        expect(screen.getAllByTestId('nav-item')).toHaveLength(1);

        fireEvent.click(screen.getByText('toggle'));
        expect(screen.getAllByTestId('nav-item')).toHaveLength(2);
    });

    it('auto-expands when a descendant route is already active', () => {
        mockPathname = '/tier/games';
        const item: Item = {
            titleKey: 'tierTabs',
            segment: 'tier',
            children: [{ titleKey: 'gamesTabs.grid', segment: 'games' }],
        };
        render(<NavigationGroup item={item} parentPath="" />);
        const parentNavItem = screen.getAllByTestId('nav-item')[0];
        expect(parentNavItem).toHaveAttribute('data-expanded', 'true');
    });

    it('highlights the mini-mode parent when a child route is active and the drawer is collapsed', () => {
        mockDrawerOpen = false;
        mockPathname = '/tier/games';
        const item: Item = {
            titleKey: 'tierTabs',
            segment: 'tier',
            children: [{ titleKey: 'gamesTabs.grid', segment: 'games' }],
        };
        render(<NavigationGroup item={item} parentPath="" />);
        expect(screen.getAllByTestId('nav-item')[0]).toHaveAttribute('data-selected', 'true');
    });

    it('never highlights the group item itself in expanded mode, even with an active child', () => {
        mockDrawerOpen = true;
        mockPathname = '/tier/games';
        const item: Item = {
            titleKey: 'tierTabs',
            segment: 'tier',
            children: [{ titleKey: 'gamesTabs.grid', segment: 'games' }],
        };
        render(<NavigationGroup item={item} parentPath="" />);
        expect(screen.getAllByTestId('nav-item')[0]).toHaveAttribute('data-selected', 'false');
    });

    it('does not treat a route that only starts with the item path as a leaf match without a segment boundary', () => {
        mockPathname = '/gamesbacklog';
        const item: Item = { titleKey: 'gamesTabs.grid', segment: 'games' };
        render(<NavigationGroup item={item} parentPath="" />);
        expect(screen.getByTestId('nav-item')).toHaveAttribute('data-selected', 'false');
    });

    it('keeps each child group expanded state with its route when children reorder', () => {
        mockPathname = '/tier';
        const defaultGroup: Item = {
            titleKey: 'gamesTabs.grid',
            children: [{ titleKey: 'gamesTabs.list', segment: 'series' }],
        };
        const gamesGroup: Item = {
            titleKey: 'gamesTabs.grid',
            segment: 'games',
            children: [{ titleKey: 'gamesTabs.list', segment: 'series' }],
        };
        const item: Item = {
            titleKey: 'tierTabs',
            segment: 'tier',
            children: [defaultGroup, gamesGroup],
        };
        const groups = () => screen.getAllByTestId('nav-item')
            .filter((node) => node.getAttribute('data-haschildren') === 'true');
        const { rerender } = render(<NavigationGroup item={item} />);

        fireEvent.click(within(groups()[1]).getByRole('button', { name: 'toggle' }));
        expect(groups()[1]).toHaveAttribute('data-expanded', 'true');
        expect(groups()[2]).toHaveAttribute('data-expanded', 'false');

        rerender(<NavigationGroup item={{ ...item, children: [gamesGroup, defaultGroup] }} />);

        expect(groups()[1]).toHaveAttribute('data-expanded', 'false');
        expect(groups()[2]).toHaveAttribute('data-expanded', 'true');
        const leaf = screen.getAllByTestId('nav-item')
            .find((node) => node.getAttribute('data-href') === '/tier/series');
        expect(leaf).toBeInTheDocument();
    });

    it('renders a mini-popover child without a segment at the parent route', () => {
        mockDrawerOpen = false;
        const item: Item = {
            titleKey: 'gamesKey',
            segment: 'games',
            children: [
                { titleKey: 'gamesTabs.grid' },
                { titleKey: 'gamesTabs.grid', segment: 'series' },
            ],
        };
        const { rerender } = render(<NavigationGroup item={item} />);
        const links = screen.getAllByRole('link');
        expect(links.map((link) => link.getAttribute('href')))
            .toEqual(['/games', '/games/series']);

        rerender(<NavigationGroup item={{ ...item, children: [...(item.children ?? [])].reverse() }} />);

        const reorderedLinks = screen.getAllByRole('link');
        expect(reorderedLinks.map((link) => link.getAttribute('href')))
            .toEqual(['/games/series', '/games']);
        expect(reorderedLinks[0]).toBe(links[1]);
        expect(reorderedLinks[1]).toBe(links[0]);
    });

    it.each([true, false])('renders the current navigation without key warnings when drawerOpen=%s', (drawerOpen) => {
        mockDrawerOpen = drawerOpen;
        const consoleError = vi.spyOn(console, 'error');
        try {
            for (const item of NavigationMenu()) {
                mockPathname = '/unrelated';
                const { unmount } = render(<NavigationGroup item={item} />);
                if (drawerOpen && item.children?.length) {
                    fireEvent.click(screen.getByRole('button', { name: 'toggle' }));
                    expect(screen.getAllByTestId('nav-item')).toHaveLength(item.children.length + 1);
                } else if (!drawerOpen && item.children?.length) {
                    expect(screen.getAllByRole('link')).toHaveLength(item.children.length);
                }
                unmount();
            }
            const keyWarnings = consoleError.mock.calls.filter((args) =>
                args.some((arg) => typeof arg === 'string' && /unique.*key|same key/i.test(arg)));
            expect(keyWarnings).toEqual([]);
        } finally {
            consoleError.mockRestore();
        }
    });
});
