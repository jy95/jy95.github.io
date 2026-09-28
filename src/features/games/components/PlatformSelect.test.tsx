import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { echoTranslations } from '@/test/mocks/nextIntl';

vi.mock('next-intl', () => echoTranslations());

const onChange = vi.fn();
let mockSelectedPlatform: number | undefined;

const getPlatformsQueryMock = vi.fn();
vi.mock('@/redux/services/platformsAPI', () => ({
    useGetPlatformsQuery: () => getPlatformsQueryMock(),
}));

import PlatformSelect from './PlatformSelect';

describe('PlatformSelect', () => {
    beforeEach(() => {
        onChange.mockReset();
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
        render(<PlatformSelect value={mockSelectedPlatform} onChange={onChange} />);
        expect(screen.getByLabelText('gamesLibrary.filtersLabels.platform')).toBeInTheDocument();
    });

    it('shows an empty field when no platform filter is active', () => {
        render(<PlatformSelect value={mockSelectedPlatform} onChange={onChange} />);
        expect(screen.getByLabelText('gamesLibrary.filtersLabels.platform')).toHaveValue('');
    });

    it('selects and clears a platform through the autocomplete', async () => {
        const { rerender } = render(<PlatformSelect value={mockSelectedPlatform} onChange={onChange} />);
        const input = screen.getByLabelText('gamesLibrary.filtersLabels.platform');
        fireEvent.mouseDown(input);
        fireEvent.click(await screen.findByRole('option', { name: 'PS3' }));
        expect(onChange).toHaveBeenLastCalledWith(6);

        mockSelectedPlatform = 6;
        rerender(<PlatformSelect value={mockSelectedPlatform} onChange={onChange} />);
        expect(input).toHaveValue('PS3');
        fireEvent.click(screen.getByTitle('Clear'));
        expect(onChange).toHaveBeenLastCalledWith(undefined);
    });

    it('falls back to an empty name when the selected platform id is not in the fetched list', () => {
        mockSelectedPlatform = 999;
        render(<PlatformSelect value={mockSelectedPlatform} onChange={onChange} />);
        expect(screen.getByLabelText('gamesLibrary.filtersLabels.platform')).toHaveValue('');
    });

    it('falls back to an empty name when the platforms list has not loaded yet', () => {
        mockSelectedPlatform = 1;
        getPlatformsQueryMock.mockReturnValue({ data: undefined, isFetching: true });
        render(<PlatformSelect value={mockSelectedPlatform} onChange={onChange} />);
        expect(screen.getByLabelText('gamesLibrary.filtersLabels.platform')).toHaveValue('');
    });

    it('does not call onChange on initial render', () => {
        render(<PlatformSelect value={mockSelectedPlatform} onChange={onChange} />);
        expect(onChange).not.toHaveBeenCalled();
    });
});
