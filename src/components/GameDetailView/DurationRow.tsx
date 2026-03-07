"use client";

import { useTranslations } from "next-intl";

interface Props {
  duration: string;
}

// Print the duration in a human readable format, e.g. "2 hours 30 minutes"
// Skips seconds and only shows hours and minutes. If hours is 0, only shows minutes. If minutes is 0, only shows hours.
function PrettyDuration({ duration }: Props) {

    const t = useTranslations();
    const [hours = 0, minutes = 0, seconds = 0] = duration.split(':').map(Number);

    const parts : string[] = [];
    if (hours > 0) {
        parts.push(t("common.dates.hours", { count: hours }));
    }
    if (minutes > 0) {
        parts.push(t("common.dates.minutes", { count: minutes }));
    }
    if (parts.length === 0 && seconds > 0) {
        parts.push(t("common.dates.seconds", { count: seconds }));
    }

    return <>{parts.join(" ")}</>;
}

export default PrettyDuration;