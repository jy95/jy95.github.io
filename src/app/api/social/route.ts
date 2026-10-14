import { renderSocialImage } from '@/features/catalog/socialImage';
import { resolveLocale } from '@/i18n/metadata';
import en from '../../../../messages/en.json';
import fr from '../../../../messages/fr.json';

export const runtime = 'nodejs';

export async function GET(request: Request) {
    const query = new URL(request.url).searchParams;
    const messages = resolveLocale(query.get('locale') ?? 'fr') === 'en' ? en : fr;
    const title = query.get('title')?.trim() || messages.siteMetadata.imageTitle;
    const image = await renderSocialImage(title, messages.siteMetadata.imageSubtitle, query.get('artwork'));
    return new Response(new Uint8Array(image), {
        headers: { 'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=86400' },
    });
}
