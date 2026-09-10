export const supabaseEnv = {
    /* @description: The URL of the Supabase instance. */ 
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    /* @description: The public key of the Supabase instance. */
    key: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
};