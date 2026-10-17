import { afterEach, describe, expect, it, vi } from 'vitest';

import { getSiteUrl } from './siteUrl';

afterEach(() => vi.unstubAllEnvs());

describe('production site origin', () => {
    it('prefers the production domain on preview deployments', () => {
        vi.stubEnv('VERCEL_PROJECT_PRODUCTION_URL', 'catalog.example.com');
        vi.stubEnv('VERCEL_URL', 'temporary-preview.vercel.app');
        expect(getSiteUrl()).toBe('https://catalog.example.com');
    });
    it('uses the stable application fallback rather than a preview domain', () => {
        vi.stubEnv('VERCEL_PROJECT_PRODUCTION_URL', '');
        vi.stubEnv('VERCEL_URL', 'temporary-preview.vercel.app');
        expect(getSiteUrl()).toBe('https://gpfr-git-master-jy95s-projects.vercel.app');
    });
});
