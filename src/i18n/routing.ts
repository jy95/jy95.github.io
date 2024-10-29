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
    '/tests': '/tests',
    '/stats': '/stats',
    '/links': '/links'
  }
});
 
// Lightweight wrappers around Next.js' navigation APIs
// that will consider the routing configuration
export const {Link, redirect, usePathname, useRouter} =
  createNavigation(routing);