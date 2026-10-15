import { renderToStaticMarkup } from 'react-dom/server';
import { expect, it } from 'vitest';

import { pageMetadata } from './metadata';
import { metadataPage, OpenGraphMetadata } from './metadataPage';

it.each(['fr', 'en'] as const)('renders property tags without Twitter metadata (%s)', async locale => {
    const metadata = pageMetadata({ locale, title: 'Example', description: 'Description',
        pathnameFor: language => language === 'en' ? '/en/games' : '/games',
        image: { url: '/companies/1/cover.webp', alt: 'Artwork', width: 640, height: 480, type: 'image/webp' },
    });
    const route = metadataPage(async () => metadata, () => <main />);
    const framework = await route.generateMetadata({ params: Promise.resolve({ locale }) });
    expect(framework.openGraph).toBeUndefined();
    expect(framework.twitter).toBeUndefined();
    const html = renderToStaticMarkup(<html><body><OpenGraphMetadata metadata={metadata} /></body></html>);
    const document = new DOMParser().parseFromString(html, 'text/html');
    expect(document.head.querySelector('meta[property="og:title"]')?.getAttribute('content')).toBe('Example | GamesPassionFR');
    expect(document.head.querySelector('meta[property="og:image"]')?.getAttribute('content')).toMatch(/^https:\/\/.+\/companies\/1\/cover.webp$/);
    expect(document.head.querySelector('meta[property="og:image:type"]')?.getAttribute('content')).toBe('image/webp');
    expect(document.querySelector('[name^="twitter:"], [property^="twitter:"]')).toBeNull();
    expect(document.body.querySelector('meta')).toBeNull();
});
