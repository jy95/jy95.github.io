import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

let mockPathname = '/games';
let mockDrawerOpen = true;

vi.mock('@/i18n/routing', () => ({
    usePathname: () => mockPathname,
    Link: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>,
}));

vi.mock('next-intl', () => ({
    useTranslations: () => (key: string) => key,
}));

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
});
