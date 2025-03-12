import PlanningViewerClient from "@/components/planning/PlanningViewerClient";

// Hooks
import {setRequestLocale , getTranslations} from 'next-intl/server';

import type {Locale} from 'next-intl';

type Props = {
    params: Promise<{
        locale: Locale
    }>
}

export default async function PlanningViewer(props : Props) {

    // retrieve locale
    const params = await props.params;
    const locale = params.locale;

    // Enable static rendering
    setRequestLocale(locale);

    // Retrieve translation
    const t = await getTranslations("planning");
    
    const propsClient = {
        endDateLabel: t("columns.endDate"),
        platformLabel: t("columns.platform"),
        releaseDateLabel: t("columns.releaseDate"),
        statusLabel: t("columns.status"),
        titleLabel: t("columns.title"),
        statesLabels: {
            PENDING: t("states.PENDING"),
            RECORDED: t("states.RECORDED")
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
            <PlanningViewerClient {...propsClient} />
        </div>
    )
}