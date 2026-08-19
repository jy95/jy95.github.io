import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

import AppProvider from './AppProvider';
import { useAppContext } from './useAppContext';
import type { Navigation } from '../types';

function Consumer() {
    const { drawerOpen, toggleDrawer, navigation } = useAppContext();
    return (
        <div>
            <span data-testid="state">{String(drawerOpen)}</span>
            <span data-testid="nav-length">{navigation ? navigation.length : 'none'}</span>
            <button onClick={toggleDrawer}>toggle</button>
        </div>
    );
}

describe('AppProvider', () => {
    it('defaults drawerOpen to false when initialDrawerOpen is omitted', () => {
        render(
            <AppProvider>
                <Consumer />
            </AppProvider>
        );
        expect(screen.getByTestId('state')).toHaveTextContent('false');
    });

    it('respects the initialDrawerOpen prop', () => {
        render(
            <AppProvider initialDrawerOpen>
                <Consumer />
            </AppProvider>
        );
        expect(screen.getByTestId('state')).toHaveTextContent('true');
    });

    it('flips drawerOpen on every toggleDrawer call', () => {
        render(
            <AppProvider>
                <Consumer />
            </AppProvider>
        );
        const button = screen.getByText('toggle');

        fireEvent.click(button);
        expect(screen.getByTestId('state')).toHaveTextContent('true');

        fireEvent.click(button);
        expect(screen.getByTestId('state')).toHaveTextContent('false');

        fireEvent.click(button);
        expect(screen.getByTestId('state')).toHaveTextContent('true');
    });

    it('exposes navigation to the value even when undefined', () => {
        render(
            <AppProvider>
                <Consumer />
            </AppProvider>
        );
        expect(screen.getByTestId('nav-length')).toHaveTextContent('none');
    });

    it('forwards a provided navigation tree through context', () => {
        const navigation: Navigation = [
            { titleKey: 'gamesKey', segment: 'games' },
            { titleKey: 'backlog', segment: 'backlog' },
        ];
        render(
            <AppProvider navigation={navigation}>
                <Consumer />
            </AppProvider>
        );
        expect(screen.getByTestId('nav-length')).toHaveTextContent('2');
    });

    it('keeps a stable toggleDrawer identity across re-renders (useCallback)', () => {
        let capturedFirst: (() => void) | undefined;
        let capturedSecond: (() => void) | undefined;

        function CaptureOnce({ onCapture }: { onCapture: (fn: (() => void) | undefined) => void }) {
            const { toggleDrawer } = useAppContext();
            onCapture(toggleDrawer);
            return null;
        }

        const { rerender } = render(
            <AppProvider>
                <CaptureOnce onCapture={(fn) => (capturedFirst = fn)} />
            </AppProvider>
        );

        rerender(
            <AppProvider>
                <CaptureOnce onCapture={(fn) => (capturedSecond = fn)} />
            </AppProvider>
        );

        expect(capturedFirst).toBe(capturedSecond);
    });
});
