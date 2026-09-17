"use client";

import { useTranslations } from "next-intl";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import CardEntry from "./CardEntry";
import { useGetRelatedGamesQuery } from "@/redux/services/relatedGamesAPI";
import type { CardGame } from "@/domain/games";

type Props = {
    gameId: string;
};

/**
 * Data is precomputed at build time (scripts/extractors/related-games.ts)
 * and served as a single small JSON payload, cached once by RTK Query.
 * This component only does an O(1) lookup by id — no client-side scoring,
 * regardless of how large the catalog grows.
 */
export default function RelatedGames({ gameId }: Props) {
    const t = useTranslations("discovery.relatedGames");
    const { data } = useGetRelatedGamesQuery();
    const results = data?.[gameId] ?? [];

    if (results.length === 0) {
        return null;
    }

    return (
        <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom>
                {t("title")}
            </Typography>
            <Stack direction="row" spacing={2} sx={{ flexWrap: "wrap" }}>
                {results.map((entry) => (
                    <Box key={entry.id} sx={{ width: 160 }}>
                        <CardEntry game={entry as CardGame} />
                    </Box>
                ))}
            </Stack>
        </Box>
    );
}