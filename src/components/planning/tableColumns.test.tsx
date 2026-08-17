import { describe, expect, it } from 'vitest';
import { render, screen } from '`@testing-library/react`';

import tableColumns from './tableColumns';
import type { Props } from './tableColumns';

const baseProps: Props = {
    titleLabel: 'Title',
    platformLabel: 'Platform',
    releaseDateLabel: 'Release date',
    endDateLabel: 'End date',
    statusLabel: 'Status',
    statesLabels: {
        RECORDED: 'Recorded',
        PENDING: 'Pending',
    },
};

function getColumn(field: string) {
    const column = tableColumns(baseProps).find((item) => item.field === field);

    if (!column) {
        throw new Error(`Column "${field}" was not found`);
    }

    return column;
}

describe('planning tableColumns', () => {
    it('returns the expected columns in display order', () => {
        expect(tableColumns(baseProps).map((column) => column.field)).toEqual([
            'title',
            'platform',
            'availableAt',
            'endAt',
            'status',
        ]);
    });

    it('forwards each supplied label to its matching column', () => {
        expect(getColumn('title').headerName).toBe('Title');
        expect(getColumn('platform').headerName).toBe('Platform');
        expect(getColumn('availableAt').headerName).toBe('Release date');
        expect(getColumn('endAt').headerName).toBe('End date');
        expect(getColumn('status').headerName).toBe('Status');
    });

    it('uses the shared single-select platform configuration', () => {
        const platformColumn = getColumn('platform');

        expect(platformColumn.type).toBe('singleSelect');
        expect(platformColumn.width).toBe(160);
        expect(platformColumn.valueOptions).toBeDefined();
        expect(platformColumn.renderCell).toBeTypeOf('function');
    });

    it.each([
        ['availableAt', '2025-04-15'],
        ['endAt', '2025-04-30'],
    ])('converts the %s string into a Date', (field, value) => {
        const column = getColumn(field);

        expect((column.valueGetter as (input: string) => Date)(value)).toEqual(new Date(value));
    });

    it.each(['availableAt', 'endAt'])('keeps an empty %s value empty', (field) => {
        const column = getColumn(field);

        expect((column.valueGetter as (input: undefined) => undefined)(undefined)).toBeUndefined();
    });

    it('configures both date columns as date fields', () => {
        expect(getColumn('availableAt').type).toBe('date');
        expect(getColumn('endAt').type).toBe('date');
    });

    it('configures the status column as a single-select field', () => {
        const column = getColumn('status');

        expect(column.type).toBe('singleSelect');
        expect(column.width).toBe(130);
        expect(column.valueOptions).toHaveLength(2);
        expect(column.valueOptions).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ value: 'RECORDED' }),
                expect.objectContaining({ value: 'PENDING' }),
            ])
        );
    });

    it('renders the recorded icon with the recorded tooltip text', () => {
        const renderCell = getColumn('status').renderCell as (params: { value: string }) => React.ReactNode;

        render(<>{renderCell({ value: 'RECORDED' })}</>);

        expect(screen.getByLabelText('RECORDED')).toHaveAttribute('title', 'Recorded');
    });

    it('renders the pending icon with the pending tooltip text', () => {
        const renderCell = getColumn('status').renderCell as (params: { value: string }) => React.ReactNode;

        render(<>{renderCell({ value: 'PENDING' })}</>);

        expect(screen.getByLabelText('PENDING')).toHaveAttribute('title', 'Pending');
    });

    it('renders the title value inside an accessible tooltip', () => {
        const renderCell = getColumn('title').renderCell as (params: { value: string }) => React.ReactNode;

        render(<>{renderCell({ value: 'Celeste' })}</>);

        expect(screen.getByLabelText('Celeste')).toHaveTextContent('Celeste');
    });
});
