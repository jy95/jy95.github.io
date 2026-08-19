import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import type { ReactNode } from 'react';
import type { GridSingleSelectColDef } from '@mui/x-data-grid';

import platformColumn from './platforms';

type PlatformColumn = {
    platform?: number
}

describe('platforms table column definition', () => {
    it('is configured as a singleSelect column', () => {
        expect(platformColumn.type).toBe('singleSelect');
    });

    it('has a fixed width of 160', () => {
        expect(platformColumn.width).toBe(160);
    });

    it('provides 7 value options, one per known platform', () => {
        const column = platformColumn as GridSingleSelectColDef<PlatformColumn, number>;
        const { valueOptions } = column;

        expect(valueOptions).toHaveLength(7);

        if (!Array.isArray(valueOptions)) {
            throw new Error('Expected valueOptions to be an array');
        }

        // Verify exact platform identifiers: PC, GBA, PSP, PS1, PS2, PS3, SCUMMVM
        const expectedPlatforms = [1, 2, 3, 4, 5, 6, 7];
        const actualValues = valueOptions.map((option) => {
            if (typeof option === 'object' && option !== null && 'value' in option) {
                return option.value;
            }

            return option;
        });

        expect(actualValues).toEqual(expectedPlatforms);
    });

    it.each([
        { platformId: 1, name: 'PC', expectedPathPrefix: 'M4.539 7.516' },
        { platformId: 2, name: 'GBA', expectedPathPrefix: 'M12 19.199' },
        { platformId: 3, name: 'PSP', expectedPathPrefix: 'M3.238 9.313' },
        { platformId: 4, name: 'PS1', expectedPathPrefix: 'M8.985 2.596' },
        { platformId: 5, name: 'PS2', expectedPathPrefix: 'M7.46 13.779' },
        { platformId: 6, name: 'PS3', expectedPathPrefix: 'M15.363 9.438' },
        { platformId: 7, name: 'SCUMMVM', expectedPathPrefix: 'M16.662 1.348' },
    ])('renderCell renders the $name platform icon for identifier $platformId', ({ platformId, expectedPathPrefix }) => {
        const renderCell = platformColumn.renderCell as (params: { value: number }) => ReactNode;
        const { container } = render(<>{renderCell({ value: platformId })}</>);
        const svg = container.querySelector('svg');

        expect(svg).toBeTruthy();
        // Verify it's not the fallback help icon
        expect(container.querySelector('[data-testid="HelpOutlineOutlinedIcon"]')).toBeNull();
        // Verify the specific expected platform icon is rendered by checking path d attribute
        const path = container.querySelector('path');

        expect(path).toBeTruthy();

        const dAttr = path?.getAttribute('d');

        expect(dAttr).toBeTruthy();
        expect(dAttr?.startsWith(expectedPathPrefix)).toBe(true);
    });

    it('renderCell falls back to the help icon for an unknown identifier', () => {
        const renderCell = platformColumn.renderCell as (params: { value: number }) => ReactNode;
        const { container } = render(<>{renderCell({ value: 999 })}</>);

        expect(container.querySelector('[data-testid="HelpOutlineOutlinedIcon"]')).toBeTruthy();
    });

    it('renderCell falls back to the help icon when value is undefined', () => {
        const renderCell = platformColumn.renderCell as (params: { value: number | undefined }) => ReactNode;
        const { container } = render(<>{renderCell({ value: undefined })}</>);

        expect(container.querySelector('[data-testid="HelpOutlineOutlinedIcon"]')).toBeTruthy();
    });

    it('reuses the same valueOptions array as platformsFilters (single source of truth)', async () => {
        const platformsFilters = (await import('@/components/filters/platformsFilters')).default;
        const column = platformColumn as GridSingleSelectColDef<PlatformColumn, number>;

        expect(column.valueOptions).toBe(platformsFilters);
    });
});
