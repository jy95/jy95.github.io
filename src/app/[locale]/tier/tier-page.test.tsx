import { describe, it, expect, vi, beforeEach } from 'vitest';

const redirectMock = vi.fn();

vi.mock('@/i18n/routing', () => ({
    redirect: (...args: unknown[]) => redirectMock(...args),
}));

vi.mock('next-intl/server', () => ({
    getLocale: vi.fn().mockResolvedValue('en'),
}));

import Tier from './page';

describe('Tier redirect page', () => {
    beforeEach(() => {
        redirectMock.mockReset();
    });

    it('redirects to /tier/games using the current locale', async () => {
        await Tier();
        expect(redirectMock).toHaveBeenCalledWith({ href: '/tier/games', locale: 'en' });
    });

    it('calls redirect exactly once', async () => {
        await Tier();
        expect(redirectMock).toHaveBeenCalledTimes(1);
    });
});
