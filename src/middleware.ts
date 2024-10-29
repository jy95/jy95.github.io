import createMiddleware from 'next-intl/middleware';
import {routing} from './i18n/routing';

// https://nextjs.org/docs/app/building-your-application/routing/middleware#convention
// Use the file middleware.ts (or .js) in the root of your project to define Middleware. For example, at the same level as pages or app, or inside src if applicable.

export default createMiddleware(routing);

// https://next-intl-docs.vercel.app/docs/routing/middleware#matcher-no-prefix
// https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    //'/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
    /*
     * Match all pathnames except for
     * - … if they start with `/api`, `/_next` or `/_vercel`
     * - … the ones containing a dot (e.g. `favicon.ico`)
     */
    '/((?!api|_next|_vercel|.*\\..*).*)'
  ]
};
