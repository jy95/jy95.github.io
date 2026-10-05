"use client";

import Typography from "@mui/material/Typography";
import BaseCard from "@/features/games/components/BaseCard";

export type CatalogCardData = { id: number; title: string; imagePath: string; gamesCount: number };

export default function CatalogEntityCard({ item, onNavigate, countLabel }: {
    item: CatalogCardData; onNavigate: (item: CatalogCardData) => void; countLabel: string;
}) {
    return <BaseCard item={item} aspectRatio="square" objectFit="contain" overlayPersistent onClick={onNavigate}
        overlaySlot={item => <>
            <Typography variant="subtitle2" sx={{ overflowWrap: "anywhere" }}>{item.title}</Typography>
            <Typography variant="caption">{countLabel}</Typography>
        </>} />;
}
