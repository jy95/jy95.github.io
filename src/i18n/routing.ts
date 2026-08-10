import {defineRouting} from 'next-intl/routing';
import {createNavigation} from 'next-intl/navigation';
 
export const routing = defineRouting({
  // A list of all locales that are supported
  locales: ['fr', 'en'],
  // Used when no locale matches
  defaultLocale: 'fr',
  // https://next-intl-docs.vercel.app/docs/routing/middleware#locale-prefix-as-needed
  localePrefix: 'as-needed',
  // localized pathnames
  pathnames: {
    '/': '/',
    '/games': '/games',
    '/planning': '/planning',
    '/backlog': '/backlog',
    '/tests': '/tests',
    '/stats': '/stats',
    '/links': '/links',
    '/tier/games': '/tier/games',
    '/tier/backlog': '/tier/backlog',
    // Dynamic params are supported via square brackets
    '/playlist/[id]': '/playlist/[id]',
    '/video/[id]': '/video/[id]'
  }
});
 
// Lightweight wrappers around Next.js' navigation APIs
// that will consider the routing configuration
export const {Link, redirect, usePathname, useRouter, getPathname} = createNavigation(routing);

/**
 * The href type next-intl's typed `Link`/`router.replace`/`getPathname`
 * expect. Exported here so call sites that build hrefs dynamically (e.g.
 * from a nested navigation tree, or reusing `usePathname()`'s untyped
 * string) can assert their computed string is a valid `Href` instead of
 * casting the whole component/call to `any`.
 */
export type Href = Parameters<typeof getPathname>[0]['href'];