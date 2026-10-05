"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useGetSeriesInfiniteQuery, resetPages } from "@/redux/services/seriesAPI";
import { useAppDispatch } from "@/redux/hooks";
import QueryErrorState from "@/components/common/QueryErrorState";
import SeriesCard from "@/features/series/SeriesCard";
import TitleFilter from "@/features/games/components/TitleFilter";
import SeriesSortSelect from "@/features/series/SeriesSortSelect";
import type { SeriesSort } from "@/domain/series/types";
import LoadingButton from "../_client/LoadingButton";

export default function SeriesGallery() {
    const [filter, setFilter] = useState("");
    const [sort, setSort] = useState<SeriesSort>("nameAsc");
    const t = useTranslations("series");
    const common = useTranslations("common");
    const dispatch = useAppDispatch();
    const { data, isFetching, isError, refetch, hasNextPage, fetchNextPage } = useGetSeriesInfiniteQuery({ filter, sort, pageSize: 12 });
    return <>
        <Box data-testid="series-toolbar" sx={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: { xs: 1, sm: 2 }, minWidth: 0 }}>
            <Box data-testid="series-search" sx={{ flex: { xs: "1 1 100%", md: "1 1 300px" }, maxWidth: { md: 560 }, minWidth: 0 }}>
                <TitleFilter value={filter} label={t("filter.label")} placeholder={t("filter.placeholder")} onChange={next => {
                    dispatch(resetPages({ filter: next, sort, pageSize: 12 })); setFilter(next);
                }} />
            </Box>
            <Box data-testid="series-sort" sx={{ ml: "auto", flex: { xs: "1 1 160px", md: "0 0 280px" }, maxWidth: { xs: 240, md: 280 }, minWidth: 0 }}>
                <SeriesSortSelect value={sort} onChange={next => {
                    dispatch(resetPages({ filter, sort: next, pageSize: 12 })); setSort(next);
                }} />
            </Box>
        </Box>
        {isError && !data ? <QueryErrorState onRetry={refetch} /> : <>
            <Grid container spacing={1} rowSpacing={1}>
                {data?.pages.flatMap(page => page.items).map(series => <Grid key={series.id} size={{ xs: 6, md: 4, lg: 2 }}><SeriesCard series={series} /></Grid>)}
            </Grid>
            {data?.pages[0]?.total_items === 0 && <Typography>{t("empty")}</Typography>}
            {isError && data && <QueryErrorState onRetry={refetch} />}
            <Grid container sx={{ justifyContent: "center" }}><LoadingButton loading={isFetching} disabled={!hasNextPage}
                onClick={() => { void fetchNextPage(); }} label={common("loadMore")} /></Grid>
        </>}
    </>;
}
