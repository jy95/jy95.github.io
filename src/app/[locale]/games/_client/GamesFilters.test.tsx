import { describe, it, expect, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import type { GameFilters } from '@/types/gamesFilters';
import { echoTranslations } from '@/test/mocks/nextIntl';

vi.mock('next-intl', () => echoTranslations());

vi.mock('@/features/games/components/TitleFilter', () => ({
    default: ({ value, onChange }: { value: string; onChange: (value: string) => void }) => (
        <input aria-label="Title" value={value} onChange={event => onChange(event.target.value)} />
    ),
}));
vi.mock('@/features/games/components/PlatformSelect', () => ({
    default: ({ value, onChange }: { value?: number; onChange: (value: number | undefined) => void }) => (
        <div>
            <output aria-label="Platform value">{value ?? 'none'}</output>
            <button onClick={() => onChange(6)}>Select platform</button>
            <button onClick={() => onChange(undefined)}>Clear platform</button>
        </div>
    ),
}));
vi.mock('@/features/games/components/GenresSelect', () => ({
    default: ({ value, onChange }: { value: number[]; onChange: (value: number[]) => void }) => (
        <div>
            <output aria-label="Genres value">{value.join(',')}</output>
            <button onClick={() => onChange([2, 13])}>Select genres</button>
            <button onClick={() => onChange([])}>Clear genres</button>
        </div>
    ),
}));

vi.mock('@/features/games/components/SortSelect', () => ({
    default: ({ value, onChange }: { value?: string; onChange: (v: string | undefined) => void }) => (
        <div>
            <output aria-label="Sort value">{value ?? 'none'}</output>
            <button onClick={() => onChange('title_asc')}>Select sort</button>
        </div>
    ),
}));

import GamesFilters from './GamesFilters';

describe('GamesFilters', () => {
    it('passes default values to all filters and forwards their changes', () => {
        const onChange = vi.fn();
        render(<GamesFilters filters={{}} onChange={onChange} />);

        expect(screen.getByRole('button', { name: /filtersButtonLabel/i })).toBeInTheDocument();
        fireEvent.click(screen.getByRole('button', { name: /filtersButtonLabel/i }));
        expect(screen.getByRole('textbox', { name: 'Title' })).toHaveValue('');
        expect(screen.getByLabelText('Platform value')).toHaveTextContent('none');
        expect(screen.getByLabelText('Genres value')).toHaveTextContent('');
        expect(screen.getByLabelText('Sort value')).toHaveTextContent('none');

        fireEvent.change(screen.getByRole('textbox', { name: 'Title' }), { target: { value: 'Mario' } });
        fireEvent.click(screen.getByRole('button', { name: 'Select platform' }));
        fireEvent.click(screen.getByRole('button', { name: 'Select genres' }));
        expect(onChange.mock.calls).toEqual([
            [{ title: 'Mario' }],
            [{ platform: 6 }],
            [{ genres: [2, 13] }],
        ]);

        fireEvent.click(screen.getByRole('button', { name: 'Select sort' }));
        expect(onChange).toHaveBeenLastCalledWith({ sort: 'title_asc' });
    });

    it('passes selected values and forwards clearing each filter', () => {
        const filters: GameFilters = { title: 'Zelda', platform: 1, genres: [13], sort: 'duration_desc' };
        const onChange = vi.fn();
        render(<GamesFilters filters={filters} onChange={onChange} />);

        fireEvent.click(screen.getByRole('button', { name: /filtersButtonLabel/i }));
        expect(screen.getByRole('textbox', { name: 'Title' })).toHaveValue('Zelda');
        expect(screen.getByLabelText('Platform value')).toHaveTextContent('1');
        expect(screen.getByLabelText('Genres value')).toHaveTextContent('13');
        expect(screen.getByLabelText('Sort value')).toHaveTextContent('duration_desc');

        fireEvent.change(screen.getByRole('textbox', { name: 'Title' }), { target: { value: '' } });
        fireEvent.click(screen.getByRole('button', { name: 'Clear platform' }));
        fireEvent.click(screen.getByRole('button', { name: 'Clear genres' }));
        expect(onChange.mock.calls).toEqual([
            [{ title: '' }],
            [{ platform: undefined }],
            [{ genres: [] }],
        ]);
    });
});
