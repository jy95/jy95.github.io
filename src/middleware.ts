import createMiddleware from 'next-intl/middleware';

// https://nextjs.org/docs/app/building-your-application/routing/middleware#convention
// Use the file middleware.ts (or .js) in the root of your project to define Middleware. For example, at the same level as pages or app, or inside src if applicable.

export default createMiddleware({
  // A list of all locales that are supported
  locales: ['fr', 'en'],
 
  // If this locale is matched, pathnames work without a prefix (e.g. `/about`)
  defaultLocale: 'fr',
});
 
export const config = {
  // Skip all paths that should not be internationalized. This example skips the
  // folders "api", "_next" and all files with an extension (e.g. favicon.ico)
  matcher: ['/((?!api|_next|.*\\..*).*)']
};