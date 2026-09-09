import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';

import RenderPlatformIcon from './PlatformIcons';

describe('RenderPlatformIcon', () => {
    it('renders the fallback help icon when identifier is undefined', () => {
        const { container } = render(<RenderPlatformIcon identifier={undefined} />);
        expect(container.querySelector('[data-testid="HelpOutlineOutlinedIcon"]')).toBeTruthy();
    });

    it('renders the fallback help icon for an identifier outside the known mapping', () => {
        const { container } = render(<RenderPlatformIcon identifier={999} />);
        expect(container.querySelector('[data-testid="HelpOutlineOutlinedIcon"]')).toBeTruthy();
    });

    it('renders the fallback help icon for identifier 0 (not a mapped platform)', () => {
        const { container } = render(<RenderPlatformIcon identifier={0} />);
        expect(container.querySelector('[data-testid="HelpOutlineOutlinedIcon"]')).toBeTruthy();
    });

    it('renders a mapped SvgIcon (not the fallback) for a known platform id', () => {
        const { container } = render(<RenderPlatformIcon identifier={1} label="PC" />);
        expect(container.querySelector('svg')).toBeTruthy();
        expect(container.querySelector('[data-testid="HelpOutlineOutlinedIcon"]')).toBeFalsy();
    });

    it('forwards the label prop as the SvgIcon titleAccess (accessible name)', () => {
        const { container } = render(<RenderPlatformIcon identifier={1} label="PC" />);
        const titleEl = container.querySelector('svg > title');
        expect(titleEl?.textContent).toBe('PC');
    });

    it('renders visually distinct markup for two different known platform ids', () => {
        const { container: pc } = render(<RenderPlatformIcon identifier={1} />);
        const { container: ps3 } = render(<RenderPlatformIcon identifier={6} />);
        expect(pc.querySelector('svg')?.innerHTML).not.toEqual(ps3.querySelector('svg')?.innerHTML);
    });

    it('handles every known platform id (1-7) without throwing', () => {
        for (let id = 1; id <= 7; id++) {
            expect(() => render(<RenderPlatformIcon identifier={id} />)).not.toThrow();
        }
    });

    it('renders each known platform id as a mapped icon, not the fallback', () => {
        for (let id = 1; id <= 7; id++) {
            const { container } = render(<RenderPlatformIcon identifier={id} />);
            expect(container.querySelector('[data-testid="HelpOutlineOutlinedIcon"]')).toBeFalsy();
        }
    });
});
