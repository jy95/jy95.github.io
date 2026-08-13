import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';

// Stub next-intl's useTranslations so these hooks don't need a real
// NextIntlClientProvider wrapper. The stub echoes back "<count> <lastKeySegment>"
// which is enough to assert usePrettyDuration's join behavior.
vi.mock('next-intl', () => ({
    useTranslations: () => (key: string, opts?: { count?: number }) => {
        const unit = key.split('.').pop();
        const count = opts?.count ?? 0;
        return `${count} ${unit}`;
    },
}));

import { usePrettyDuration, useCalcDate } from './utils';

describe('usePrettyDuration', () => {
    it('joins hours, minutes and seconds translations with spaces', () => {
        const { result } = renderHook(() => usePrettyDuration({ hours: 1, minutes: 2, seconds: 3 }));
        expect(result.current).toBe('1 hours 2 minutes 3 seconds');
    });

    it('handles an all-zero duration', () => {
        const { result } = renderHook(() => usePrettyDuration({ hours: 0, minutes: 0, seconds: 0 }));
        expect(result.current).toBe('0 hours 0 minutes 0 seconds');
    });

    it('reflects large hour values verbatim', () => {
        const { result } = renderHook(() => usePrettyDuration({ hours: 1122, minutes: 31, seconds: 27 }));
        expect(result.current).toBe('1122 hours 31 minutes 27 seconds');
    });
});

describe('useCalcDate', () => {
    it('returns non-negative totals for the current date', () => {
        const now = new Date().toISOString();
        const { result } = renderHook(() => useCalcDate(now));

        expect(result.current.total_days).toBeGreaterThanOrEqual(0);
        expect(result.current.total_weeks).toBeGreaterThanOrEqual(0);
        expect(result.current.total_hours).toBeGreaterThanOrEqual(0);
        expect(result.current.total_minutes).toBeGreaterThanOrEqual(0);
        expect(result.current.total_seconds).toBeGreaterThanOrEqual(0);
    });

    it('computes a large total_days for a date far in the past', () => {
        const { result } = renderHook(() => useCalcDate('2014-04-15T17:35:16+00:00'));
        expect(result.current.total_days).toBeGreaterThan(1000);
    });

    it('computes the same magnitude of days for a symmetric future date', () => {
        const future = new Date();
        future.setFullYear(future.getFullYear() + 5);
        const { result } = renderHook(() => useCalcDate(future.toISOString()));
        expect(result.current.total_days).toBeGreaterThan(1000);
    });

    it('derives total_weeks from total_days (0 when under a week)', () => {
        const soon = new Date();
        soon.setDate(soon.getDate() + 2);
        const { result } = renderHook(() => useCalcDate(soon.toISOString()));
        expect(result.current.total_weeks).toBe(0);
    });

    it('trims the human-readable result string', () => {
        const { result } = renderHook(() => useCalcDate(new Date().toISOString()));
        expect(result.current.result).toBe(result.current.result.trim());
    });
});
