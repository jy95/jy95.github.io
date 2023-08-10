type Props = {
    params: {
      locale: "en" | "fr"
    }
}

import {redirect} from 'next/navigation';

export default async function DefaultPage({params: {locale}} : Props) {
    // Redirect to /games pages
    redirect(`/${locale}/games`);
}