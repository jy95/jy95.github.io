import { fireEvent, render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createTheme } from '@mui/material/styles';
import type { DrawerProps } from '@mui/material/Drawer';
import DashboardSidebar from './DashboardSidebar';

let drawerOpen = false;
const toggleDrawer = vi.fn();
vi.mock('./provider/useAppContext', () => ({ useAppContext: () => ({ drawerOpen, toggleDrawer }) }));
vi.mock('next-intl', () => ({ useTranslations: () => (key: string) => key }));
vi.mock('@mui/material/Drawer', () => ({ default: ({ children, variant, open, ModalProps, sx }: DrawerProps) => (
    <div data-testid={variant} data-open={open} data-keep-mounted={ModalProps?.keepMounted} data-sx={JSON.stringify(sx, (_key, value) => typeof value === 'function' ? value(createTheme()) : value)}>{children}</div>
) }));
vi.mock('./DashboardNavigation', () => ({ default: ({ mini }: { mini: boolean }) => <div data-testid="navigation" data-mini={mini}>
    <button>Browse</button><a href="/games" aria-current="page">Games</a>
    <a href="/games/random">Random</a><a href="/links" target="_blank">New tab</a>
  </div> }));

describe('DashboardSidebar', () => {
    beforeEach(() => { toggleDrawer.mockClear(); });

    it.each(['Games', 'Random'])('closes the open temporary drawer for %s', name => {
        drawerOpen = true;
        render(<DashboardSidebar />);
        fireEvent.click(within(screen.getByTestId('temporary')).getByRole('link', { name }));
        expect(toggleDrawer).toHaveBeenCalledTimes(1);
    });

    it('closes after client Link navigation prevents the browser default', () => {
        drawerOpen = true;
        render(<DashboardSidebar />);
        const link = within(screen.getByTestId('temporary')).getByRole('link', { name: 'Games' });
        link.addEventListener('click', event => event.preventDefault());
        fireEvent.click(link);
        expect(toggleDrawer).toHaveBeenCalledTimes(1);
    });

    it('keeps disclosures, permanent drawers, and a closed mobile drawer unchanged', () => {
        drawerOpen = true;
        const { rerender } = render(<DashboardSidebar />);
        fireEvent.click(within(screen.getByTestId('temporary')).getByRole('button'));
        for (const drawer of screen.getAllByTestId('permanent')) {
            fireEvent.click(within(drawer).getByRole('link', { name: 'Games' }));
        }
        drawerOpen = false;
        rerender(<DashboardSidebar />);
        fireEvent.click(within(screen.getByTestId('temporary')).getByRole('link', { name: 'Games' }));
        expect(toggleDrawer).not.toHaveBeenCalled();
    });

    it.each([{ ctrlKey: true }, { metaKey: true }, { shiftKey: true }, { altKey: true }, { button: 1 }])('preserves modified clicks %s', modifiers => {
        drawerOpen = true;
        render(<DashboardSidebar />);
        const mobile = within(screen.getByTestId('temporary'));
        fireEvent.click(mobile.getByRole('link', { name: 'Games' }), modifiers);
        fireEvent.click(mobile.getByRole('link', { name: 'New tab' }));
        expect(toggleDrawer).not.toHaveBeenCalled();
    });

    it.each([false, true])('preserves all responsive drawer configurations when open=%s', (open) => {
        drawerOpen = open;
        render(<DashboardSidebar />);
        const drawers = [screen.getByTestId('temporary'), ...screen.getAllByTestId('permanent')];
        const displays = [
            { xs: 'block', sm: 'none', md: 'none' },
            { xs: 'none', sm: 'block', md: 'none' },
            { xs: 'none', sm: 'none', md: 'block' },
        ];
        for (const [index, drawer] of drawers.entries()) {
            const styles = JSON.parse(drawer.getAttribute('data-sx') ?? '{}');
            expect(styles.display).toEqual(displays[index]);
            expect(styles.width).toBe(index === 0 || open ? 320 : 84);
            expect(styles.transition).toBeTruthy();
            expect(styles['& .MuiDrawer-paper'].width).toBe(styles.width);
            expect(styles['& .MuiDrawer-paper'].transition).toBe(styles.transition);
        }
        expect(drawers[0]).toHaveAttribute('data-open', String(open));
        expect(drawers[0]).toHaveAttribute('data-keep-mounted', 'true');
        for (const drawer of drawers.slice(1)) {
            expect(drawer).not.toHaveAttribute('data-open');
            expect(drawer).not.toHaveAttribute('data-keep-mounted');
        }
    });

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
