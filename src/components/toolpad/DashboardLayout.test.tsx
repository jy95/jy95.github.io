import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';

vi.mock('@/i18n/routing', () => ({
    Link: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>,
    usePathname: () => '/games',
}));

vi.mock('next-intl', () => ({
    useTranslations: () => (key: string) => key,
}));

import DashboardLayout from './DashboardLayout';

describe('DashboardLayout', () => {
    it('renders its children inside the main content area', () => {
        render(
            <DashboardLayout>
                <div>Page Body</div>
            </DashboardLayout>
        );
        const mainElement = screen.getByRole('main');
        expect(within(mainElement).getByText('Page Body')).toBeInTheDocument();
    });

    it('renders without a toolbarActions slot when none is provided', () => {
        render(
            <DashboardLayout>
                <div>Content</div>
            </DashboardLayout>
        );
        const toolbarActionsContainer = screen.getByTestId('toolbar-actions-container');
        expect(toolbarActionsContainer).toBeInTheDocument();
        expect(toolbarActionsContainer).toBeEmptyDOMElement();
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
        const mainElement = screen.getByRole('main');
        expect(within(mainElement).getByText('First')).toBeInTheDocument();
        expect(within(mainElement).getByText('Second')).toBeInTheDocument();
    });
});
