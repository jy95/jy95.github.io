// Hooks
import {useTranslations} from 'next-intl';

// Client components
import GalleryMode from './_client/GalleryMode';

// The gallery component
export default function GamesPage() {

    const t = useTranslations('gamesLibrary.tabs');

    return (
        <>
            <GalleryMode gridView={t("grid")} listView={t("list")} />
        </>
    )
}