import { describe, it, expect } from 'vitest';
import tableColumns from './tableColumns';
import type { Props } from './tableColumns';

const baseProps: Props = {
    titleLabel: 'Title',
    platformLabel: 'Platform',
    notesLabel: 'Notes',
    hltbLabel: 'HLTB',
    votesLabel: 'Votes',
};

function getColumn(field: string) {
    const column = tableColumns(baseProps).find((c) => c.field === field);
    if (!column) throw new Error(`Column "${field}" not found`);
    return column;
}

describe('backlog tableColumns', () => {
    it('produces exactly the expected set of columns', () => {
        const fields = tableColumns(baseProps).map((c) => c.field);
        expect(fields).toEqual(['title', 'platform', 'votes', 'notes', 'hltb_main']);
    });

    it('forwards the provided labels onto the matching columns', () => {
        expect(getColumn('title').headerName).toBe('Title');
        expect(getColumn('platform').headerName).toBe('Platform');
        expect(getColumn('votes').headerName).toBe('Votes');
        expect(getColumn('notes').headerName).toBe('Notes');
        expect(getColumn('hltb_main').headerName).toBe('HLTB');
    });

    it('marks the votes column as numeric type', () => {
        expect(getColumn('votes').type).toBe('number');
    });

    describe('hltb_main column', () => {
        const column = getColumn('hltb_main');

        it('valueGetter converts "HH:MM:SS" into total seconds', () => {
            expect((column.valueGetter as any)('01:30:00')).toBe(5400);
        });

        it('valueGetter converts a duration with no whole hours', () => {
            expect((column.valueGetter as any)('00:05:00')).toBe(300);
        });

        it('valueGetter returns 0 for an undefined value', () => {
            expect((column.valueGetter as any)(undefined)).toBe(0);
        });

        it('valueGetter returns 0 for an empty string', () => {
            expect((column.valueGetter as any)('')).toBe(0);
        });

        it('valueFormatter returns "-" for zero', () => {
            expect((column.valueFormatter as any)(0)).toBe('-');
        });

        it('valueFormatter returns "-" for a negative value', () => {
            expect((column.valueFormatter as any)(-10)).toBe('-');
        });

        it('valueFormatter returns "-" for undefined', () => {
            expect((column.valueFormatter as any)(undefined)).toBe('-');
        });

        it('valueFormatter shows only minutes when under an hour', () => {
            expect((column.valueFormatter as any)(1800)).toBe('30m');
        });

        it('valueFormatter shows hours and minutes when both are present', () => {
            // 5430s = 1h 30m 30s -> minutes floored to 30, seconds dropped
            expect((column.valueFormatter as any)(5430)).toBe('1h 30m');
        });

        it('valueFormatter shows only hours when minutes are exactly zero', () => {
            expect((column.valueFormatter as any)(7200)).toBe('2h');
        });

        it('valueFormatter handles large multi-hour durations', () => {
            // 10h 15m
            expect((column.valueFormatter as any)(36900)).toBe('10h 15m');
        });

        it('round-trips valueGetter into valueFormatter for a realistic duration string', () => {
            const seconds = (column.valueGetter as any)('02:45:00');
            expect((column.valueFormatter as any)(seconds)).toBe('2h 45m');
        });
    });
});
