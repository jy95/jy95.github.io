"use client";

import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";

import QueryErrorState from "@/components/common/QueryErrorState";
import LoadingButton from "@/app/[locale]/games/_client/LoadingButton";
import type { ReactNode } from "react";

type Props<T> = {
    currentData?: { pages: { items: T[]; total_items?: number }[] };
    isFetching?: boolean; isError?: boolean; hasNextPage?: boolean;
    onRetry: () => void; onLoadMore: () => unknown;
    emptyLabel: string; loadMoreLabel: string; renderCard: (item: T) => ReactNode;
};

export default function CatalogGalleryResults<T extends { id: string | number }>({
    currentData, isFetching, isError, hasNextPage, onRetry, onLoadMore, emptyLabel, loadMoreLabel, renderCard,
}: Props<T>) {
    if (isError && !currentData) return <QueryErrorState onRetry={onRetry} />;
    return <>
        <Grid container spacing={1} rowSpacing={1}>
            {currentData?.pages.flatMap(page => page.items).map(item =>
                <Grid key={item.id} size={{ xs: 6, md: 4, lg: 2 }}>{renderCard(item)}</Grid>)}
        </Grid>
        {currentData?.pages[0]?.total_items === 0 && <Typography>{emptyLabel}</Typography>}
        {isError && currentData && <QueryErrorState onRetry={onRetry} />}
        <Grid container sx={{ justifyContent: "center" }}>
            <LoadingButton loading={isFetching} disabled={!hasNextPage}
                onClick={() => { void onLoadMore(); }} label={loadMoreLabel} />
        </Grid>
    </>;
}
