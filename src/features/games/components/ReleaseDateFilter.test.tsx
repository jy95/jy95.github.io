import { afterEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import en from '../../../../messages/en.json';
import fr from '../../../../messages/fr.json';
import type { GameFilters } from '@/types/gamesFilters';
import { MIN_RELEASE_YEAR, normalizeGameFilters } from '@/lib/gamesFilterUtils';
import ReleaseDateFilter from './ReleaseDateFilter';

afterEach(() => vi.useRealTimers());

describe.each([
    { locale: 'en', messages: en },
    { locale: 'fr', messages: fr },
] as const)('release slider in $locale', ({ locale, messages }) => {
    it.each(['light', 'dark'] as const)('shows the dynamic default range and accessible thumbs in %s mode', mode => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date(2028, 5, 1));
        render(
            <NextIntlClientProvider locale={locale} messages={messages}>
                <ThemeProvider theme={createTheme({ palette: { mode } })}>
                    <ReleaseDateFilter filters={{}} onChange={vi.fn()} />
                </ThemeProvider>
            </NextIntlClientProvider>
        );
        const labels = messages.gamesLibrary.releasePeriod;
        const start = screen.getByRole('slider', { name: labels.from });
        const end = screen.getByRole('slider', { name: labels.to });
        expect(start).toHaveValue(String(MIN_RELEASE_YEAR));
        expect(end).toHaveValue('2028');
        for (const thumb of [start, end]) {
            expect(thumb).toHaveAttribute('min', String(MIN_RELEASE_YEAR));
            expect(thumb).toHaveAttribute('max', '2028');
            expect(thumb).toHaveAttribute('step', '1');
            expect(thumb.tabIndex).toBe(0);
        }
        expect(screen.getByRole('group', { name: labels.label })).toHaveTextContent(`${MIN_RELEASE_YEAR}–2028`);
        expect(screen.getByText('2000')).toBeInTheDocument();
        expect(screen.queryByText('2001')).not.toBeInTheDocument();
    });

    it('selects 2000–2005 using the controlled filter state and clears at the full range', () => {
        const onChange = vi.fn();
        function Controlled() {
            const [filters, setFilters] = useState<GameFilters>({});
            return <ReleaseDateFilter filters={filters} onChange={changes => {
                const next = normalizeGameFilters({ ...filters, ...changes });
                setFilters(next);
                onChange(next);
            }} />;
        }
        render(<NextIntlClientProvider locale={locale} messages={messages}><Controlled /></NextIntlClientProvider>);
        const labels = messages.gamesLibrary.releasePeriod;
        const start = screen.getByRole('slider', { name: labels.from });
        const end = screen.getByRole('slider', { name: labels.to });
        fireEvent.change(start, { target: { value: '2000' } });
        fireEvent.change(end, { target: { value: '2005' } });
        expect(onChange).toHaveBeenLastCalledWith({ releaseDateFrom: 2000, releaseDateTo: 2005 });
        expect(screen.getByRole('group')).toHaveTextContent('2000–2005');
        fireEvent.change(start, { target: { value: String(MIN_RELEASE_YEAR) } });
        fireEvent.change(end, { target: { value: String(new Date().getFullYear()) } });
        expect(onChange).toHaveBeenLastCalledWith({});
    });
});
