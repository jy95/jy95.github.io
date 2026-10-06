import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

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
            expect(button).toHaveStyle({ height });
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
    });

    function prepareAnchor() {
        const listItem = screen.getByRole('listitem');
        // Popper needs a non-empty anchor rectangle; jsdom has no layout.
        vi.spyOn(listItem, 'getBoundingClientRect').mockReturnValue({
            x: 0, y: 0, top: 0, left: 0, right: 80, bottom: 60,
            width: 80, height: 60, toJSON: () => ({}),
        });
        return listItem;
    }

    it('shows portaled content on mouse enter and removes it after mouse leave', async () => {
        const { container } = render(<NavigationItem title="Games" selected={false} hasChildren
            miniPopoverContent={<div>Child navigation</div>} />);
        const listItem = prepareAnchor();
        expect(screen.queryByText('Child navigation')).not.toBeInTheDocument();

        fireEvent.mouseEnter(listItem);
        const content = await screen.findByText('Child navigation');
        await waitFor(() => expect(content).toBeVisible());
        expect(document.body).toContainElement(content);
        expect(container).not.toContainElement(content);

        fireEvent.mouseLeave(listItem);
        await waitFor(() => expect(screen.queryByText('Child navigation')).not.toBeInTheDocument());
    });

    it.each([
        { condition: 'expanded drawer', drawerOpen: true, hasChildren: true, content: <div>Child navigation</div> },
        { condition: 'no children', drawerOpen: false, hasChildren: false, content: <div>Child navigation</div> },
        { condition: 'absent content', drawerOpen: false, hasChildren: true, content: undefined },
    ])('does not open a popover with $condition', async ({ drawerOpen, hasChildren, content }) => {
        mockDrawerOpen = drawerOpen;
        render(<NavigationItem title="Games" selected={false} hasChildren={hasChildren}
            miniPopoverContent={content} />);

        fireEvent.mouseEnter(prepareAnchor());
        await waitFor(() => {
            expect(screen.queryByText('Child navigation')).not.toBeInTheDocument();
            expect(document.body.querySelector('[role="tooltip"]')).not.toBeInTheDocument();
        });
    });

    it('tracks expanded-drawer hover across drawer mode changes', async () => {
        mockDrawerOpen = true;
        const item = <NavigationItem title="Games" selected={false} hasChildren
            miniPopoverContent={<div>Child navigation</div>} />;
        const { rerender } = render(item);
        const listItem = prepareAnchor();

        fireEvent.mouseEnter(listItem);
        expect(screen.queryByText('Child navigation')).not.toBeInTheDocument();
        mockDrawerOpen = false;
        rerender(<NavigationItem title="Games" selected={false} hasChildren
            miniPopoverContent={<div>Child navigation</div>} />);
        await waitFor(() => expect(screen.getByText('Child navigation')).toBeVisible());

        mockDrawerOpen = true;
        rerender(<NavigationItem title="Games" selected={false} hasChildren
            miniPopoverContent={<div>Child navigation</div>} />);
        await waitFor(() => expect(screen.queryByText('Child navigation')).not.toBeInTheDocument());
        fireEvent.mouseLeave(listItem);
        mockDrawerOpen = false;
        rerender(<NavigationItem title="Games" selected={false} hasChildren
            miniPopoverContent={<div>Child navigation</div>} />);
        expect(screen.queryByText('Child navigation')).not.toBeInTheDocument();

        fireEvent.mouseEnter(listItem);
        await waitFor(() => expect(screen.getByText('Child navigation')).toBeVisible());
        fireEvent.mouseLeave(listItem);
        await waitFor(() => expect(screen.queryByText('Child navigation')).not.toBeInTheDocument());
    });

    it('defaults to expanded mode when drawerOpen is undefined', () => {
        mockDrawerOpen = undefined;
        render(<NavigationItem title="Games" selected={false} />);
        expect(screen.getByRole('button')).toHaveStyle({ height: '48px' });
        expect(screen.queryByText('G')).not.toBeInTheDocument();
    });
});
