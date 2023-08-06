// Hooks
import {useTranslations} from 'next-intl';

// Client components
import GamesGallery from "./GamesGallery";

// The gallery component
export default function GamesPage() {

    const t = useTranslations('gamesLibrary.tabs');

    return (
        <GamesGallery gridView={t("grid")} listView={t("list")} />
    )
}