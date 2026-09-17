"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import CardEntry from "./CardEntry";
import { useGetRelatedGamesQuery } from "@/redux/services/relatedGamesAPI";
import type { CardGame } from "@/domain/games";

type Props = {
    gameId: string;
    initialLimit: number;
    loadMoreIncrement: number;
};

/**
 * Data is precomputed at build time (scripts/extractors/related-games.ts)
 * and served as a single small JSON payload, cached once by RTK Query.
 * This component only does an O(1) lookup by id — no client-side scoring,
 * regardless of how large the catalog grows.
 */
export default function RelatedGames({ gameId, initialLimit, loadMoreIncrement }: Props) {
    const t = useTranslations("discovery.relatedGames");
    const commonT = useTranslations("common");
    const { data } = useGetRelatedGamesQuery();
    const results = data?.[gameId] ?? [];
    const [visibleCount, setVisibleCount] = useState(initialLimit);

    if (results.length === 0) {
        return null;
    }

    return (
        <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom>
                {t("title")}
            </Typography>
            <Stack direction="row" spacing={2} sx={{ flexWrap: "wrap" }}>
                {results.slice(0, visibleCount).map((entry) => (
                    <Box key={entry.id} sx={{ width: 160 }}>
                        <CardEntry game={entry as CardGame} />
                    </Box>
                ))}
            </Stack>
            {visibleCount < results.length && (
                <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                    <Button
                        variant="outlined"
                        onClick={() => setVisibleCount((count) => count + loadMoreIncrement)}
                    >
                        {commonT("loadMore")}
                    </Button>
                </Box>
            )}
        </Box>
    );
}
