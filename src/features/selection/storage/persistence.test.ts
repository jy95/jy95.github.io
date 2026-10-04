import { emptySelection } from '@/domain/selection/operations';
import { readSelection, writeSelection, SELECTION_STORAGE_KEY } from './persistence';

beforeEach(() => localStorage.clear());
afterEach(() => { vi.restoreAllMocks(); localStorage.clear(); });

it('reads absent storage without creating a document', () => {
    const write = vi.spyOn(Storage.prototype, 'setItem');
    expect(readSelection()).toEqual({ ok: true, document: emptySelection(), invalid: false });
    expect(write).not.toHaveBeenCalled();
    expect(localStorage.getItem(SELECTION_STORAGE_KEY)).toBeNull();
});

it.each(['broken', 'null', '[]', '{}', JSON.stringify({ ...emptySelection(), extra: [] }), JSON.stringify({ ...emptySelection(), games: [1] })])('reports invalid stored data without replacing it: %s', raw => {
    localStorage.setItem(SELECTION_STORAGE_KEY, raw);
    expect(readSelection()).toEqual({ ok: true, document: emptySelection(), invalid: true });
    expect(localStorage.getItem(SELECTION_STORAGE_KEY)).toBe(raw);
});

it('round-trips missing identifiers independently in each category', () => {
    const document = { ...emptySelection(), games: ['missing'], backlog: ['missing'] };
    expect(writeSelection(document)).toBe(true);
    expect(readSelection()).toEqual({ ok: true, document, invalid: false });
});

it('refuses invalid documents at the write boundary', () => {
    const write = vi.spyOn(Storage.prototype, 'setItem');
    expect(writeSelection({ ...emptySelection(), games: [1] } as unknown as ReturnType<typeof emptySelection>)).toBe(false);
    expect(write).not.toHaveBeenCalled();
});

it('reports read and write failures', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('blocked'); });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('blocked'); });
    expect(readSelection()).toEqual({ ok: false });
    expect(writeSelection(emptySelection())).toBe(false);
});
