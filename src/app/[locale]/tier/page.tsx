import { redirectToLocalizedPath } from '@/i18n/localizedRedirect';

export default async function Tier(){
    await redirectToLocalizedPath("/tier/games");
}
