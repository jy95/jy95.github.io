import { describe, it, expect } from 'vitest';
import { vi } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('next-intl', () => ({
    useTranslations: () => (key: string) => `translated:${key}`,
}));

import GameGenres from './GameGenres';

describe('GameGenres', () => {
    it('renders one chip per genre id', () => {
        render(<GameGenres genreIds={[1, 2, 3]} />);
        expect(screen.getByText('translated:gamesLibrary.gamesGenres.1')).toBeInTheDocument();
        expect(screen.getByText('translated:gamesLibrary.gamesGenres.2')).toBeInTheDocument();
        expect(screen.getByText('translated:gamesLibrary.gamesGenres.3')).toBeInTheDocument();
    });

    it('renders nothing when genreIds is empty', () => {
        const { container } = render(<GameGenres genreIds={[]} />);
        expect(container.querySelectorAll('.MuiChip-root')).toHaveLength(0);
    });

    it('renders a chip for every entry, even duplicate ids', () => {
        render(<GameGenres genreIds={[5, 5]} />);
        expect(screen.getAllByText('translated:gamesLibrary.gamesGenres.5')).toHaveLength(2);
    });

    it('renders chips in the same order as the provided genreIds', () => {
        const { container } = render(<GameGenres genreIds={[9, 1, 4]} />);
        const chipLabels = Array.from(container.querySelectorAll('.MuiChip-label')).map((el) => el.textContent);
        expect(chipLabels).toEqual([
            'translated:gamesLibrary.gamesGenres.9',
            'translated:gamesLibrary.gamesGenres.1',
            'translated:gamesLibrary.gamesGenres.4',
        ]);
    });

    it('renders each chip as outlined and small, matching the design spec', () => {
        const { container } = render(<GameGenres genreIds={[1]} />);
        const chip = container.querySelector('.MuiChip-root');
        expect(chip).toHaveClass('MuiChip-outlined');
        expect(chip).toHaveClass('MuiChip-sizeSmall');
    });
});
