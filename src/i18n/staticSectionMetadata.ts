import { pageMetadata, resolveLocale } from '@/i18n/metadata';
import { getPathname } from '@/i18n/routing';
import enMessages from '../../messages/en.json';
import frMessages from '../../messages/fr.json';

import type { Metadata } from 'next';

type Section = keyof typeof enMessages.pageMetadata;

const sectionPaths = {
    random: '/games/random', backlog: '/backlog', companies: '/companies', links: '/links', tier: '/tier',
    tierGames: '/tier/games', tierBacklog: '/tier/backlog', tierTests: '/tier/tests',
    dlcs: '/games/dlcs', series: '/games/series', games: '/games', planning: '/planning',
    tests: '/tests', stats: '/stats', selection: '/selection',
} as const;

export function staticSectionMetadata(
    rawLocale: string,
    section: Section
): Metadata {
    const locale = resolveLocale(rawLocale);
    const messages = locale === 'en' ? enMessages : frMessages;
    const { title, description } = messages.pageMetadata[section];

    if (section === 'tier') return { title, description, robots: { index: false, follow: true } };
    return {
        ...pageMetadata({ locale, title, description, absoluteTitle: section === 'selection',
            pathnameFor: (language) => getPathname({ locale: language, href: sectionPaths[section] }),
        }),
        ...(section === 'random' ? { robots: { index: false, follow: true } } : {}),
    };
}
