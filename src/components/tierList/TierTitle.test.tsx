import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('next-intl', () => ({
    useTranslations: () => (key: string) => `translated:${key}`,
}));

import TierTitle from './TierTitle';

describe('TierTitle', () => {
    it('renders the translated category label', () => {
        render(<TierTitle slugKey="tier_good" slugColor="#6BCB77" />);
        expect(screen.getByText('translated:tier_good')).toBeInTheDocument();
    });

    it('renders a different label for a different slugKey', () => {
        render(<TierTitle slugKey="tier_bad" slugColor="#9D4EDD" />);
        expect(screen.getByText('translated:tier_bad')).toBeInTheDocument();
    });

    it('applies the given background color to its container', () => {
        const { container } = render(<TierTitle slugKey="tier_bad" slugColor="#123456" />);
        const box = container.firstChild as HTMLElement;
        expect(box).toHaveStyle({ backgroundColor: '#123456' });
    });
});
