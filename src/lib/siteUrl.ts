
// https://vercel.com/docs/environment-variables/system-environment-variables
export function getSiteUrl(): string {
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  // Preview-only VERCEL_URL must not become the public canonical origin.
  // Preserve the documented GitHub Pages fallback when production is unset.
  return 'https://jy95.github.io';
}
