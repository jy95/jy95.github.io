import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

import DashboardLayout from './DashboardLayout';

describe('DashboardLayout', () => {
    it('renders its children inside the main content area', () => {
        render(
            <DashboardLayout>
                <div>Page Body</div>
            </DashboardLayout>
        );
        expect(screen.getByText('Page Body')).toBeInTheDocument();
    });

    it('renders without a toolbarActions slot when none is provided', () => {
        const { container } = render(
            <DashboardLayout>
                <div>Content</div>
            </DashboardLayout>
        );
        expect(container).toBeTruthy();
        expect(screen.getByText('Content')).toBeInTheDocument();
    });

    it('renders a custom toolbarActions slot component when provided', () => {
        function CustomActions({ label }: { label: string }) {
            return <span>{label}</span>;
        }
        render(
            <DashboardLayout
                slots={{ toolbarActions: CustomActions }}
                slotProps={{ toolbarActions: { label: 'Custom Action' } }}
            >
                <div>Body</div>
            </DashboardLayout>
        );
        expect(screen.getByText('Custom Action')).toBeInTheDocument();
    });

    it('renders multiple children fragments correctly', () => {
        render(
            <DashboardLayout>
                <span>First</span>
                <span>Second</span>
            </DashboardLayout>
        );
        expect(screen.getByText('First')).toBeInTheDocument();
        expect(screen.getByText('Second')).toBeInTheDocument();
    });
});
