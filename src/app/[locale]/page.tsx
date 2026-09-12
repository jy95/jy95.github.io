import { redirectToLocalizedPath } from '@/i18n/localizedRedirect';

export default async function RootPage() {
    await redirectToLocalizedPath("/games");
}