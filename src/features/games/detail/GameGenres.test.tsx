import { describe, it, expect } from 'vitest';
import { vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import en from '../../../../messages/en.json';
import fr from '../../../../messages/fr.json';

const push = vi.fn();
vi.mock('@/i18n/routing', () => ({ useRouter: () => ({ push }) }));

import GameGenres from './GameGenres';

function renderGenres(genreIds: number[]) {
    return render(
        <NextIntlClientProvider locale="en" messages={en}>
            <GameGenres genreIds={genreIds} />
        </NextIntlClientProvider>
    );
}

describe('GameGenres', () => {
    describe.each([
        { locale: 'en', messages: en },
        { locale: 'fr', messages: fr },
    ])('$locale translations', ({ locale, messages }) => {
        it.each([1, 2])('renders %i genres with the field label and icon', (count) => {
            render(
                <NextIntlClientProvider locale={locale} messages={messages}>
                    <GameGenres genreIds={[1, 2].slice(0, count)} />
                </NextIntlClientProvider>
            );
            expect(screen.getByText(count === 1 ? 'Genre' : 'Genres')).toBeInTheDocument();
            expect(screen.queryByText(count === 1 ? 'Genres' : 'Genre')).not.toBeInTheDocument();
            expect(screen.getByTestId('LabelIcon')).toHaveClass('MuiSvgIcon-fontSizeSmall');
            expect(screen.getAllByRole('button')).toHaveLength(count);
            const chip = screen.getAllByRole('button')[0];
            const group = chip.parentElement;
            expect(group?.tagName).toBe('SPAN');
            expect(group).toHaveStyle({ flexWrap: 'wrap' });
            expect(group?.parentElement?.tagName).toBe('P');
            expect(chip.tagName).toBe('SPAN');
        });
    });

    it.each(['click', 'Enter', ' '])('opens the numeric genre filter with %s', (activation) => {
        push.mockClear();
        renderGenres([1, 2]);
        const chip = screen.getByRole('button', { name: en.gamesLibrary.gamesGenres['2'] });
        expect(chip).toHaveAttribute('tabindex', '0');
        expect(chip).toHaveClass('MuiChip-clickable', 'MuiChip-outlined', 'MuiChip-sizeSmall');
        if (activation === 'click') fireEvent.click(chip);
        else {
            fireEvent.keyDown(chip, { key: activation });
            fireEvent.keyUp(chip, { key: activation });
        }
        expect(push).toHaveBeenCalledExactlyOnceWith({ pathname: '/games', query: { genres: '2' } });
    });

    it('renders one chip per genre id', () => {
        renderGenres([1, 2, 3]);
        expect(screen.getByText(en.gamesLibrary.gamesGenres['1'])).toBeInTheDocument();
        expect(screen.getByText(en.gamesLibrary.gamesGenres['2'])).toBeInTheDocument();
        expect(screen.getByText(en.gamesLibrary.gamesGenres['3'])).toBeInTheDocument();
    });

    it('renders nothing when genreIds is empty', () => {
        const { container } = renderGenres([]);
        expect(container).toBeEmptyDOMElement();
    });

    it('renders a chip for every entry, even duplicate ids', () => {
        renderGenres([5, 5]);
        expect(screen.getAllByText(en.gamesLibrary.gamesGenres['5'])).toHaveLength(2);
    });

    it('renders chips in the same order as the provided genreIds', () => {
        const { container } = renderGenres([9, 1, 4]);
        const chipLabels = Array.from(container.querySelectorAll('.MuiChip-label')).map((el) => el.textContent);
        expect(chipLabels).toEqual([
            en.gamesLibrary.gamesGenres['9'],
            en.gamesLibrary.gamesGenres['1'],
            en.gamesLibrary.gamesGenres['4'],
        ]);
    });

    it('renders each chip as outlined and small, matching the design spec', () => {
        const { container } = renderGenres([1]);
        const chip = container.querySelector('.MuiChip-root');
        expect(chip).toHaveClass('MuiChip-outlined');
        expect(chip).toHaveClass('MuiChip-sizeSmall');
    });
});
