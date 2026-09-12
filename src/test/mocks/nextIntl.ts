// src/test/mocks/nextIntl.ts
export function echoTranslations() {
    return {
        useTranslations: (ns?: string) => (key: string, opts?: Record<string, unknown>) => {
            const base = ns ? `${ns}.${key}` : key;
            return opts ? `${base}:${JSON.stringify(opts)}` : base;
        }
    };
}