import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

const navigateToRandomGameMock = vi.fn();
let mockIsPending = false;

vi.mock('@/hooks/useNavigateToRandomGame', () => ({
    useNavigateToRandomGame: () => ({
        navigateToRandomGame: navigateToRandomGameMock,
        isPending: mockIsPending,
    }),
}));

import RandomButton from './RandomButton';

describe('RandomButton', () => {
    beforeEach(() => {
        navigateToRandomGameMock.mockReset();
        mockIsPending = false;
    });

    it('renders the provided label', () => {
        render(<RandomButton label="Surprise me" />);
        expect(screen.getByText('Surprise me')).toBeInTheDocument();
    });

    it('calls navigateToRandomGame when clicked', () => {
        render(<RandomButton label="Surprise me" />);
        fireEvent.click(screen.getByRole('button'));
        expect(navigateToRandomGameMock).toHaveBeenCalledTimes(1);
    });

    it('is enabled when not pending', () => {
        render(<RandomButton label="Surprise me" />);
        expect(screen.getByRole('button')).toBeEnabled();
    });

    it('disables the button and shows a spinner while pending', () => {
        mockIsPending = true;
        render(<RandomButton label="Surprise me" />);
        expect(screen.getByRole('button')).toBeDisabled();
        expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('does not show a spinner when not pending', () => {
        render(<RandomButton label="Surprise me" />);
        expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
});
