import {redirect} from '@/i18n/routing';
import {getLocale} from 'next-intl/server';

export default async function Tier(){

    // Fetch client locale
    const locale = await getLocale();

    // Redirect to the main page
    redirect({
        href: "/tier/games",
        locale: locale
    });

}
