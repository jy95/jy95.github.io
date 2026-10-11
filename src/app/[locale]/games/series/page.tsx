"use client";

import { useTranslations } from "next-intl";

import { useAppDispatch } from "@/redux/hooks";
import { useGetSeriesInfiniteQuery, resetPages } from "@/redux/services/seriesAPI";
import CatalogListToolbar from "@/features/catalog/CatalogListToolbar";
import CatalogGalleryResults from "@/features/catalog/CatalogGalleryResults";
import { useCatalogGalleryState } from "@/features/catalog/useCatalogGalleryState";
import SeriesCard from "@/features/series/SeriesCard";
import TitleFilter from "@/features/games/components/TitleFilter";
import SeriesSortSelect from "@/features/series/SeriesSortSelect";
import type { SeriesSort } from "@/domain/series/types";

export default function SeriesGallery() {
    const t = useTranslations("series");
    const common = useTranslations("common");
    const dispatch = useAppDispatch();
    const { args, onFilterChange, onSortChange } = useCatalogGalleryState<SeriesSort>("nameAsc", next => { dispatch(resetPages(next)); });
    const { currentData, isFetching, isError, refetch, hasNextPage, fetchNextPage } = useGetSeriesInfiniteQuery(args);
    return <>
        <CatalogListToolbar
            testIdPrefix="series"
            search={<TitleFilter value={args.filter} label={t("filter.label")} placeholder={t("filter.placeholder")} onChange={onFilterChange} />}
            sort={<SeriesSortSelect value={args.sort} onChange={onSortChange} />}
        />
        <CatalogGalleryResults currentData={currentData} isFetching={isFetching} isError={isError}
            hasNextPage={hasNextPage} onRetry={refetch} onLoadMore={fetchNextPage}
            emptyLabel={t("empty")} loadMoreLabel={common("loadMore")}
            renderCard={item => <SeriesCard series={item} />} />
    </>;
}
