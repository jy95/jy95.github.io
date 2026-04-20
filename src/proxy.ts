import createMiddleware from 'next-intl/middleware';
import {routing} from './i18n/routing';
import { type NextRequest } from "next/server";
import { updateSession } from '@/lib/supabase/proxy';

// https://nextjs.org/docs/app/building-your-application/routing/middleware#convention
// Use the file middleware.ts (or .js) in the root of your project to define Middleware. For example, at the same level as pages or app, or inside src if applicable.
const intlMiddleware = createMiddleware(routing);

export default async function proxy(request: NextRequest) {

  // On rafraîchit la session avant de faire quoi que ce soit d'autre.
  const authResponse = await updateSession(request);
  // On continue avec le middleware de next-intl pour gérer la langue.
  const intlResponse = intlMiddleware(request);

  // On synchronise les cookies de la session avec ceux de la réponse du middleware de next-intl.
  authResponse.cookies.getAll().forEach((cookie) => {
    intlResponse.cookies.set(cookie);
  });

  // On retourne la réponse du middleware de next-intl, qui contient les cookies de session à jour.
  return intlResponse;
}
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