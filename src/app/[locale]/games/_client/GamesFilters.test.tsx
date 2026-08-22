import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('@/components/GamesView/GenresSelect', () => ({
    default: () => <div>Genres Component</div>,
}));
vi.mock('@/components/GamesView/PlatformSelect', () => ({
    default: () => <div>Platform Component</div>,
}));
vi.mock('@/components/GamesView/TitleFilter', () => ({
    default: () => <div>Title Component</div>,
}));

import GamesFilters from './GamesFilters';

describe('GamesFilters', () => {
    it('renders the accordion summary with the Options label', async () => {
        render(<GamesFilters />);
        await screen.findByText('Title Component');
        expect(screen.getByText('Options')).toBeInTheDocument();
    });

    it('exposes the summary as an accessible "Options" control', async () => {
        render(<GamesFilters />);
        await screen.findByText('Title Component');
        expect(screen.getByRole('button', { name: /Options/i })).toBeInTheDocument();
    });

    it('eventually renders the lazily-loaded TitleFilter', async () => {
        render(<GamesFilters />);
        expect(await screen.findByText('Title Component')).toBeInTheDocument();
    });

    it('eventually renders the lazily-loaded PlatformSelect', async () => {
        render(<GamesFilters />);
        expect(await screen.findByText('Platform Component')).toBeInTheDocument();
    });

    it('eventually renders the lazily-loaded GenresSelect', async () => {
        render(<GamesFilters />);
        expect(await screen.findByText('Genres Component')).toBeInTheDocument();
    });

    it('renders all three filter components together once resolved', async () => {
        render(<GamesFilters />);
        expect(await screen.findByText('Title Component')).toBeInTheDocument();
        expect(screen.getByText('Platform Component')).toBeInTheDocument();
        expect(screen.getByText('Genres Component')).toBeInTheDocument();
    });
});
