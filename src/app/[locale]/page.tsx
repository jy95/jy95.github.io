import { redirectToLocalizedPath } from '@/i18n/localizedRedirect';
import { createStaticSectionMetadata } from '@/i18n/staticSectionMetadata';

export const generateMetadata = createStaticSectionMetadata('site', {
    alternates: {
        types: {
            'application/rss+xml': '/rss.xml',
            'application/feed+json': '/feed.json',
        },
    },
});

export default async function RootPage() {
    await redirectToLocalizedPath("/games");
}
