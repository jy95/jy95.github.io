import { calculateVirtualGrid } from './virtualGrid';

const viewport = { width: 600, columns: 2, top: 0, viewport: 600 };

it.each([2, 3, 6])('calculates square cards and spacing for %i columns', columns => {
    const grid = calculateVirtualGrid(13, { ...viewport, columns }, 8);
    expect(grid.cardSize * columns + 8 * (columns - 1)).toBeCloseTo(600);
    expect(grid.stride).toBe(grid.cardSize + 8);
    expect(grid.height).toBe(Math.ceil(13 / columns) * grid.stride - 8);
    expect(grid.end).toBeLessThanOrEqual(13);
});

it('handles empty and short lists explicitly', () => {
    expect(calculateVirtualGrid(0, viewport, 8)).toMatchObject({ height: 0, start: 0, end: 0 });
    expect(calculateVirtualGrid(1, viewport, 8)).toMatchObject({ height: 296, start: 0, end: 1 });
});

it('includes overscan and clamps ranges before and beyond the grid', () => {
    expect(calculateVirtualGrid(1000, { ...viewport, top: 6000 }, 8)).toMatchObject({ start: 34, end: 48 });
    expect(calculateVirtualGrid(1000, { ...viewport, top: -1000 }, 8)).toMatchObject({ start: 0, end: 2 });
    expect(calculateVirtualGrid(1000, { ...viewport, columns: 6, top: 140000 }, 8)).toMatchObject({ start: 996, end: 1000 });
});
