"use client";

import { useTranslations } from "next-intl";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import LoadingButton from "@/app/[locale]/games/_client/LoadingButton";
import { usePagedSlice } from "@/hooks/usePagedSlice";
import type { CardGame } from "@/domain/games";
import { CardGrid } from "./CardGrid";
import { useGetRelatedGamesQuery } from "@/redux/services/relatedGamesAPI";

type Props = {
    gameId: string;
};

const PAGE_SIZE = 4;
const EMPTY_RESULTS: CardGame[] = [];

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
    const results = data?.[gameId] ?? EMPTY_RESULTS;
    // New recommendation data resets the list to its first page.
    const { visible, hasMore, loadMore } = usePagedSlice(results, PAGE_SIZE);

    if (results.length === 0) {
        return null;
    }

    return (
        <Box sx={{ mt: 4 }}>
            <Stack direction="row" spacing={1} sx={{ mb: 1, alignItems: "center" }}>
                <AutoAwesomeIcon aria-hidden="true" fontSize="small" color="primary" />
                <Typography variant="h6">
                    {t("title")}
                </Typography>
            </Stack>
            <CardGrid
                items={visible}
                size={{ xs: 6, md: 4, lg: 2 }}
            />
            {hasMore && (
                <Grid container sx={{ justifyContent: "center" }}>
                    <LoadingButton
                        loading={false}
                        disabled={false}
                        onClick={loadMore}
                        label={commonT("loadMore")}
                    />
                </Grid>
            )}
        </Box>
    );
}
