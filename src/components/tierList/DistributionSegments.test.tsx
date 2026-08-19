import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('next-intl', () => ({
    useTranslations: (ns?: string) => (key: string, opts?: Record<string, unknown>) => {
        const base = ns ? `${ns}.${key}` : key;
        return opts ? `${base}:${JSON.stringify(opts)}` : base;
    },
}));

import DistributionSegments from './DistributionSegments';

const categoryColors = {
    tier_good: '#6BCB77',
    tier_bad: '#9D4EDD',
    tier_average: '#FFD93D',
};

describe('DistributionSegments', () => {
    it('renders one segment per category key in data', () => {
        render(
            <DistributionSegments
                data={{ tier_good: [{ id: '1' }], tier_bad: [{ id: '2' }] }}
                categoryColors={categoryColors}
                totalGames={2}
            />
        );
        expect(screen.getByTestId('distribution-segment-tier_good')).toBeInTheDocument();
        expect(screen.getByTestId('distribution-segment-tier_bad')).toBeInTheDocument();
    });

    it('computes each segment width as its share of totalGames', () => {
        render(
            <DistributionSegments
                data={{ tier_good: [{ id: '1' }, { id: '2' }], tier_average: [{ id: '3' }] }}
                categoryColors={categoryColors}
                totalGames={4}
            />
        );
        // tier_good: 2/4 = 50%, tier_average: 1/4 = 25%
        expect(screen.getByTestId('distribution-segment-tier_good')).toHaveStyle({ width: '50%' });
        expect(screen.getByTestId('distribution-segment-tier_average')).toHaveStyle({ width: '25%' });
    });

    it('renders no segments when data has no categories', () => {
        const { container } = render(
            <DistributionSegments data={{}} categoryColors={categoryColors} totalGames={0} />
        );
        expect(container.querySelectorAll('[data-testid^="distribution-segment-"]')).toHaveLength(0);
    });

    it('renders a segment even for a category with zero games (0% width)', () => {
        render(
            <DistributionSegments
                data={{ tier_good: [{ id: '1' }], tier_bad: [] }}
                categoryColors={categoryColors}
                totalGames={1}
            />
        );
        expect(screen.getByTestId('distribution-segment-tier_bad')).toHaveStyle({ width: '0%' });
    });
});
