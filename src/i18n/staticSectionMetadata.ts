import { alternatesFor, resolveLocale } from '@/i18n/metadata';
import { getPathname } from '@/i18n/routing';
import enMessages from '../../messages/en.json';
import frMessages from '../../messages/fr.json';

import type { Metadata } from 'next';

type Section = keyof typeof enMessages.pageMetadata;

const sectionPaths = {
    backlog: '/backlog', companies: '/companies', links: '/links', tier: '/tier',
    tierGames: '/tier/games', tierBacklog: '/tier/backlog', tierTests: '/tier/tests',
    dlcs: '/games/dlcs', series: '/games/series', games: '/games', planning: '/planning',
    tests: '/tests', stats: '/stats', selection: '/selection',
} as const;

export function staticSectionMetadata(
    rawLocale: string,
    section: Section,
    pathname: typeof sectionPaths[Section] | '/games/random' = sectionPaths[section]
): Metadata {
    const locale = resolveLocale(rawLocale);
    const messages = locale === 'en' ? enMessages : frMessages;
    const { title, description } = messages.pageMetadata[section];

    return {
        title,
        description,
        alternates: alternatesFor(locale, (locale) => getPathname({ locale, href: pathname })),
    };
}
