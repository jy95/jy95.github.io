import { afterEach, expect, it, vi } from 'vitest';
import { getSiteUrl } from './siteUrl';

afterEach(() => vi.unstubAllEnvs());

it('uses the established production origin ahead of a preview hostname', () => {
    vi.stubEnv('VERCEL_PROJECT_PRODUCTION_URL', 'production.example.com');
    vi.stubEnv('VERCEL_URL', 'preview.example.com');
    expect(getSiteUrl()).toBe('https://production.example.com');
});

it.each(['', 'preview.example.com'])('keeps the documented fallback without a production origin (%s)', preview => {
    vi.stubEnv('VERCEL_PROJECT_PRODUCTION_URL', '');
    vi.stubEnv('VERCEL_URL', preview);
    expect(getSiteUrl()).toBe('https://jy95.github.io');
});
