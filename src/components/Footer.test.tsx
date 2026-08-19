import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

import Footer from './Footer';

describe('Footer', () => {
    it('renders the copyright text with the current year', () => {
        render(<Footer />);
        const year = new Date().getFullYear();
        expect(screen.getByText(new RegExp(`©\\s*${year}\\s*GamesPassionFR`))).toBeInTheDocument();
    });

    it('renders a Privacy Policy link opening in a new tab', () => {
        render(<Footer />);
        const link = screen.getByRole('link', { name: 'Privacy Policy' });
        expect(link).toHaveAttribute('href', '/privacy.html');
        expect(link).toHaveAttribute('target', '_blank');
    });

    it('renders a Terms of Service link opening in a new tab', () => {
        render(<Footer />);
        const link = screen.getByRole('link', { name: 'Terms of Service' });
        expect(link).toHaveAttribute('href', '/tos.html');
        expect(link).toHaveAttribute('target', '_blank');
    });

    it('renders a mailto Contact link', () => {
        render(<Footer />);
        const link = screen.getByRole('link', { name: 'Contact' });
        expect(link).toHaveAttribute('href', 'mailto:gamespassionfr.pro@gmail.com');
    });

    it('renders exactly three links', () => {
        render(<Footer />);
        expect(screen.getAllByRole('link')).toHaveLength(3);
    });
});
