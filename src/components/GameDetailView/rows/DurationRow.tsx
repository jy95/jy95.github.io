"use client";

import { useTranslations } from "next-intl";
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import InfoRow from "./InfoRow";
import { hasDuration } from "../utils";

import type { GameDetailsEntry } from "../types";

export default function DurationRow({ game }: { game: GameDetailsEntry }) {
    const t = useTranslations("gameDetail");
    if (!hasDuration(game)) return null;

    return (
        <InfoRow 
            label={t("duration")} 
            value={game.duration} 
            icon={<AccessTimeIcon fontSize="small" />} 
        />
    );
}