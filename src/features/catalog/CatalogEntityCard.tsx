"use client";

import Typography from "@mui/material/Typography";
import BaseCard from "@/features/games/components/BaseCard";

export type CatalogCardData = { id: number | string; title: string; imagePath: string; gamesCount: number };

export default function CatalogEntityCard<T extends CatalogCardData>({ item, onNavigate, countLabel, objectFit = "contain" }: {
    item: T; onNavigate: (item: T) => void; countLabel: string; objectFit?: "fill" | "cover" | "contain";
}) {
    return <BaseCard item={item} aspectRatio="square" objectFit={objectFit} overlayPersistent onClick={onNavigate}
        overlaySlot={item => <>
            <Typography variant="subtitle2" sx={{ overflowWrap: "anywhere" }}>{item.title}</Typography>
            <Typography variant="caption">{countLabel}</Typography>
        </>} />;
}
