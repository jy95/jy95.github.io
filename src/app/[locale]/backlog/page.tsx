// Hooks
import { getTranslations} from 'next-intl/server';

import BacklogViewerClient from '@/components/backlog/BacklogViewerClient';

import type {Locale} from 'next-intl';

type Props = {
  params: Promise<{
      locale: Locale
  }>
}

export default async function BacklogViewer(props : Props) {

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