import { getTranslations } from 'next-intl/server';

import { alternatesFor, resolveLocale, withBrand } from '@/i18n/metadata';

import type { Metadata } from 'next';
import type { Locale } from 'next-intl';

type Entity = 'company' | 'series' | 'dlc';

export type EntityFound = { name: string; count: number; imagePath: string };


export async function entityDetailMetadata(args: {
    locale: string;
    entity: Entity;
    found: EntityFound | undefined;
    pathnameFor: (locale: Locale) => string;
}): Promise<Metadata> {
    const locale = resolveLocale(args.locale);
    if (!args.found) return { robots: { index: false, follow: false } };

    const { name, count, imagePath } = args.found;
    const t = await getTranslations({ locale, namespace: 'detailMetadata' });
    const description = t(args.entity, { name, count });

    return {
        title: withBrand(name),
        description,
        alternates: alternatesFor(locale, args.pathnameFor),
        openGraph: { 
            type: 'website',
            siteName: "GamesPassionFR",
            title: name, 
            description, 
            images: [{ url: imagePath, alt: name }] 
        }
    };
}
