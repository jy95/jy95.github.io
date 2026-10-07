import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import type { ComponentProps } from 'react';
import NavigationMenu from '@/components/dashboard/MenuEntries';
import NavigationGroup from './NavigationGroup';

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

    it('preserves manual collapse until the active destination changes', () => {
        pathname = '/tier/games';
        const item = NavigationMenu()[1];
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
        render(<NavigationGroup item={NavigationMenu()[1]} mini={mini} />);
        const opinions = screen.getByRole('button', { name: 'dashboard.menuEntries.sections.opinions' });
        fireEvent.click(opinions);
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
        render(<NavigationGroup item={NavigationMenu()[1]} mini={false} />);
        for (const button of screen.getAllByRole('button')) {
            expect(button).toHaveClass('Mui-selected');
            expect(button).toHaveAttribute('aria-expanded', 'true');
            expect(button).not.toHaveAttribute('aria-current');
        }
        expect(screen.getByRole('link', { name: 'dashboard.menuEntries.tierChildren.games' })).toHaveAttribute('aria-current', 'page');
        expect(document.querySelectorAll('[aria-current="page"]')).toHaveLength(1);
    });
    it('keeps nested disclosure state when children reorder', () => {
        const item = NavigationMenu()[1];
        if (item.kind !== "group") throw new Error("Expected Opinions group");
        const { rerender } = render(<NavigationGroup item={item} mini={false} />);
        fireEvent.click(screen.getByRole('button', { name: 'dashboard.menuEntries.sections.opinions' }));
        const tier = screen.getByRole('button', { name: 'dashboard.menuEntries.tierTabs' });
        fireEvent.click(tier);
        const childrenId = tier.getAttribute('aria-controls');
        rerender(<NavigationGroup item={{ ...item, children: [...(item.children ?? [])].reverse() }} mini={false} />);
        expect(screen.getByRole('button', { name: 'dashboard.menuEntries.tierTabs' })).toHaveAttribute('aria-expanded', 'true');
        expect(screen.getByRole('button', { name: 'dashboard.menuEntries.tierTabs' })).toHaveAttribute('aria-controls', childrenId);
        expect(screen.getByRole('link', { name: 'dashboard.menuEntries.tierChildren.games' })).toHaveAttribute('href', '/tier/games');
    });

});
