import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

const setModeMock = vi.fn();
let mockMode: 'light' | 'dark' | 'system' = 'light';

vi.mock('@mui/material/styles', async (importOriginal) => {
    const actual = await importOriginal<typeof import('@mui/material/styles')>();
    return {
        ...actual,
        useColorScheme: () => ({ mode: mockMode, setMode: setModeMock }),
    };
});

vi.mock('./LanguageToggle', () => ({
    default: () => <div data-testid="language-toggle" />,
}));

import ToolbarActions from './ToolbarActions';
import type { Props } from './types';

const props: Props = {
    settingsLabel: 'Settings',
    modeTitle: 'Mode',
    lightLabel: 'Light',
    darkLabel: 'Dark',
    systemLabel: 'System',
    languageTitle: 'Language',
    frenchLabel: 'French',
    englishLabel: 'English',
};

describe('ToolbarActions', () => {
    beforeEach(() => {
        setModeMock.mockReset();
        mockMode = 'light';
    });

    it('renders the LanguageToggle alongside the theme control', () => {
        render(<ToolbarActions {...props} />);
        expect(screen.getByTestId('language-toggle')).toBeInTheDocument();
    });

    it('opens the theme menu and lists all three mode options', () => {
        render(<ToolbarActions {...props} />);
        fireEvent.click(screen.getByLabelText('Mode'));
        expect(screen.getByText('Light')).toBeInTheDocument();
        expect(screen.getByText('Dark')).toBeInTheDocument();
        expect(screen.getByText('System')).toBeInTheDocument();
    });

    it('calls setMode with "dark" when the Dark option is selected', () => {
        render(<ToolbarActions {...props} />);
        fireEvent.click(screen.getByLabelText('Mode'));
        fireEvent.click(screen.getByText('Dark'));
        expect(setModeMock).toHaveBeenCalledWith('dark');
    });

    it('calls setMode with "light" when the Light option is selected', () => {
        mockMode = 'dark';
        render(<ToolbarActions {...props} />);
        fireEvent.click(screen.getByLabelText('Mode'));
        fireEvent.click(screen.getByText('Light'));
        expect(setModeMock).toHaveBeenCalledWith('light');
    });

    it('calls setMode with "system" when the System option is selected', () => {
        render(<ToolbarActions {...props} />);
        fireEvent.click(screen.getByLabelText('Mode'));
        fireEvent.click(screen.getByText('System'));
        expect(setModeMock).toHaveBeenCalledWith('system');
    });

    it('marks the currently active mode as selected in the menu', () => {
        mockMode = 'dark';
        render(<ToolbarActions {...props} />);
        fireEvent.click(screen.getByLabelText('Mode'));
        const darkItem = screen.getByText('Dark').closest('li');
        expect(darkItem).toHaveClass('Mui-selected');
    });

    it('does not mark an inactive mode as selected', () => {
        mockMode = 'dark';
        render(<ToolbarActions {...props} />);
        fireEvent.click(screen.getByLabelText('Mode'));
        const lightItem = screen.getByText('Light').closest('li');
        expect(lightItem).not.toHaveClass('Mui-selected');
    });

    it('closes the menu after a mode selection', () => {
        render(<ToolbarActions {...props} />);
        fireEvent.click(screen.getByLabelText('Mode'));
        fireEvent.click(screen.getByText('Dark'));
        expect(screen.queryByText('Light')).not.toBeInTheDocument();
    });
});
