import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

// Echoes back "<namespace>.<key>[:<opts>]" so we can assert both the
// distribution header's translated total and the per-segment widths
// without a real NextIntlClientProvider.
vi.mock('next-intl', () => ({
    useTranslations: (namespace?: string) => (key: string, opts?: Record<string, unknown>) => {
        const base = namespace ? `${namespace}.${key}` : key;
        return opts ? `${base}:${JSON.stringify(opts)}` : base;
    },
}));

import DistributionBar from './DistributionBar';

const categoryColors = {
    tier_good: '#6BCB77',
    tier_bad: '#9D4EDD',
};

describe('DistributionBar', () => {
    it('renders nothing when there are no categories at all', () => {
        const { container } = render(<DistributionBar data={{}} categoryColors={categoryColors} />);
        expect(container).toBeEmptyDOMElement();
    });

    it('renders nothing when every category is present but empty', () => {
        const { container } = render(
            <DistributionBar data={{ tier_good: [], tier_bad: [] }} categoryColors={categoryColors} />
        );
        expect(container).toBeEmptyDOMElement();
    });

    it('renders the bar once at least one category has a game', () => {
        const { container } = render(
            <DistributionBar data={{ tier_good: [{ id: '1' }], tier_bad: [] }} categoryColors={categoryColors} />
        );
        expect(container).not.toBeEmptyDOMElement();
    });

    it('sums games across every category (not just the largest) for the header total', () => {
        render(
            <DistributionBar
                data={{ tier_good: [{ id: '1' }, { id: '2' }], tier_bad: [{ id: '3' }] }}
                categoryColors={categoryColors}
            />
        );
        expect(screen.getByText(/stats\.tierStats\.total_games:\{"count":3\}/)).toBeInTheDocument();
    });

    it('gives each populated segment a width proportional to its share of the total', () => {
        const { container } = render(
            <DistributionBar
                data={{ tier_good: [{ id: '1' }, { id: '2' }, { id: '3' }], tier_bad: [{ id: '4' }] }}
                categoryColors={categoryColors}
            />
        );
        const widths = Array.from(container.querySelectorAll('[style*="width"]'))
            .map((el) => (el as HTMLElement).style.width)
            .filter((w) => w && w !== '100%');
        expect(widths).toEqual(expect.arrayContaining(['75%', '25%']));
    });

    it('gives an empty category a 0% width segment rather than omitting it', () => {
        const { container } = render(
            <DistributionBar
                data={{ tier_good: [{ id: '1' }], tier_bad: [] }}
                categoryColors={categoryColors}
            />
        );
        const widths = Array.from(container.querySelectorAll('[style*="width"]'))
            .map((el) => (el as HTMLElement).style.width)
            .filter((w) => w && w !== '100%');
        expect(widths).toEqual(expect.arrayContaining(['100%', '0%']));
    });
});
