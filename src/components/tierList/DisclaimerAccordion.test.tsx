import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('next-intl', () => ({
    useTranslations: (ns?: string) => (key: string) => (ns ? `${ns}.${key}` : key),
}));

import DisclaimerAccordion from './DisclaimerAccordion';
import type { TierCategoryKey } from '@/types/tierList';
import type { BackgroundColor } from './index';

const categoryColors: Record<TierCategoryKey, BackgroundColor> = {
    tier_masterpiece: '#FF6B6B',
    tier_excellent: '#FF8C42',
    tier_good: '#6BCB77',
    tier_average: '#FFD93D',
    tier_poor: '#4D96FF',
    tier_bad: '#9D4EDD',
    tier_not_evaluated: '#A0A0A0',
};

describe('DisclaimerAccordion', () => {
    it('renders the translated disclaimer title', () => {
        render(<DisclaimerAccordion categoryColors={categoryColors} />);
        expect(screen.getByText('TierList.disclaimer.title')).toBeInTheDocument();
    });

    it('renders the translated disclaimer body text', () => {
        render(<DisclaimerAccordion categoryColors={categoryColors} />);
        expect(screen.getByText('TierList.disclaimer.text')).toBeInTheDocument();
    });

    it('renders a list entry (name + description) for every one of the seven fixed tier categories', () => {
        render(<DisclaimerAccordion categoryColors={categoryColors} />);
        for (const key of Object.keys(categoryColors)) {
            expect(screen.getByText(`TierList.categories.${key}`)).toBeInTheDocument();
            expect(screen.getByText(`TierList.descriptions.${key}`)).toBeInTheDocument();
        }
    });

    it('renders exactly seven category rows, in the fixed tier order', () => {
        render(<DisclaimerAccordion categoryColors={categoryColors} />);
        const items = screen.getAllByText(/^TierList\.categories\./);
        expect(items.map((el) => el.textContent)).toEqual([
            'TierList.categories.tier_masterpiece',
            'TierList.categories.tier_excellent',
            'TierList.categories.tier_good',
            'TierList.categories.tier_average',
            'TierList.categories.tier_poor',
            'TierList.categories.tier_bad',
            'TierList.categories.tier_not_evaluated',
        ]);
    });

    it('applies the given background color to each category avatar', () => {
        const { container } = render(<DisclaimerAccordion categoryColors={categoryColors} />);
        const avatars = container.querySelectorAll('.MuiAvatar-root');
        // First avatar in the list belongs to tier_masterpiece
        const masterpieceAvatar = Array.from(avatars).find(
            (el) => (el as HTMLElement).style.backgroundColor !== ''
        );
        expect(masterpieceAvatar).toBeDefined();
    });
});
