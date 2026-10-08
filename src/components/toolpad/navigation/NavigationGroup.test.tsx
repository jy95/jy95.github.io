import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import type { ComponentProps } from 'react';
import NavigationMenu from '@/components/dashboard/MenuEntries';
import NavigationGroup from './NavigationGroup';
import type { NavigationPresentationGroup } from '../types';

function rankingsGroup() {
    const item = NavigationMenu().find(item => item.kind === 'group' && item.id === 'opinions');
    if (!item || item.kind !== 'group') throw new Error('Expected rankings group');
    return item;
}

function nestedFixture(): NavigationPresentationGroup {
    return { kind: 'group', id: 'fixture', titleKey: 'sections.browse', icon: <span />, children: [
        { path: '/tests', titleKey: 'testsKey' },
        { kind: 'group', id: 'nested', titleKey: 'tierTabs', icon: <span />, children: [
            { path: '/tier/games', titleKey: 'tierChildren.games', hintKey: 'hints.tierGames' },
            { path: '/tier/backlog', titleKey: 'tierChildren.backlog', hintKey: 'hints.tierBacklog' },
            { path: '/tier/tests', titleKey: 'tierChildren.tests', hintKey: 'hints.tierTests' },
        ] },
    ] };
}

let pathname = '/unrelated';
vi.mock('@/i18n/routing', () => ({
    usePathname: () => pathname,
    Link: ({ children, href, ...rest }: ComponentProps<'a'>) => <a href={href} {...rest}>{children}</a>,
}));
vi.mock('next-intl', async () => {
    const { echoTranslations } = await import('@/test/mocks/nextIntl');
    return echoTranslations();
});
vi.mock('../provider/useAppContext', () => ({ useAppContext: () => ({ drawerOpen: true }) }));

describe('NavigationGroup', () => {
    beforeEach(() => { pathname = '/unrelated'; });

    it('keeps nested disclosure state mounted after mini popup dismissal', () => {
        render(<NavigationGroup item={nestedFixture()} mini />);
        const parent = screen.getByRole('button', { name: 'dashboard.menuEntries.sections.browse' });
        fireEvent.click(parent);
        const nested = screen.getByRole('button', { name: 'dashboard.menuEntries.tierTabs' });
        fireEvent.click(nested);
        const games = screen.getByRole('link', { name: 'dashboard.menuEntries.tierChildren.games' });
        fireEvent.keyDown(games, { key: 'Escape' });
        expect(parent).toHaveFocus();
        expect(parent).toHaveAttribute('aria-expanded', 'false');
        fireEvent.click(parent);
        expect(screen.getByRole('button', { name: 'dashboard.menuEntries.tierTabs' })).toBe(nested);
        expect(nested).toHaveAttribute('aria-expanded', 'true');
        expect(screen.getByRole('link', { name: 'dashboard.menuEntries.tierChildren.games' })).toBe(games);
    });

    it('preserves manual collapse between descendants and reopens on re-entry', () => {
        pathname = '/tier/games';
        const item = rankingsGroup();
        const { rerender } = render(<NavigationGroup item={item} />);
        const tier = screen.getByRole('button', { name: 'dashboard.menuEntries.tierTabs' });
        const childrenId = tier.getAttribute('aria-controls');
        fireEvent.click(tier);
        expect(tier).toHaveAttribute('aria-expanded', 'false');
        expect(document.getElementById(childrenId ?? '')).toBeInTheDocument();
        rerender(<NavigationGroup item={item} />);
        expect(tier).toHaveAttribute('aria-expanded', 'false');
        pathname = '/tier/backlog';
        rerender(<NavigationGroup item={item} />);
        expect(tier).toHaveAttribute('aria-expanded', 'false');
        expect(tier).toHaveClass('Mui-selected');
        expect(screen.getByRole('link', { name: 'dashboard.menuEntries.tierChildren.backlog', hidden: true })).toHaveAttribute('aria-current', 'page');
        pathname = '/unrelated';
        rerender(<NavigationGroup item={item} />);
        expect(tier).toHaveAttribute('aria-expanded', 'false');
        expect(tier).not.toHaveClass('Mui-selected');
        pathname = '/tier/backlog';
        rerender(<NavigationGroup item={item} />);
        expect(tier).toHaveAttribute('aria-expanded', 'true');
        expect(screen.getByRole('link', { name: 'dashboard.menuEntries.tierChildren.backlog' })).toHaveAttribute('aria-current', 'page');
    });

    it('supports standalone relative destinations and section mini overrides', () => {
        pathname = '/tier/games';
        const { rerender } = render(<NavigationGroup item={{ titleKey: 'gamesKey', segment: 'games' }} parentPath="/tier" />);
        expect(screen.getByRole('link')).toHaveAttribute('href', '/tier/games');
        expect(screen.getByRole('link')).toHaveAttribute('aria-current', 'page');
        const section = { kind: 'section', titleKey: 'sections.browse' } as const;
        rerender(<NavigationGroup item={section} mini={false} />);
        expect(screen.getByText('dashboard.menuEntries.sections.browse')).toBeInTheDocument();
        rerender(<NavigationGroup item={section} mini />);
        expect(screen.queryByText('dashboard.menuEntries.sections.browse')).not.toBeInTheDocument();
        expect(screen.getByRole('separator')).toBeInTheDocument();
    });

    it.each([false, true])('supports nested Tier lists with mini=%s without group links', async (mini) => {
        render(<NavigationGroup item={nestedFixture()} mini={mini} />);
        const parent = screen.getByRole('button', { name: 'dashboard.menuEntries.sections.browse' });
        fireEvent.click(parent);
        const tier = await screen.findByRole('button', { name: 'dashboard.menuEntries.tierTabs' });
        expect(tier).toHaveAttribute('aria-expanded', 'false');
        fireEvent.click(tier);
        expect(tier).toHaveAttribute('aria-expanded', 'true');
        const games = screen.getByRole('link', { name: 'dashboard.menuEntries.tierChildren.games' });
        expect(games).toHaveAttribute('href', '/tier/games');
        expect(games).toHaveAccessibleDescription('dashboard.menuEntries.hints.tierGames');
        expect(document.getElementById(tier.getAttribute('aria-controls') ?? '')).toContainElement(games);
        expect(screen.getAllByRole('link').map(link => link.getAttribute('href'))).toEqual(['/tests', '/tier/games', '/tier/backlog', '/tier/tests']);
    });

    it('opens and highlights active ancestors but assigns aria-current only to the destination', () => {
        pathname = '/tier/games/details';
        render(<NavigationGroup item={rankingsGroup()} mini={false} />);
        for (const button of screen.getAllByRole('button')) {
            expect(button).toHaveClass('Mui-selected');
            expect(button).toHaveAttribute('aria-expanded', 'true');
            expect(button).not.toHaveAttribute('aria-current');
        }
        expect(screen.getByRole('link', { name: 'dashboard.menuEntries.tierChildren.games' })).toHaveAttribute('aria-current', 'page');
        expect(document.querySelectorAll('[aria-current="page"]')).toHaveLength(1);
    });
    it.each([false, true])('renders flat rankings with mini=%s', async (mini) => {
        render(<NavigationGroup item={rankingsGroup()} mini={mini} />);
        const tier = screen.getByRole('button', { name: 'dashboard.menuEntries.tierTabs' });
        fireEvent.click(tier);
        await screen.findByRole('link', { name: 'dashboard.menuEntries.tierChildren.games' });
        expect(screen.getAllByRole('link').map(link => link.getAttribute('href'))).toEqual(['/tier/games', '/tier/backlog', '/tier/tests']);
        const children = document.getElementById(tier.getAttribute('aria-controls') ?? '');
        if (!children) throw new Error('Expected rankings child list');
        expect(within(children).queryAllByRole('button')).toHaveLength(0);
    });

    it('preserves rankings disclosure and mounted links when destinations reorder', () => {
        const item = rankingsGroup();
        const { rerender } = render(<NavigationGroup item={item} mini={false} />);
        const tier = screen.getByRole('button', { name: 'dashboard.menuEntries.tierTabs' });
        fireEvent.click(tier);
        const games = screen.getByRole('link', { name: 'dashboard.menuEntries.tierChildren.games' });
        const childrenId = tier.getAttribute('aria-controls');
        rerender(<NavigationGroup item={{ ...item, children: [...item.children].reverse() }} mini={false} />);
        expect(tier).toHaveAttribute('aria-expanded', 'true');
        expect(tier).toHaveAttribute('aria-controls', childrenId);
        expect(screen.getByRole('link', { name: 'dashboard.menuEntries.tierChildren.games' })).toBe(games);
    });

    it('keeps nested disclosure state when children reorder', () => {
        const item = nestedFixture();
        const { rerender } = render(<NavigationGroup item={item} mini={false} />);
        fireEvent.click(screen.getByRole('button', { name: 'dashboard.menuEntries.sections.browse' }));
        const tier = screen.getByRole('button', { name: 'dashboard.menuEntries.tierTabs' });
        fireEvent.click(tier);
        const childrenId = tier.getAttribute('aria-controls');
        rerender(<NavigationGroup item={{ ...item, children: [...(item.children ?? [])].reverse() }} mini={false} />);
        expect(screen.getByRole('button', { name: 'dashboard.menuEntries.tierTabs' })).toHaveAttribute('aria-expanded', 'true');
        expect(screen.getByRole('button', { name: 'dashboard.menuEntries.tierTabs' })).toHaveAttribute('aria-controls', childrenId);
        expect(screen.getByRole('link', { name: 'dashboard.menuEntries.tierChildren.games' })).toHaveAttribute('href', '/tier/games');
    });

});
