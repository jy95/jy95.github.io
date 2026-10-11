"use client";

// Hooks
import { useState } from "react";
import { useTranslations } from "next-intl";
import { useAppDispatch } from "@/redux/hooks";

// Data
import { useGetSeriesInfiniteQuery, resetPages } from "@/redux/services/seriesAPI";

// MUI
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";

// UI
import CatalogListToolbar from "@/features/catalog/CatalogListToolbar";
import QueryErrorState from "@/components/common/QueryErrorState";
import SeriesCard from "@/features/series/SeriesCard";
import TitleFilter from "@/features/games/components/TitleFilter";
import SeriesSortSelect from "@/features/series/SeriesSortSelect";
import LoadingButton from "../_client/LoadingButton";

// Others
import type { SeriesSort } from "@/domain/series/types";

export default function SeriesGallery() {
    const [filter, setFilter] = useState("");
    const [sort, setSort] = useState<SeriesSort>("nameAsc");
    const t = useTranslations("series");
    const common = useTranslations("common");
    const dispatch = useAppDispatch();
    const { currentData, isFetching, isError, refetch, hasNextPage, fetchNextPage } = useGetSeriesInfiniteQuery({ filter, sort, pageSize: 12 });
    return <>
        <CatalogListToolbar
            testIdPrefix="series"
            search={<TitleFilter value={filter} label={t("filter.label")} placeholder={t("filter.placeholder")} onChange={next => {
                dispatch(resetPages({ filter: next, sort, pageSize: 12 })); setFilter(next);
            }} />}
            sort={<SeriesSortSelect value={sort} onChange={next => {
                dispatch(resetPages({ filter, sort: next, pageSize: 12 })); setSort(next);
            }} />}
        />
        {isError && !currentData ? <QueryErrorState onRetry={refetch} /> : <>
            <Grid container spacing={1} rowSpacing={1}>
                {currentData?.pages.flatMap(page => page.items).map(series => <Grid key={series.id} size={{ xs: 6, md: 4, lg: 2 }}><SeriesCard series={series} /></Grid>)}
            </Grid>
            {currentData?.pages[0]?.total_items === 0 && <Typography>{t("empty")}</Typography>}
            {isError && currentData && <QueryErrorState onRetry={refetch} />}
            <Grid container sx={{ justifyContent: "center" }}><LoadingButton loading={isFetching} disabled={!hasNextPage}
                onClick={() => { void fetchNextPage(); }} label={common("loadMore")} /></Grid>
        </>}
    </>;
}
