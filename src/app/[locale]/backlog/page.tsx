// Hooks
import {setRequestLocale , getTranslations} from 'next-intl/server';

import BacklogViewerClient from '@/components/backlog/BacklogViewerClient';

import type {Locale} from 'next-intl';

type Props = {
  params: Promise<{
      locale: Locale
  }>
}

export default async function BacklogViewer(props : Props) {

    // retrieve locale
    const params = await props.params;
    const locale = params.locale;

    // Enable static rendering
    setRequestLocale(locale);

    // Using a query hook automatically fetches data and returns query values
    const t = await getTranslations("backlog");

    const propsClient = {
      titleLabel: t("columns.title"),
      platformLabel: t("columns.platform"),
      notesLabel: t("columns.notes")
    }

    return (
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <BacklogViewerClient {...propsClient} />
      </div>
    )

}