import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import type { ReactNode } from 'react';

import platformColumn from './platforms';

describe('platforms table column definition', () => {
    it('is configured as a singleSelect column', () => {
        expect(platformColumn.type).toBe('singleSelect');
    });

    it('has a fixed width of 160', () => {
        expect(platformColumn.width).toBe(160);
    });

    it('provides 7 value options, one per known platform', () => {
        expect(platformColumn.valueOptions).toHaveLength(7);
    });

    it('renderCell renders a platform icon for a known identifier', () => {
        const renderCell = platformColumn.renderCell as (params: { value: number }) => ReactNode;
        const { container } = render(<>{renderCell({ value: 1 })}</>);
        expect(container.querySelector('svg')).toBeTruthy();
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
        expect(platformColumn.valueOptions).toBe(platformsFilters);
    });
});
