import { cache } from 'react';

import { getSiteUrl } from '@/lib/siteUrl';

import type { Metadata } from 'next';
import type { ReactNode } from 'react';

/** React hoists these server-rendered meta elements into head, including for crawlers. */
export function OpenGraphMetadata({ metadata }: { metadata: Metadata }) {
    const graph = metadata.openGraph;
    if (!graph) return null;
    const absolute = (url: string | URL) => new URL(url, getSiteUrl()).href;
    const title = typeof graph.title === 'string' ? graph.title
        : graph.title && ('absolute' in graph.title ? graph.title.absolute : graph.title.default);
    const fields: [string, string | undefined][] = [
        ['og:type', 'website'], ['og:site_name', graph.siteName],
        ['og:title', title], ['og:description', graph.description],
        ['og:url', graph.url ? absolute(graph.url) : undefined], ['og:locale', graph.locale],
    ];
    const locales = graph.alternateLocale;
    for (const locale of typeof locales === 'string' ? [locales] : locales ?? []) {
        fields.push(['og:locale:alternate', locale]);
    }
    const images = graph.images ? (Array.isArray(graph.images) ? graph.images : [graph.images]) : [];
    for (const image of images) {
        if (typeof image === 'string' || image instanceof URL) {
            fields.push(['og:image', absolute(image)]);
        } else {
            fields.push(['og:image', absolute(image.url)], ['og:image:alt', image.alt],
                ['og:image:width', image.width?.toString()], ['og:image:height', image.height?.toString()],
                ['og:image:type', image.type]);
        }
    }
    return fields.map(([property, content], index) => content
        ? <meta key={`${property}-${index}`} property={property} content={content} /> : null);
}

/**
 * Next 16.4 postProcessMetadata synthesizes Twitter cards whenever openGraph is set,
 * even with twitter: null. Keep OG out of that pipeline and render property tags
 * through React's supported metadata hoisting instead (not Metadata.other's name tags).
 */
export function metadataPage<Props extends { params: Promise<{ locale: string; id?: string }> }>(
    load: (props: Props) => Metadata | Promise<Metadata>,
    Content: (props: Props) => ReactNode | Promise<ReactNode>,
) {
    const requestMetadata = cache(() => new Map<string, Promise<Metadata>>());
    async function loadMetadata(props: Props) {
        const { locale, id } = await props.params;
        const key = JSON.stringify([locale, id]);
        const entries = requestMetadata();
        const existing = entries.get(key);
        if (existing) return existing;
        const result = Promise.resolve(load(props));
        entries.set(key, result);
        return result;
    }
    return {
        async generateMetadata(props: Props): Promise<Metadata> {
            const metadata = { ...await loadMetadata(props) };
            delete metadata.openGraph;
            delete metadata.twitter;
            return metadata;
        },
        async Page(props: Props) {
            const metadata = await loadMetadata(props);
            const content = await Content(props);
            return <><OpenGraphMetadata metadata={metadata} />{content}</>;
        },
    };
}
