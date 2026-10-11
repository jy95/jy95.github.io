"use client";

// Hooks
import { useState } from "react";
import { useTranslations } from "next-intl";
import { useAppDispatch } from "@/redux/hooks";

// Data
import { useGetDlcsInfiniteQuery, resetDlcPages } from "@/redux/services/dlcsAPI";

// MUI
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";

// UI
import CatalogListToolbar from "@/features/catalog/CatalogListToolbar";
import QueryErrorState from "@/components/common/QueryErrorState";
import DlcCard from "@/features/dlcs/DlcCard";
import TitleFilter from "@/features/games/components/TitleFilter";
import DlcSortSelect from "@/features/dlcs/DlcSortSelect";
import LoadingButton from "../_client/LoadingButton";

// Others
import type { DlcSort } from "@/domain/dlcs/types";

export default function DlcGallery() {
    const [filter, setFilter] = useState("");
    const [sort, setSort] = useState<DlcSort>("nameAsc");
    const t = useTranslations("dlcs");
    const common = useTranslations("common");
    const dispatch = useAppDispatch();
    const { currentData, isFetching, isError, refetch, hasNextPage, fetchNextPage } = useGetDlcsInfiniteQuery({ filter, sort, pageSize: 12 });
    return <>
        <CatalogListToolbar
            testIdPrefix="dlcs"
            search={<TitleFilter value={filter} label={t("filter.label")} placeholder={t("filter.placeholder")} onChange={next => {
                dispatch(resetDlcPages({ filter: next, sort, pageSize: 12 })); setFilter(next);
            }} />}
            sort={<DlcSortSelect value={sort} onChange={next => {
                dispatch(resetDlcPages({ filter, sort: next, pageSize: 12 })); setSort(next);
            }} />}
        />
        {isError && !currentData ? <QueryErrorState onRetry={refetch} /> : <>
            <Grid container spacing={1} rowSpacing={1}>
                {currentData?.pages.flatMap(page => page.items).map(group => <Grid key={group.id} size={{ xs: 6, md: 4, lg: 2 }}><DlcCard group={group} /></Grid>)}
            </Grid>
            {currentData?.pages[0]?.total_items === 0 && <Typography>{t("empty")}</Typography>}
            {isError && currentData && <QueryErrorState onRetry={refetch} />}
            <Grid container sx={{ justifyContent: "center" }}><LoadingButton loading={isFetching} disabled={!hasNextPage}
                onClick={() => { void fetchNextPage(); }} label={common("loadMore")} /></Grid>
        </>}
    </>;
}
