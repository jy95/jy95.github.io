function getEnvVar(name: string): string {
    const value = process.env[name];
    if (!value) {
        throw new Error(`Missing environment variable: ${name}`);
    }
    return value;
}

export const supabaseEnv = {
    /** The URL of the Supabase instance. */
    url: getEnvVar('NEXT_PUBLIC_SUPABASE_URL'),
    /** The public key of the Supabase instance. */
    key: getEnvVar('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY'),
};