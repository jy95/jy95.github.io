export const supabaseEnv = {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    key: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '',
};

if (!supabaseEnv.url || !supabaseEnv.key) {
    throw new Error('Missing Supabase environment variables');
}
