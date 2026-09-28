import { describe, it, expect, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import type { GameFilters } from '@/types/gamesFilters';

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

import GamesFilters from './GamesFilters';

describe('GamesFilters', () => {
    it('passes default values to all filters and forwards their changes', async () => {
        const onChange = vi.fn();
        render(<GamesFilters filters={{}} onChange={onChange} />);

        expect(screen.getByRole('button', { name: /Options/i })).toBeInTheDocument();
        fireEvent.click(screen.getByRole('button', { name: /Options/i }));
        expect(await screen.findByRole('textbox', { name: 'Title' })).toHaveValue('');
        expect(screen.getByLabelText('Platform value')).toHaveTextContent('none');
        expect(screen.getByLabelText('Genres value')).toHaveTextContent('');

        fireEvent.change(screen.getByRole('textbox', { name: 'Title' }), { target: { value: 'Mario' } });
        fireEvent.click(screen.getByRole('button', { name: 'Select platform' }));
        fireEvent.click(screen.getByRole('button', { name: 'Select genres' }));
        expect(onChange.mock.calls).toEqual([
            [{ title: 'Mario' }],
            [{ platform: 6 }],
            [{ genres: [2, 13] }],
        ]);
    });

    it('passes selected values and forwards clearing each filter', async () => {
        const filters: GameFilters = { title: 'Zelda', platform: 1, genres: [13] };
        const onChange = vi.fn();
        render(<GamesFilters filters={filters} onChange={onChange} />);

        fireEvent.click(screen.getByRole('button', { name: /Options/i }));
        expect(await screen.findByRole('textbox', { name: 'Title' })).toHaveValue('Zelda');
        expect(screen.getByLabelText('Platform value')).toHaveTextContent('1');
        expect(screen.getByLabelText('Genres value')).toHaveTextContent('13');

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
