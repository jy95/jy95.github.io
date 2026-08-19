import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';

import platformsOptions from './platformsFilters';

describe('platformsFilters options', () => {
    it('produces exactly 7 options, matching platform ids 1 through 7 in order', () => {
        expect(platformsOptions).toHaveLength(7);
        expect((platformsOptions as any[]).map((o) => o.value)).toEqual([1, 2, 3, 4, 5, 6, 7]);
    });

    it('renders a distinct label element containing an svg icon for every option', () => {
        for (const option of platformsOptions as any[]) {
            const { container } = render(<>{option.label}</>);
            expect(container.querySelector('svg')).toBeTruthy();
        }
    });

    it('never falls back to the generic help icon for any of the 7 known platform ids', () => {
        for (const option of platformsOptions as any[]) {
            const { container } = render(<>{option.label}</>);
            expect(container.querySelector('[data-testid="HelpOutlineOutlinedIcon"]')).toBeFalsy();
        }
    });

    it('renders visually distinct icons for two different platform ids', () => {
        const options = platformsOptions as any[];
        const { container: pc } = render(<>{options[0].label}</>);
        const { container: gba } = render(<>{options[1].label}</>);
        expect(pc.querySelector('svg')?.innerHTML).not.toEqual(gba.querySelector('svg')?.innerHTML);
    });
});
