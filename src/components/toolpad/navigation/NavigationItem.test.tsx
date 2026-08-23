import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

let mockDrawerOpen = true;

vi.mock('../provider/useAppContext', () => ({
    useAppContext: () => ({ drawerOpen: mockDrawerOpen }),
}));

vi.mock('@/i18n/routing', () => ({
    Link: ({ children, href, ...rest }: any) => (
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
