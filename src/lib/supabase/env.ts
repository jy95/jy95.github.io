function getSupabaseEnv() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';

    if (!url || !key) {
        throw new Error('Missing Supabase environment variables');
    }

    return { url, key };
}

export const supabaseEnv = {
    get url() {
        return getSupabaseEnv().url;
    },
    get key() {
        return getSupabaseEnv().key;
    },
};
