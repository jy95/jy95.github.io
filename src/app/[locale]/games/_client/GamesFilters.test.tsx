import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen, within, waitFor } from '@testing-library/react';
import type { GameFilters } from '@/types/gamesFilters';
import { echoTranslations } from '@/test/mocks/nextIntl';

const responsive = vi.hoisted(() => ({ mobile: false }));
vi.mock('@mui/material/useMediaQuery', () => ({ default: () => responsive.mobile }));
beforeEach(() => { responsive.mobile = false; });

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

describe('mobile filters', () => {
    beforeEach(() => { responsive.mobile = true; });

    it('keeps search visible and batches edits until Apply', async () => {
        const onChange = vi.fn();
        const { rerender } = render(<GamesFilters filters={{ title: 'Zelda', sort: 'duration_desc' }} onChange={onChange} />);
        expect(screen.getByRole('textbox', { name: 'Title' })).toBeVisible();
        const trigger = screen.getByRole('button', { name: 'gamesLibrary.filtersButtonLabel' });
        trigger.focus();
        fireEvent.click(trigger);
        const dialog = screen.getByRole('dialog', { name: 'gamesLibrary.filtersButtonLabel' });
        expect(within(dialog).queryByRole('textbox', { name: 'Title' })).not.toBeInTheDocument();
        expect(within(dialog).queryByLabelText('Sort value')).not.toBeInTheDocument();
        fireEvent.click(within(dialog).getByRole('button', { name: 'Select platform' }));
        fireEvent.click(within(dialog).getByRole('button', { name: 'Select genres' }));
        expect(onChange).not.toHaveBeenCalled();
        fireEvent.click(within(dialog).getByRole('button', { name: 'gamesLibrary.filterActions.apply' }));
        expect(onChange).toHaveBeenCalledExactlyOnceWith({ platform: 6, genres: [2, 13] });
        rerender(<GamesFilters filters={{ title: 'Zelda', sort: 'duration_desc', platform: 6, genres: [2, 13] }} onChange={onChange} />);
        await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
        expect(trigger).toHaveFocus();
        expect(trigger).toHaveTextContent('2');
    });

    it('clears only the draft secondary filters, then applies the reset', () => {
        const onChange = vi.fn();
        render(<GamesFilters filters={{ title: 'Zelda', sort: 'duration_desc', platform: 6, genres: [2] }} onChange={onChange} />);
        fireEvent.click(screen.getByRole('button', { name: /filtersButtonLabel/ }));
        fireEvent.click(screen.getByRole('button', { name: 'gamesLibrary.filterActions.clear' }));
        expect(screen.getByLabelText('Platform value')).toHaveTextContent('none');
        expect(screen.getByLabelText('Genres value')).toBeEmptyDOMElement();
        expect(onChange).not.toHaveBeenCalled();
        fireEvent.click(screen.getByRole('button', { name: 'gamesLibrary.filterActions.apply' }));
        expect(onChange).toHaveBeenCalledExactlyOnceWith({ platform: undefined, genres: [] });
    });

    it('discards edits on close or Escape and initializes each opening from applied filters', async () => {
        const onChange = vi.fn();
        const { rerender } = render(<GamesFilters filters={{ platform: 1 }} onChange={onChange} />);
        fireEvent.click(screen.getByRole('button', { name: /filtersButtonLabel/ }));
        fireEvent.click(screen.getByRole('button', { name: 'Select platform' }));
        fireEvent.click(screen.getByRole('button', { name: 'gamesLibrary.filterActions.close' }));
        await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
        rerender(<GamesFilters filters={{ platform: 9 }} onChange={onChange} />);
        fireEvent.click(screen.getByRole('button', { name: /filtersButtonLabel/ }));
        expect(screen.getByLabelText('Platform value')).toHaveTextContent('9');
        fireEvent.click(screen.getByRole('button', { name: 'Select genres' }));
        fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
        await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
        expect(onChange).not.toHaveBeenCalled();
    });
});

it('counts applied secondary filter groups, excluding title and sort, and removes the count after reset', () => {
    const { rerender } = render(<GamesFilters filters={{ platform: 6, genres: [2, 13] }} onChange={vi.fn()} />);
    expect(screen.getByRole('button', { name: /filtersButtonLabel/ })).toHaveTextContent('2');
    rerender(<GamesFilters filters={{ title: 'Zelda', sort: 'title_asc' }} onChange={vi.fn()} />);
    expect(screen.getByRole('button', { name: /filtersButtonLabel/ })).toHaveTextContent(/^gamesLibrary.filtersButtonLabel$/);
});
