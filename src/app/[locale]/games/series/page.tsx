"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useGetSeriesInfiniteQuery, resetPages } from "@/redux/services/seriesAPI";
import { useAppDispatch } from "@/redux/hooks";
import QueryErrorState from "@/components/common/QueryErrorState";
import SeriesCard from "@/features/series/SeriesCard";
import TitleFilter from "@/features/games/components/TitleFilter";
import { SERIES_SORT_OPTIONS } from "@/domain/series/sorting";
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
        <Box sx={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 1 }}>
            <TitleFilter value={filter} label={t("filter.label")} placeholder={t("filter.placeholder")} onChange={next => {
                dispatch(resetPages({ filter: next, sort, pageSize: 12 })); setFilter(next);
            }} />
            <TextField select slotProps={{ select: { native: true } }} label={t("sortSeries.label")} value={sort}
                onChange={event => { const next = SERIES_SORT_OPTIONS.find(option => option === event.target.value); if (next) {
                    dispatch(resetPages({ filter, sort: next, pageSize: 12 })); setSort(next);
                } }}>
                {SERIES_SORT_OPTIONS.map(option => <option key={option} value={option}>{t(`sortSeries.${option}`)}</option>)}
            </TextField>
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
