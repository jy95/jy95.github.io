import { getTranslations } from 'next-intl/server';

import { pageMetadata, resolveLocale } from '@/i18n/metadata';

import type { Metadata } from 'next';
import type { Locale } from 'next-intl';

type Entity = 'company' | 'series' | 'dlc';

export type EntityFound = { name: string; count: number; imagePath?: string };

export async function entityDetailMetadata(args: {
    locale: string;
    entity: Entity;
    found: EntityFound | undefined;
    pathnameFor: (locale: Locale) => string;
}): Promise<Metadata> {
    const locale = resolveLocale(args.locale);
    if (!args.found) return { robots: { index: false, follow: false }, openGraph: null, twitter: null, alternates: null };

    const { name, count, imagePath } = args.found;
    const t = await getTranslations({ locale, namespace: 'detailMetadata' });
    const description = t(args.entity, { name, count });

    return pageMetadata({
        locale, title: name, description, imagePath, pathnameFor: args.pathnameFor,
    });
}
