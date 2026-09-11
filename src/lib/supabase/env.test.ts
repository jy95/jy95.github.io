import { describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('supabaseEnv', () => {
    const ORIGINAL_ENV = process.env;
    beforeEach(() => { vi.resetModules(); process.env = { ...ORIGINAL_ENV }; });
    afterEach(() => { process.env = ORIGINAL_ENV; });

    it('throws when NEXT_PUBLIC_SUPABASE_URL is missing', async () => {
        delete process.env.NEXT_PUBLIC_SUPABASE_URL;
        const { supabaseEnv } = await import('./env');
        expect(() => supabaseEnv.url).toThrow('Missing Supabase environment variables');
    });

    it('reads updated environment values on each access', async () => {
        process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://x.supabase.co';
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = 'anon-key';
        const { supabaseEnv } = await import('./env');
        expect(supabaseEnv.url).toBe('https://x.supabase.co');
        expect(supabaseEnv.key).toBe('anon-key');

        process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://updated.supabase.co';
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = 'updated-anon-key';
        expect(supabaseEnv.url).toBe('https://updated.supabase.co');
        expect(supabaseEnv.key).toBe('updated-anon-key');
    });
});
