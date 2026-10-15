import { getTranslations } from 'next-intl/server';

import { metadataImage } from '@/i18n/metadataImage';
import { getPathname } from '@/i18n/routing';
import { pageMetadata, resolveLocale } from '@/i18n/metadata';

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

    return pageMetadata({
        locale, title: name, description, pathnameFor: args.pathnameFor,
        image: await metadataImage(imagePath, t(`images.${args.entity}`, { name })),
    });
}

export type DetailPageProps = { params: Promise<{ locale: string; id: string }> };

/** Catalog entity URLs follow the configured as-needed locale prefix. */
export async function entityRouteMetadata<
    Entry extends { id: string | number },
    Summary extends { name: string; imagePath: string },
>(
    { params }: DetailPageProps,
    entity: Entity,
    source: {
        load: () => Promise<readonly Entry[]>;
        summarize: (entry: Entry) => Summary;
        count: (summary: Summary) => number;
    },
): Promise<Metadata> {
    const { locale, id } = await params;
    const pathname = entity === 'company' ? '/companies/[id]'
        : entity === 'series' ? '/games/series/[id]' : '/games/dlcs/[id]';
    const entry = (await source.load()).find(entry => String(entry.id) === id);
    const summary = entry === undefined ? undefined : source.summarize(entry);
    return entityDetailMetadata({
        locale, entity,
        found: summary && { name: summary.name, imagePath: summary.imagePath, count: source.count(summary) },
        pathnameFor: (language) => getPathname({ locale: language, href: { pathname, params: { id: encodeURIComponent(id) } } }),
    });
}
