// Hooks
import {useTranslations, useLocale} from 'next-intl';

// Client components
import PlanningViewer from "./PlanningViewer";

export default function PlanningPage() {

    const t = useTranslations('planning');
    const locale = useLocale();

    return (
        <PlanningViewer 
            titleColumn={t("columns.title")}
            titleEndDate={t("columns.endDate")}
            titlePlatform={t("columns.platform")}
            titleReleaseDate={t("columns.releaseDate")}
            titleStatus={t("columns.status")}
            lang={locale}
            status={{
                PENDING: t("states.PENDING"),
                RECORDED: t("states.RECORDED")
            }}
        />
    )
}