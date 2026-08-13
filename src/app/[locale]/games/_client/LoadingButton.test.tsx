import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

import LoadingButton from './LoadingButton';

describe('LoadingButton', () => {
    it('renders the label when not loading', () => {
        render(<LoadingButton onClick={vi.fn()} label="Load more" />);
        expect(screen.getByText('Load more')).toBeInTheDocument();
    });

    it('shows a spinner instead of the label while loading', () => {
        render(<LoadingButton onClick={vi.fn()} loading label="Load more" />);
        expect(screen.queryByText('Load more')).not.toBeInTheDocument();
        expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('invokes onClick when clicked', () => {
        const onClick = vi.fn();
        render(<LoadingButton onClick={onClick} label="Load more" />);
        fireEvent.click(screen.getByRole('button'));
        expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('is disabled when the disabled prop is true', () => {
        render(<LoadingButton onClick={vi.fn()} disabled label="Load more" />);
        expect(screen.getByRole('button')).toBeDisabled();
    });

    it('is disabled while loading, even if disabled prop is false', () => {
        render(<LoadingButton onClick={vi.fn()} loading disabled={false} label="Load more" />);
        expect(screen.getByRole('button')).toBeDisabled();
    });

    it('is enabled by default when neither disabled nor loading is set', () => {
        render(<LoadingButton onClick={vi.fn()} label="Load more" />);
        expect(screen.getByRole('button')).toBeEnabled();
    });
});
