"use client";

import { useTranslations } from "next-intl";
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import InfoRow from "./InfoRow";

import { hasHltbMain } from "../utils";
import PrettyDuration from "../DurationRow";
import type { GameDetailsEntry } from "../types";

export default function HltbMainRow({ game }: { game: GameDetailsEntry }) {
    const t = useTranslations("gameDetail");
    if (!hasHltbMain(game)) return null;

    return (
        <InfoRow 
            label={t("hltb_main")} 
            value={<PrettyDuration duration={game.hltb_main} />} 
            icon={<AccessTimeIcon fontSize="small" />} 
        />
    );
}