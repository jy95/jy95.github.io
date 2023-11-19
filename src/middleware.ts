import createMiddleware from 'next-intl/middleware';
import {locales} from './navigation';

// https://nextjs.org/docs/app/building-your-application/routing/middleware#convention
// Use the file middleware.ts (or .js) in the root of your project to define Middleware. For example, at the same level as pages or app, or inside src if applicable.

export default createMiddleware({
  // A list of all locales that are supported
  locales,
 
  // If this locale is matched, pathnames work without a prefix (e.g. `/about`)
  defaultLocale: 'fr',

  // https://next-intl-docs.vercel.app/docs/routing/middleware#locale-prefix-as-needed
  localePrefix: 'as-needed',
});

// https://next-intl-docs.vercel.app/docs/routing/middleware#matcher-no-prefix
export const config = {
  matcher: [
    // Match all pathnames except for
    // - … if they start with `/api`, `/_next` or `/_vercel`
    // - … the ones containing a dot (e.g. `favicon.ico`)
    '/((?!api|_next|_vercel|.*\\..*).*)'
  ]
};