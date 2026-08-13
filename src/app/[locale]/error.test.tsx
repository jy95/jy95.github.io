import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

// 1. Rename the import so it doesn't shadow the native JS Error object
import ErrorComponent from './error'; 

describe('Error boundary page', () => {
    let consoleSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
        consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('renders the generic error message', () => {
        // 2. Now 'ErrorComponent' renders the UI, and 'new Error()' uses native JS Error
        render(<ErrorComponent error={new Error('boom')} reset={vi.fn()} />);
        expect(screen.getByText('Something went wrong !')).toBeInTheDocument();
    });

    it('logs the error to the console on mount', () => {
        const error = new Error('boom');

        render(<ErrorComponent error={error} reset={vi.fn()} />);

        expect(consoleSpy).toHaveBeenCalledWith(error);
    });

    it('calls reset() when "Try Again" is clicked', () => {
        const reset = vi.fn();
        render(<ErrorComponent error={new Error('boom')} reset={reset} />);

        fireEvent.click(screen.getByRole('button', { name: /try again/i }));

        expect(reset).toHaveBeenCalledTimes(1);
    });
});