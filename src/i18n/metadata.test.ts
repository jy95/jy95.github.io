import { expect, it } from 'vitest';
import { getPathname } from './routing';
import { staticSectionMetadata } from './staticSectionMetadata';

it.each(['fr', 'en'] as const)('uses real next-intl paths and encodes identifiers once (%s)', locale => {
    const prefix = locale === 'fr' ? '' : '/en';
    expect(getPathname({ locale, href: { pathname: '/companies/[id]', params: { id: encodeURIComponent('a/b c%') } } }))
        .toBe(`${prefix}/companies/a%2Fb%20c%25`);
    expect(staticSectionMetadata(locale, 'games').alternates).toMatchObject({
        canonical: `${prefix}/games`, languages: { fr: '/games', en: '/en/games' },
    });
});

it('preserves the intentionally branded selection title and public indexability', () => {
    const metadata = staticSectionMetadata('en', 'selection');
    expect(metadata.title).toEqual({ absolute: 'My GamesPassionFR Selection' });
    expect(metadata.openGraph).toMatchObject({ title: 'My GamesPassionFR Selection' });
    expect(metadata.robots).toBeUndefined();
});
