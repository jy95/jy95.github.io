"use client";

import { useTranslations } from "next-intl";
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import InfoRow from "./InfoRow";

import { hasReleaseDate, formatDate } from "../utils";

import type { GameDetailsEntry } from "../types";

export default function ReleaseDateRow({ game }: { game: GameDetailsEntry }) {
    const t = useTranslations("gameDetail");
    if (!hasReleaseDate(game)) return null;

    return (
        <InfoRow 
            label={t("releaseDate")} 
            value={formatDate(game.releaseDate)} 
            icon={<CalendarTodayIcon fontSize="small" />} 
        />
    );
}