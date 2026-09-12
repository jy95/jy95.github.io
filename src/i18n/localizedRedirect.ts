import { getLocale } from 'next-intl/server';
import { redirect } from '@/i18n/routing';
import type { Href } from '@/i18n/routing';

export async function redirectToLocalizedPath(href: Href) {
    const locale = await getLocale();
    redirect({ href, locale });
}