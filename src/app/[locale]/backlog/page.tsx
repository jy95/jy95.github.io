// Hooks
import { getTranslations} from 'next-intl/server';

import { staticSectionMetadata } from '@/i18n/staticSectionMetadata';
import BacklogViewerClient from '@/components/backlog/BacklogViewerClient';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    return staticSectionMetadata((await params).locale, 'backlog');
}

export default async function BacklogViewer() {

    // Using a query hook automatically fetches data and returns query values
    const t = await getTranslations("backlog");

    const propsClient = {
      titleLabel: t("columns.title"),
      platformLabel: t("columns.platform"),
      notesLabel: t("columns.notes"),
      hltbLabel: t("columns.hltb_main"),
      votesLabel: t("columns.votes")
    }

    return (
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <BacklogViewerClient {...propsClient} />
      </div>
    )

}