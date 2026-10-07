import { render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { ReactNode } from 'react';
import DashboardSidebar from './DashboardSidebar';

let drawerOpen = false;
vi.mock('./provider/useAppContext', () => ({ useAppContext: () => ({ drawerOpen }) }));
vi.mock('next-intl', () => ({ useTranslations: () => (key: string) => key }));
vi.mock('@mui/material/Drawer', () => ({ default: ({ children, variant }: { children: ReactNode; variant: string }) => <div data-testid={variant}>{children}</div> }));
vi.mock('./DashboardNavigation', () => ({ default: ({ mini }: { mini: boolean }) => <div data-testid="navigation" data-mini={mini} /> }));

describe('DashboardSidebar', () => {
    it('uses full-width mobile navigation even when the drawer state is closed', () => {
        drawerOpen = false;
        render(<DashboardSidebar />);
        expect(within(screen.getByTestId('temporary')).getByTestId('navigation')).toHaveAttribute('data-mini', 'false');
        for (const drawer of screen.getAllByTestId('permanent')) {
            expect(within(drawer).getByTestId('navigation')).toHaveAttribute('data-mini', 'true');
        }
        for (const landmark of screen.getAllByRole('navigation')) {
            expect(landmark).toHaveAccessibleName('navigationLabel');
        }
    });

    it('expands every presentation when the drawer is open', () => {
        drawerOpen = true;
        render(<DashboardSidebar />);
        for (const navigation of screen.getAllByTestId('navigation')) {
            expect(navigation).toHaveAttribute('data-mini', 'false');
        }
    });
});
