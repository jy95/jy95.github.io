import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';

import SkeletonStats from './SkeletonStats';

describe('SkeletonStats', () => {
    it('renders without crashing', () => {
        const { container } = render(<SkeletonStats />);
        expect(container.firstChild).toBeTruthy();
    });

    it('renders multiple skeleton placeholders (key numbers, genres, platforms)', () => {
        const { container } = render(<SkeletonStats />);
        const skeletons = container.querySelectorAll('.MuiSkeleton-root');
        // Each of the 3 sub-skeletons (key number, genres, platforms) renders
        // 2 MuiSkeleton-root nodes (a text one + a rectangular one) = 6 total.
        expect(skeletons.length).toBe(6);
    });

    it('renders exactly one rectangular skeleton per section', () => {
        const { container } = render(<SkeletonStats />);
        const rectangular = container.querySelectorAll('.MuiSkeleton-rectangular');
        expect(rectangular.length).toBe(3);
    });
});
