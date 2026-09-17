"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import LoadingButton from "@/app/[locale]/games/_client/LoadingButton";
import { CardGrid } from "./CardGrid";
import { useGetRelatedGamesQuery } from "@/redux/services/relatedGamesAPI";

type Props = {
    gameId: string;
};

const PAGE_SIZE = 4;

/**
 * Data is precomputed at build time (scripts/extractors/related-games.ts)
 * and served as a single small JSON payload, cached once by RTK Query.
 * This component only does an O(1) lookup by id — no client-side scoring,
 * regardless of how large the catalog grows.
 */
export default function RelatedGames({ gameId }: Props) {
    const t = useTranslations("discovery.relatedGames");
    const commonT = useTranslations("common");
    const { data } = useGetRelatedGamesQuery();
    const results = data?.[gameId] ?? [];
    const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

    if (results.length === 0) {
        return null;
    }

    return (
        <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom>
                {t("title")}
            </Typography>
            <CardGrid
                items={results.slice(0, visibleCount)}
                size={{ xs: 6, md: 4, lg: 2 }}
            />
            {visibleCount < results.length && (
                <Grid container sx={{ justifyContent: "center" }}>
                    <LoadingButton
                        loading={false}
                        disabled={false}
                        onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
                        label={commonT("loadMore")}
                    />
                </Grid>
            )}
        </Box>
    );
}
