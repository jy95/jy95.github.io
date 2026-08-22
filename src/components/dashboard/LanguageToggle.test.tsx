import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

const replaceMock = vi.fn();
let mockLocale = 'en';
let mockPathname = '/games';
let mockParams: Record<string, string> = {};

vi.mock('next-intl', () => ({
    useLocale: () => mockLocale,
}));

vi.mock('next/navigation', () => ({
    useParams: () => mockParams,
}));

vi.mock('@/i18n/routing', () => ({
    usePathname: () => mockPathname,
    useRouter: () => ({ replace: replaceMock }),
}));

import LanguageToggle from './LanguageToggle';

const props = {
    englishLabel: 'English',
    frenchLabel: 'French',
    languageTitle: 'Language',
};

describe('LanguageToggle', () => {
    beforeEach(() => {
        replaceMock.mockReset();
        mockLocale = 'en';
        mockPathname = '/games';
        mockParams = {};
    });

    it('renders the current locale as the button label', () => {
        render(<LanguageToggle {...props} />);
        expect(screen.getByText('en')).toBeInTheDocument();
    });

    it('opens the menu and shows both language options', () => {
        render(<LanguageToggle {...props} />);
        fireEvent.click(screen.getByText('en'));
        expect(screen.getByText('French')).toBeInTheDocument();
        expect(screen.getByText('English')).toBeInTheDocument();
    });

    it('does not navigate when selecting the already-active locale', () => {
        render(<LanguageToggle {...props} />);
        fireEvent.click(screen.getByText('en'));
        fireEvent.click(screen.getByText('English'));
        expect(replaceMock).not.toHaveBeenCalled();
    });

    it('navigates with a plain pathname when there are no dynamic route params', () => {
        render(<LanguageToggle {...props} />);
        fireEvent.click(screen.getByText('en'));
        fireEvent.click(screen.getByText('French'));
        expect(replaceMock).toHaveBeenCalledWith('/games', { locale: 'fr' });
    });

    it('navigates with a pathname+params object when dynamic route params are present', () => {
        mockPathname = '/video/[id]';
        mockParams = { id: 'abc123' };
        render(<LanguageToggle {...props} />);
        fireEvent.click(screen.getByText('en'));
        fireEvent.click(screen.getByText('French'));
        expect(replaceMock).toHaveBeenCalledWith(
            { pathname: '/video/[id]', params: { id: 'abc123' } },
            { locale: 'fr' }
        );
    });

    it('excludes the [locale] segment itself from the forwarded route params', () => {
        mockPathname = '/video/[id]';
        mockParams = { id: 'abc123', locale: 'en' };
        render(<LanguageToggle {...props} />);
        fireEvent.click(screen.getByText('en'));
        fireEvent.click(screen.getByText('French'));
        expect(replaceMock).toHaveBeenCalledWith(
            { pathname: '/video/[id]', params: { id: 'abc123' } },
            { locale: 'fr' }
        );
    });

    it('closes the menu after a selection', () => {
        render(<LanguageToggle {...props} />);
        fireEvent.click(screen.getByText('en'));
        fireEvent.click(screen.getByText('French'));
        expect(screen.queryByText('English')).not.toBeInTheDocument();
    });

    it('renders the French locale button label when the active locale is fr', () => {
        mockLocale = 'fr';
        render(<LanguageToggle {...props} />);
        expect(screen.getByText('fr')).toBeInTheDocument();
    });
});
