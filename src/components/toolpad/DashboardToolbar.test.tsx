import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

let mockDrawerOpen = false;
const toggleDrawerMock = vi.fn();

vi.mock('./provider/useAppContext', () => ({
    useAppContext: () => ({ drawerOpen: mockDrawerOpen, toggleDrawer: toggleDrawerMock }),
}));

vi.mock('./Branding', () => ({
    default: () => <div>Branding</div>,
}));

import DashboardToolbar from './DashboardToolbar';

describe('DashboardToolbar', () => {
    beforeEach(() => {
        mockDrawerOpen = false;
        toggleDrawerMock.mockReset();
    });

    it('renders the Branding', () => {
        render(<DashboardToolbar />);
        expect(screen.getByText('Branding')).toBeInTheDocument();
    });

    it('shows the "expand" icon button label when the drawer is closed', () => {
        render(<DashboardToolbar />);
        expect(screen.getByLabelText('Expand navigation menu')).toBeInTheDocument();
    });

    it('shows the "collapse" icon button label when the drawer is open', () => {
        mockDrawerOpen = true;
        render(<DashboardToolbar />);
        expect(screen.getByLabelText('Collapse navigation menu')).toBeInTheDocument();
    });

    it('calls toggleDrawer when the menu icon is clicked', () => {
        render(<DashboardToolbar />);
        fireEvent.click(screen.getByLabelText('Expand navigation menu'));
        expect(toggleDrawerMock).toHaveBeenCalledTimes(1);
    });

    it('renders an empty toolbar-actions container when no slot is provided', () => {
        render(<DashboardToolbar />);
        const container = screen.getByTestId('toolbar-actions-container');
        expect(container).toBeEmptyDOMElement();
    });

    it('renders a custom toolbarActions slot component with its slotProps', () => {
        function CustomActions({ label }: { label: string }) {
            return <span>{label}</span>;
        }
        render(
            <DashboardToolbar
                slots={{ toolbarActions: CustomActions }}
                slotProps={{ toolbarActions: { label: 'Custom Action' } }}
            />
        );
        expect(screen.getByText('Custom Action')).toBeInTheDocument();
    });

    it('does not render a toolbarActions slot when only slotProps is provided without slots', () => {
        render(<DashboardToolbar slotProps={{ toolbarActions: { label: 'Orphan Action' } }} />);
        expect(screen.queryByText('Orphan Action')).not.toBeInTheDocument();
    });
});
