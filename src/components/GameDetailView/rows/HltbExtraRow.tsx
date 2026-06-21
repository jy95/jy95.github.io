"use client";

import { useTranslations } from "next-intl";
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import InfoRow from "./InfoRow";

import { hasHltbExtra } from "../utils";
import PrettyDuration from "../DurationRow";
import type { GameDetailsEntry } from "../types";

export default function HltbExtraRow({ game }: { game: GameDetailsEntry }) {
    const t = useTranslations("gameDetail");
    if (!hasHltbExtra(game)) return null;

    return (
        <InfoRow 
            label={t("hltb_extra")} 
            value={<PrettyDuration duration={game.hltb_extra} />} 
            icon={<AccessTimeIcon fontSize="small" />} 
        />
    );
}