import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('next-intl', () => ({
    useTranslations: (ns?: string) => (key: string) => (ns ? `${ns}.${key}` : key),
}));

const dispatchMock = vi.fn();
let mockSelectedPlatform: number | undefined;

vi.mock('@/redux/hooks', () => ({
    useAppDispatch: () => dispatchMock,
    useAppSelector: (selector: any) =>
        selector({
            games: {
                activeFilters:
                    mockSelectedPlatform !== undefined
                        ? [{ key: 'selected_platform', value: mockSelectedPlatform }]
                        : [],
            },
        }),
}));

const getPlatformsQueryMock = vi.fn();
vi.mock('@/redux/services/platformsAPI', () => ({
    useGetPlatformsQuery: () => getPlatformsQueryMock(),
}));

import PlatformSelect from './PlatformSelect';

describe('PlatformSelect', () => {
    beforeEach(() => {
        dispatchMock.mockReset();
        mockSelectedPlatform = undefined;
        getPlatformsQueryMock.mockReset().mockReturnValue({
            data: [
                { id: 1, name: 'PC' },
                { id: 6, name: 'PS3' },
            ],
            isFetching: false,
        });
    });

    it('renders the translated filter label', () => {
        render(<PlatformSelect />);
        expect(screen.getByLabelText('gamesLibrary.filtersLabels.platform')).toBeInTheDocument();
    });

    it('shows an empty field when no platform filter is active', () => {
        render(<PlatformSelect />);
        expect(screen.getByLabelText('gamesLibrary.filtersLabels.platform')).toHaveValue('');
    });

    it('shows the matching platform name when a platform filter is active', () => {
        mockSelectedPlatform = 6;
        render(<PlatformSelect />);
        expect(screen.getByLabelText('gamesLibrary.filtersLabels.platform')).toHaveValue('PS3');
    });

    it('shows a different platform name for a different selected id', () => {
        mockSelectedPlatform = 1;
        render(<PlatformSelect />);
        expect(screen.getByLabelText('gamesLibrary.filtersLabels.platform')).toHaveValue('PC');
    });

    it('falls back to an empty name when the selected platform id is not in the fetched list', () => {
        mockSelectedPlatform = 999;
        render(<PlatformSelect />);
        expect(screen.getByLabelText('gamesLibrary.filtersLabels.platform')).toHaveValue('');
    });

    it('falls back to an empty name when the platforms list has not loaded yet', () => {
        mockSelectedPlatform = 1;
        getPlatformsQueryMock.mockReturnValue({ data: undefined, isFetching: true });
        render(<PlatformSelect />);
        expect(screen.getByLabelText('gamesLibrary.filtersLabels.platform')).toHaveValue('');
    });

    it('does not dispatch anything on initial render', () => {
        render(<PlatformSelect />);
        expect(dispatchMock).not.toHaveBeenCalled();
    });
});
