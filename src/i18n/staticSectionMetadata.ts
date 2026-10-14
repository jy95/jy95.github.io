import { pageMetadata, resolveLocale } from '@/i18n/metadata';
import { getPathname } from '@/i18n/routing';
import enMessages from '../../messages/en.json';
import frMessages from '../../messages/fr.json';

import type { Metadata } from 'next';
import type { Href } from '@/i18n/routing';

type Section = keyof typeof enMessages.pageMetadata;

const sectionPaths = {
    games: '/games', companies: '/companies', series: '/games/series', dlcs: '/games/dlcs',
    backlog: '/backlog', planning: '/planning', tests: '/tests', stats: '/stats', links: '/links',
    tier: '/tier', tierGames: '/tier/games', tierBacklog: '/tier/backlog', tierTests: '/tier/tests', selection: '/selection',
} satisfies Record<Section, Href>;

export function staticSectionMetadata(locale: string, section: Section): Metadata {
    const messages = locale === 'en' ? enMessages : frMessages;
    const { title, description } = messages.pageMetadata[section];

    return pageMetadata({ locale: resolveLocale(locale), title, description,
        pathnameFor: l => getPathname({ locale: l, href: sectionPaths[section] }),
    });
}
