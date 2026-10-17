// https://vercel.com/docs/environment-variables/system-environment-variables
export function getSiteUrl(): string {
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  // Never use VERCEL_URL: on preview deployments it identifies temporary content.
  // Stable application destination used by gh-pages-out/index.html.
  return 'https://gpfr-git-master-jy95s-projects.vercel.app';
}
