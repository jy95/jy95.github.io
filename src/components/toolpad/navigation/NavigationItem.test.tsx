import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act, render, screen, fireEvent, waitFor } from '@testing-library/react';

import type { ComponentProps } from 'react';

let mockDrawerOpen: boolean | undefined = true;

vi.mock('../provider/useAppContext', () => ({
    useAppContext: () => ({ drawerOpen: mockDrawerOpen }),
}));

vi.mock('@/i18n/routing', () => ({
    Link: ({ children, href, ...rest }: ComponentProps<'a'>) => (
        <a href={href} {...rest}>
            {children}
        </a>
    ),
}));

import NavigationItem from './NavigationItem';

describe('NavigationItem', () => {
    beforeEach(() => {
        mockDrawerOpen = true;
    });

    it.each([true, false])('renders an accessible badge with drawerOpen=%s', (drawerOpen) => {
        mockDrawerOpen = drawerOpen;
        render(<NavigationItem title="Selection" selected={false} href="/selection"
            badgeDescriptionId="selection-count"
            badge={<span aria-label="4 saved entries">4<span id="selection-count" hidden>4 saved entries</span></span>} />);
        expect(screen.getByLabelText('4 saved entries')).toBeInTheDocument();
        expect(screen.getByRole('link')).toContainElement(screen.getByLabelText('4 saved entries'));
        expect(screen.getByRole('link')).toHaveAccessibleName('Selection');
        expect(screen.getByRole('link')).toHaveAccessibleDescription('4 saved entries');
        expect(screen.getByRole('listitem')).toHaveStyle({ overflow: 'visible' });
    });

    it.each([false, true])('preserves link descriptions and explicit mini=%s', (mini) => {
        mockDrawerOpen = mini;
        render(<NavigationItem title="Selection" href="/selection" selected mini={mini} hint="Saved here"
            badgeDescriptionId="count" badge={<span id="count">4 saved entries</span>} />);
        const link = screen.getByRole('link');
        expect(link.tagName).toBe('A');
        expect(link).toHaveAttribute('aria-current', 'page');
        expect(link).not.toHaveAttribute('aria-expanded');
        expect(link).not.toHaveAttribute('aria-controls');
        expect(link).toHaveAccessibleDescription(mini ? '4 saved entries' : 'Saved here 4 saved entries');
        expect(link).toHaveStyle({ minHeight: mini ? '60px' : '48px' });
    });

    it('keeps disclosure attributes on the button branch', () => {
        render(<NavigationItem title="Browse" selected hasChildren expanded controlsId="children" />);
        const button = screen.getByRole('button');
        expect(button.tagName).toBe('BUTTON');
        expect(button).toHaveAttribute('type', 'button');
        expect(button).toHaveAttribute('aria-expanded', 'true');
        expect(button).toHaveAttribute('aria-controls', 'children');
        expect(button).not.toHaveAttribute('aria-current');
        expect(button).not.toHaveAttribute('href');
    });

    it('renders the title text when the drawer is expanded', () => {
        render(<NavigationItem title="Games" selected={false} />);
        expect(screen.getByText('Games')).toBeInTheDocument();
    });

    it('renders as a link when an href is provided', () => {
        render(<NavigationItem title="Games" href="/games" selected={false} />);
        expect(screen.getByRole('link')).toHaveAttribute('href', '/games');
    });

    it('does not render a link when no href is provided (group item)', () => {
        render(<NavigationItem title="Tier" selected={false} hasChildren onClick={vi.fn()} />);
        expect(screen.queryByRole('link')).not.toBeInTheDocument();
    });

    it('calls onClick when clicked and no href is set', () => {
        const onClick = vi.fn();
        render(<NavigationItem title="Tier" selected={false} hasChildren onClick={onClick} />);
        fireEvent.click(screen.getByText('Tier'));
        expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('does not call onClick when an href is provided (link handles navigation instead)', () => {
        const onClick = vi.fn();
        render(<NavigationItem title="Games" href="/games" selected={false} onClick={onClick} />);
        fireEvent.click(screen.getByText('Games'));
        expect(onClick).not.toHaveBeenCalled();
    });

    it('renders a chevron icon when hasChildren is true and the drawer is expanded', () => {
        const { container } = render(
            <NavigationItem title="Tier" selected={false} hasChildren expanded={false} />
        );
        expect(container.querySelector('[data-testid="ExpandMoreIcon"]')).toBeTruthy();
    });

    it('does not render a large chevron when hasChildren is false', () => {
        const { container } = render(<NavigationItem title="Games" selected={false} />);
        expect(container.querySelector('[data-testid="ExpandMoreIcon"]')).toBeFalsy();
    });

    it('renders an Avatar with initials derived from the title when collapsed (mini mode) with no icon', () => {
        mockDrawerOpen = false;
        render(<NavigationItem title="Games Library" selected={false} />);
        expect(screen.getByText('GL')).toBeInTheDocument();
    });

    it('derives initials from only the first two words of the title', () => {
        mockDrawerOpen = false;
        render(<NavigationItem title="A Very Long Title" selected={false} />);
        expect(screen.getByText('AV')).toBeInTheDocument();
    });

    it('still renders the provided icon in mini mode instead of the fallback avatar', () => {
        mockDrawerOpen = false;
        render(<NavigationItem title="Games" selected={false} icon={<span data-testid="custom-icon" />} />);
        expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
        expect(screen.queryByText('G')).not.toBeInTheDocument();
    });

    it('shows the title as a caption below the icon in mini mode', () => {
        mockDrawerOpen = false;
        render(<NavigationItem title="Games" selected={false} icon={<span data-testid="custom-icon" />} />);
        expect(screen.getByText('Games')).toBeInTheDocument();
    });

    it('applies the Mui-selected styling when selected is true', () => {
        render(<NavigationItem title="Games" href="/games" selected />);
        expect(screen.getByRole('link')).toHaveClass('Mui-selected');
    });

    it('does not apply the Mui-selected styling when selected is false', () => {
        render(<NavigationItem title="Games" href="/games" selected={false} />);
        expect(screen.getByRole('link')).not.toHaveClass('Mui-selected');
    });
});

describe.each([
    { variant: 'link', href: '/games' },
    { variant: 'plain', href: undefined },
])('NavigationItem shared content ($variant)', ({ href }) => {
    beforeEach(() => {
        mockDrawerOpen = true;
    });

    it('keeps the mini caption at a computed max-width of 56px', () => {
        mockDrawerOpen = false;
        render(<NavigationItem title="Games Library" href={href} selected={false} />);

        expect(getComputedStyle(screen.getByText('Games Library')).maxWidth).toBe('56px');
    });

    describe.each([
        { mode: 'expanded', drawerOpen: true, height: '48px' },
        { mode: 'mini', drawerOpen: false, height: '60px' },
    ])('$mode mode', ({ drawerOpen, height }) => {
        beforeEach(() => {
            mockDrawerOpen = drawerOpen;
        });

        it('renders a custom icon and title without fallback initials', () => {
            render(<NavigationItem title="Games Library" href={href} selected={false}
                icon={<span data-testid="custom-icon" />} />);

            expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
            expect(screen.getByText('Games Library')).toBeInTheDocument();
            expect(screen.queryByText('GL')).not.toBeInTheDocument();
        });

        it('renders the title with fallback initials only in mini mode', () => {
            render(<NavigationItem title="games library collection" href={href} selected={false} />);

            const title = screen.getByText('games library collection');
            expect(title).toBeInTheDocument();
            if (drawerOpen) {
                expect(screen.queryByText('GL')).not.toBeInTheDocument();
            } else {
                expect(screen.getByText('GL')).toHaveClass('MuiAvatar-root');
                expect(title).toHaveStyle({ position: 'absolute', fontSize: '10px',
                    transform: 'translateX(-50%)', bottom: '-18px' });
            }
        });

        it('uses the mode-specific button height and omits chevrons without children', () => {
            render(<NavigationItem title="Games" href={href} selected={false} />);

            const button = screen.getByRole(href ? 'link' : 'button');
            expect(button).toHaveStyle({ minHeight: height });
            expect(screen.queryByTestId('ExpandMoreIcon')).not.toBeInTheDocument();
        });

        it.each([false, true])('applies selected styling when selected=%s', (selected) => {
            const { rerender } = render(<NavigationItem title="Games" href={href} selected={false} />);
            const button = screen.getByRole(href ? 'link' : 'button');
            const unselectedBackground = getComputedStyle(button).backgroundColor;

            rerender(<NavigationItem title="Games" href={href} selected={selected} />);
            if (selected) {
                expect(button).toHaveClass('Mui-selected');
                expect(getComputedStyle(button).backgroundColor).not.toBe(unselectedBackground);
            } else {
                expect(button).not.toHaveClass('Mui-selected');
                expect(getComputedStyle(button).backgroundColor).toBe(unselectedBackground);
            }
        });

        it('updates the chevron rotation only in expanded mode', () => {
            const { rerender } = render(
                <NavigationItem title="Games" href={href} selected={false} hasChildren expanded={false} />
            );
            const chevron = screen.getByTestId('ExpandMoreIcon');
            expect(chevron).toHaveStyle({ transform: drawerOpen
                ? 'rotate(-90deg)' : 'translateY(-50%) rotate(-90deg)' });

            rerender(<NavigationItem title="Games" href={href} selected={false} hasChildren expanded />);
            expect(chevron).toHaveStyle({ transform: drawerOpen
                ? 'rotate(0deg)' : 'translateY(-50%) rotate(-90deg)' });
        });
    });
});

describe('NavigationItem mini popover', () => {
    beforeEach(() => {
        mockDrawerOpen = false;
        vi.stubGlobal('PointerEvent', MouseEvent);
        vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: true })));
    });

    afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); });

    function fixture() {
        const rendered = render(<NavigationItem title="Browse" selected={false} mini hasChildren controlsId="children"
            miniPopoverContent={<div id="children"><a href="/games">Games</a></div>} />);
        const button = screen.getByRole('button', { name: 'Browse' });
        vi.spyOn(button, 'getBoundingClientRect').mockReturnValue({ x: 0, y: 0, top: 0, left: 0, right: 80, bottom: 60, width: 80, height: 60, toJSON: () => ({}) });
        return { ...rendered, button };
    }
    function pointerEnter(element: HTMLElement, pointerType = 'mouse') {
        const event = new MouseEvent('pointerover', { bubbles: true });
        Object.defineProperty(event, 'pointerType', { value: pointerType });
        fireEvent(element, event);
    }

    it('opens on fine-pointer hover without moving focus and delays dismissal across the portal gap', () => {
        vi.useFakeTimers();
        const { button, container, unmount } = fixture();
        pointerEnter(button);
        const link = screen.getByRole('link');
        expect(container).not.toContainElement(link);
        expect(link).not.toHaveFocus();
        fireEvent.pointerLeave(button);
        act(() => { vi.advanceTimersByTime(100); });
        expect(link).toBeVisible();
        pointerEnter(screen.getByRole('navigation'));
        act(() => { vi.advanceTimersByTime(200); });
        expect(link).toBeVisible();
        fireEvent.pointerLeave(screen.getByRole('navigation'));
        act(() => { vi.advanceTimersByTime(150); });
        expect(screen.queryByRole('link')).not.toBeInTheDocument();
        pointerEnter(button);
        fireEvent.pointerLeave(button);
        unmount();
        expect(vi.getTimerCount()).toBe(0);
    });

    it('retains focused content and suppresses hover reopening after Escape', () => {
        vi.useFakeTimers();
        const { button } = fixture();
        pointerEnter(button);
        const link = screen.getByRole('link');
        act(() => { link.focus(); });
        fireEvent.pointerLeave(button);
        act(() => { vi.advanceTimersByTime(200); });
        expect(link).toBeVisible();
        fireEvent.keyDown(link, { key: 'Escape' });
        expect(button).toHaveFocus();
        pointerEnter(button);
        expect(button).toHaveAttribute('aria-expanded', 'false');
    });

    it('dismisses hover with Escape while focus remains elsewhere', () => {
        const { button } = fixture();
        pointerEnter(button);
        expect(screen.getByRole('link')).toBeVisible();
        fireEvent.keyDown(document.body, { key: 'Escape' });
        expect(button).toHaveAttribute('aria-expanded', 'false');
        expect(button).not.toHaveFocus();
        pointerEnter(button);
        expect(button).toHaveAttribute('aria-expanded', 'false');
    });

    it('dismisses on an outside pointer activation', () => {
        const { button } = fixture();
        fireEvent.click(button, { detail: 1 });
        fireEvent.pointerDown(document.body);
        expect(button).toHaveAttribute('aria-expanded', 'false');
    });

    it.each(['touch', 'pen'])('does not hover open for %s', pointerType => {
        const { button } = fixture();
        pointerEnter(button, pointerType);
        expect(button).toHaveAttribute('aria-expanded', 'false');
        fireEvent.click(button, { detail: 1 });
        expect(screen.getByRole('link')).toBeVisible();
    });

    it('does not hover open for a coarse pointer', () => {
        vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: false })));
        const { button } = fixture();
        pointerEnter(button);
        expect(button).toHaveAttribute('aria-expanded', 'false');
    });

    it('enters content on keyboard activation and dismisses destination clicks', () => {
        vi.useFakeTimers();
        const { button } = fixture();
        fireEvent.click(button, { detail: 0 });
        act(() => { vi.advanceTimersByTime(0); });
        const link = screen.getByRole('link');
        expect(link).toHaveFocus();
        fireEvent.click(link);
        expect(button).toHaveAttribute('aria-expanded', 'false');
        expect(document.getElementById('children')).toContainElement(link);
    });

    it('opens by activation, remains open across pointer transitions, and restores focus on Escape', async () => {
        const { container } = render(<NavigationItem title="Browse" selected={false} hasChildren controlsId="browse-children"
            miniPopoverContent={<div id="browse-children"><a href="/games">Games</a></div>} />);
        const button = screen.getByRole('button', { name: 'Browse' });
        vi.spyOn(button, 'getBoundingClientRect').mockReturnValue({ x: 0, y: 0, top: 0, left: 0, right: 80, bottom: 60, width: 80, height: 60, toJSON: () => ({}) });
        button.focus();
        fireEvent.click(button);
        const link = await screen.findByRole('link', { name: 'Games' });
        expect(button).toHaveAttribute('aria-expanded', 'true');
        expect(button).toHaveAttribute('aria-controls', link.parentElement?.id);
        expect(container).not.toContainElement(link);
        fireEvent.mouseLeave(button);
        link.focus();
        expect(link).toBeVisible();
        fireEvent.keyDown(link, { key: 'Escape' });
        await waitFor(() => expect(screen.queryByRole('link')).not.toBeInTheDocument());
        await waitFor(() => expect(button).toHaveFocus());
    });
});
