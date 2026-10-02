export type GridViewport = { width: number; columns: number; top: number; viewport: number };

const OVERSCAN = 2;

export function calculateVirtualGrid(count: number, layout: GridViewport, gap: number) {
    // Both card variants have square media and absolutely positioned content.
    const cardSize = (layout.width - gap * (layout.columns - 1)) / layout.columns;
    const stride = cardSize + gap;
    const rows = Math.ceil(count / layout.columns);
    const height = Math.max(0, rows * stride - gap);
    if (rows === 0) return { cardSize, stride, height, start: 0, end: 0 };

    const lastRow = rows - 1;
    const viewportFirstRow = Math.floor(layout.top / stride);
    const viewportLastRow = Math.floor((layout.top + layout.viewport) / stride);
    // A resize can leave the viewport beyond the grid; retain the final row.
    const firstVisibleRow = Math.max(0, Math.min(lastRow, viewportFirstRow - OVERSCAN));
    const lastVisibleRow = Math.min(lastRow, Math.max(firstVisibleRow, viewportLastRow + OVERSCAN));
    const start = firstVisibleRow * layout.columns;
    const end = Math.min(count, (lastVisibleRow + 1) * layout.columns);
    return { cardSize, stride, height, start, end };
}
