import { describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('supabaseEnv', () => {
    const ORIGINAL_ENV = process.env;
    beforeEach(() => { vi.resetModules(); process.env = { ...ORIGINAL_ENV }; });
    afterEach(() => { process.env = ORIGINAL_ENV; });

    it('throws when NEXT_PUBLIC_SUPABASE_URL is missing', async () => {
        delete process.env.NEXT_PUBLIC_SUPABASE_URL;
        await expect(import('./env')).rejects.toThrow(/NEXT_PUBLIC_SUPABASE_URL/);
    });

    it('exposes url and key when both env vars are set', async () => {
        process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://x.supabase.co';
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = 'anon-key';
        const { supabaseEnv } = await import('./env');
        expect(supabaseEnv.url).toBe('https://x.supabase.co');
        expect(supabaseEnv.key).toBe('anon-key');
    });
});