import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

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

    it('renders the provided icon in mini mode', () => {
        mockDrawerOpen = false;
        render(<NavigationItem title="Games" selected={false} icon={<span data-testid="custom-icon" />} />);
        expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
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

        it('renders a custom icon and title', () => {
            render(<NavigationItem title="Games Library" href={href} selected={false}
                icon={<span data-testid="custom-icon" />} />);

            expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
            expect(screen.getByText('Games Library')).toBeInTheDocument();
        });

        it('retains the icon container, title and accessible name without an icon', () => {
            render(<NavigationItem title="games library collection" href={href} selected={false} />);

            const title = screen.getByText('games library collection');
            expect(title).toBeInTheDocument();
            const button = screen.getByRole(href ? 'link' : 'button');
            expect(button).toHaveAccessibleName('games library collection');
            expect(button.querySelector('.MuiListItemIcon-root')).toBeInTheDocument();
            if (!drawerOpen) {
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
            expect(chevron).toHaveStyle({ transform: 'rotate(-90deg)' });

            rerender(<NavigationItem title="Games" href={href} selected={false} hasChildren expanded />);
            expect(chevron).toHaveStyle({ transform: drawerOpen
                ? 'rotate(0deg)' : 'rotate(-90deg)' });
        });
    });
});

describe('NavigationItem mini popover', () => {
    beforeEach(() => {
        mockDrawerOpen = false;
    });

    function fixture(overrides: Partial<ComponentProps<typeof NavigationItem>> = {}) {
        const props = {
            title: 'Browse', selected: false, mini: true, hasChildren: true, controlsId: 'children',
            miniPopoverContent: <div id="children">
                <a href="#games">Games <span>catalog</span></a>
                <button type="button">Other action</button>
            </div>,
            ...overrides,
        };
        const rendered = render(<NavigationItem {...props} />);
        const button = screen.getByRole('button', { name: 'Browse' });
        vi.spyOn(button, 'getBoundingClientRect').mockReturnValue({ x: 0, y: 0, top: 0, left: 0,
            right: 80, bottom: 60, width: 80, height: 60, toJSON: () => ({}) });
        return { ...rendered, button, props };
    }

    it.each([
        { condition: 'expanded mode', mini: false },
        { condition: 'no children', hasChildren: false },
        { condition: 'no popover content', miniPopoverContent: undefined },
    ])('does not open in $condition and retains the disclosure callback', (overrides) => {
        const onClick = vi.fn();
        const { button } = fixture({ ...overrides, onClick });
        fireEvent.mouseEnter(button);
        expect(screen.queryByRole('navigation', { hidden: true })).not.toBeInTheDocument();
        fireEvent.click(button);
        expect(onClick).toHaveBeenCalledTimes(1);
        expect(screen.queryByRole('navigation', { hidden: true })).not.toBeInTheDocument();
    });

    it.each(['hover', 'click'])('opens on %s without invoking the disclosure callback', (interaction) => {
        const onClick = vi.fn();
        const { button, container } = fixture({ onClick });
        const link = screen.getByRole('link', { hidden: true });
        expect(link).toBeInTheDocument();
        expect(link).not.toBeVisible();
        expect(button).toHaveAttribute('aria-expanded', 'false');
        if (interaction === 'hover') fireEvent.mouseEnter(button);
        else fireEvent.click(button);
        expect(link).toBeVisible();
        expect(button).toHaveAttribute('aria-expanded', 'true');
        expect(button).toHaveAttribute('aria-controls', link.parentElement?.id);
        expect(container).not.toContainElement(link);
        expect(onClick).not.toHaveBeenCalled();
    });

    it('closes immediately on mouse leave and keeps hidden content mounted', () => {
        const { button } = fixture();
        fireEvent.mouseEnter(button);
        const link = screen.getByRole('link');
        fireEvent.mouseLeave(button);
        expect(button).toHaveAttribute('aria-expanded', 'false');
        expect(link).not.toBeVisible();
        expect(screen.getByRole('link', { hidden: true })).toBe(link);
    });

    it.each(['trigger', 'popup'])('closes on Escape from the %s', (target) => {
        const { button } = fixture();
        fireEvent.click(button);
        const link = screen.getByRole('link');
        fireEvent.keyDown(target === 'trigger' ? button : link, { key: 'Escape' });
        expect(button).toHaveAttribute('aria-expanded', 'false');
        expect(link).not.toBeVisible();
    });

    it('closes on an outside click after ClickAwayListener activates', async () => {
        const { button } = fixture();
        // MUI defers listener activation to avoid handling the opening event.
        await new Promise(resolve => setTimeout(resolve, 0));
        fireEvent.click(button);
        const link = screen.getByRole('link');
        expect(link).toBeVisible();
        fireEvent.click(document.body);
        expect(button).toHaveAttribute('aria-expanded', 'false');
        expect(link).not.toBeVisible();
    });

    it.each(['link', 'descendant'])('closes when clicking a popup %s', (target) => {
        const { button } = fixture();
        fireEvent.click(button);
        const link = screen.getByRole('link');
        fireEvent.click(target === 'link' ? link : screen.getByText('catalog'));
        expect(button).toHaveAttribute('aria-expanded', 'false');
        expect(link).not.toBeVisible();
        expect(link).toBeInTheDocument();
    });

    it('keeps the popup open when clicking non-link content', async () => {
        const { button } = fixture();
        await new Promise(resolve => setTimeout(resolve, 0));
        fireEvent.click(button);
        fireEvent.click(screen.getByRole('button', { name: 'Other action' }));
        expect(button).toHaveAttribute('aria-expanded', 'true');
        expect(screen.getByRole('navigation')).toBeVisible();
    });

    it.each([
        { condition: 'mini mode', mini: false },
        { condition: 'children', hasChildren: false },
        { condition: 'popover content', miniPopoverContent: undefined },
    ])('hides an open popup when removing $condition', (overrides) => {
        const { button, props, rerender } = fixture();
        fireEvent.click(button);
        expect(screen.getByRole('navigation')).toBeVisible();
        rerender(<NavigationItem {...props} {...overrides} />);
        expect(screen.queryByRole('navigation', { hidden: true })).not.toBeInTheDocument();
        expect(button).not.toHaveAttribute('aria-expanded', 'true');
    });
});
