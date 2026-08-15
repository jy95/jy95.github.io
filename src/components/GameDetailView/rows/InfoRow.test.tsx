import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

import InfoRow from './InfoRow';

describe('InfoRow', () => {
    it('renders the label and value text', () => {
        render(<InfoRow label="Duration" value="2 hours" icon={<span data-testid="icon" />} />);
        expect(screen.getByText('Duration')).toBeInTheDocument();
        expect(screen.getByText('2 hours')).toBeInTheDocument();
    });

    it('renders the provided icon', () => {
        render(<InfoRow label="Duration" value="2 hours" icon={<span data-testid="icon" />} />);
        expect(screen.getByTestId('icon')).toBeInTheDocument();
    });

    it('accepts a ReactNode as value, not just a plain string', () => {
        render(<InfoRow label="Custom" value={<strong>Bold value</strong>} icon={<span />} />);
        expect(screen.getByText('Bold value').tagName).toBe('STRONG');
    });

    it('renders different labels for different rows without leaking state', () => {
        const { rerender } = render(<InfoRow label="First" value="A" icon={<span />} />);
        expect(screen.getByText('First')).toBeInTheDocument();

        rerender(<InfoRow label="Second" value="B" icon={<span />} />);
        expect(screen.getByText('Second')).toBeInTheDocument();
        expect(screen.getByText('B')).toBeInTheDocument();
        expect(screen.queryByText('First')).not.toBeInTheDocument();
        expect(screen.queryByText('A')).not.toBeInTheDocument();
    });
});
