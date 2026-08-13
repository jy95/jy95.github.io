import { describe, it, expect, vi, beforeEach } from 'vitest';

const redirectMock = vi.fn();

vi.mock('@/i18n/routing', () => ({
    redirect: (...args: unknown[]) => redirectMock(...args),
}));

vi.mock('next-intl/server', () => ({
    getLocale: vi.fn().mockResolvedValue('fr'),
}));

import RootPage from './page';

describe('RootPage', () => {
    beforeEach(() => {
        redirectMock.mockReset();
    });

    it('redirects to /games using the current locale', async () => {
        await RootPage();
        expect(redirectMock).toHaveBeenCalledWith({ href: '/games', locale: 'fr' });
    });

    it('calls redirect exactly once', async () => {
        await RootPage();
        expect(redirectMock).toHaveBeenCalledTimes(1);
    });
});
