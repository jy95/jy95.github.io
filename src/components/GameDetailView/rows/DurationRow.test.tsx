import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

// Echoes back "<count> <unit>" so we can assert PrettyDuration's join logic
// without a real NextIntlClientProvider.
vi.mock('next-intl', () => ({
    useTranslations: () => (key: string, opts?: { count?: number }) => {
        const unit = key.split('.').pop();
        const count = opts?.count ?? 0;
        return `${count} ${unit}`;
    },
}));

import PrettyDuration from './DurationRow';

describe('PrettyDuration', () => {
    it('renders hours and minutes when both are present', () => {
        render(<PrettyDuration duration="02:15:00" />);
        expect(screen.getByText('2 hours 15 minutes')).toBeInTheDocument();
    });

    it('renders only minutes when hours is 0', () => {
        render(<PrettyDuration duration="00:45:00" />);
        expect(screen.getByText('45 minutes')).toBeInTheDocument();
    });

    it('renders only hours when minutes is 0', () => {
        render(<PrettyDuration duration="03:00:00" />);
        expect(screen.getByText('3 hours')).toBeInTheDocument();
    });

    it('falls back to seconds only when both hours and minutes are 0', () => {
        render(<PrettyDuration duration="00:00:30" />);
        expect(screen.getByText('30 seconds')).toBeInTheDocument();
    });

    it('renders nothing when the whole duration is zero', () => {
        const { container } = render(<PrettyDuration duration="00:00:00" />);
        expect(container.textContent).toBe('');
    });

    it('defaults missing minutes/seconds segments to 0 when duration is a partial string', () => {
        render(<PrettyDuration duration="05" />);
        expect(screen.getByText('5 hours')).toBeInTheDocument();
    });

    it('never shows seconds when hours or minutes are present, even if seconds are non-zero', () => {
        render(<PrettyDuration duration="01:00:45" />);
        expect(screen.getByText('1 hours')).toBeInTheDocument();
        expect(screen.queryByText(/seconds/)).not.toBeInTheDocument();
    });

    it('renders a different value on re-render with a new duration prop', () => {
        const { rerender } = render(<PrettyDuration duration="01:00:00" />);
        expect(screen.getByText('1 hours')).toBeInTheDocument();

        rerender(<PrettyDuration duration="00:30:00" />);
        expect(screen.getByText('30 minutes')).toBeInTheDocument();
        expect(screen.queryByText('1 hours')).not.toBeInTheDocument();
    });
});
