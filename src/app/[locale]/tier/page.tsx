import { createStaticSectionMetadata } from '@/i18n/staticSectionMetadata';
import { redirectToLocalizedPath } from '@/i18n/localizedRedirect';

export default async function Tier(){
    await redirectToLocalizedPath("/tier/games");
}

export const generateMetadata = createStaticSectionMetadata('tier');
