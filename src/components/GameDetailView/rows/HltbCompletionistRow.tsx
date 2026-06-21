"use client";

import { useTranslations } from "next-intl";
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import InfoRow from "./InfoRow";

import { hasHltbCompletionist } from "../utils";
import PrettyDuration from "../DurationRow";
import type { GameDetailsEntry } from "../types";

export default function HltbExtraRow({ game }: { game: GameDetailsEntry }) {
    const t = useTranslations("gameDetail");
    if (!hasHltbCompletionist(game)) return null;

    return (
        <InfoRow 
            label={t("hltb_completionist")} 
            value={<PrettyDuration duration={game.hltb_completionist} />} 
            icon={<AccessTimeIcon fontSize="small" />} 
        />
    );
}