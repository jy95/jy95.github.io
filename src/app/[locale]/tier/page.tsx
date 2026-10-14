import { staticSectionMetadata } from '@/i18n/staticSectionMetadata';

import { redirectToLocalizedPath } from '@/i18n/localizedRedirect';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    return staticSectionMetadata((await params).locale, 'tier');
}

export default async function Tier(){
    await redirectToLocalizedPath("/tier/games");
}
