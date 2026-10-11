"use client";

import { useTranslations } from "next-intl";

import { useAppDispatch } from "@/redux/hooks";
import { useGetDlcsInfiniteQuery, resetDlcPages } from "@/redux/services/dlcsAPI";
import CatalogListToolbar from "@/features/catalog/CatalogListToolbar";
import CatalogGalleryResults from "@/features/catalog/CatalogGalleryResults";
import { useCatalogGalleryState } from "@/features/catalog/useCatalogGalleryState";
import DlcCard from "@/features/dlcs/DlcCard";
import TitleFilter from "@/features/games/components/TitleFilter";
import DlcSortSelect from "@/features/dlcs/DlcSortSelect";
import type { DlcSort } from "@/domain/dlcs/types";

export default function DlcGallery() {
    const t = useTranslations("dlcs");
    const common = useTranslations("common");
    const dispatch = useAppDispatch();
    const { args, onFilterChange, onSortChange } = useCatalogGalleryState<DlcSort>("nameAsc", next => { dispatch(resetDlcPages(next)); });
    const { currentData, isFetching, isError, refetch, hasNextPage, fetchNextPage } = useGetDlcsInfiniteQuery(args);
    return <>
        <CatalogListToolbar
            testIdPrefix="dlcs"
            search={<TitleFilter value={args.filter} label={t("filter.label")} placeholder={t("filter.placeholder")} onChange={onFilterChange} />}
            sort={<DlcSortSelect value={args.sort} onChange={onSortChange} />}
        />
        <CatalogGalleryResults currentData={currentData} isFetching={isFetching} isError={isError}
            hasNextPage={hasNextPage} onRetry={refetch} onLoadMore={fetchNextPage}
            emptyLabel={t("empty")} loadMoreLabel={common("loadMore")}
            renderCard={item => <DlcCard group={item} />} />
    </>;
}
