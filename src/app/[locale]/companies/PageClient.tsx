"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";

import { companiesAPI, useGetCompaniesInfiniteQuery } from "@/redux/services/companiesAPI";
import { useAppDispatch } from "@/redux/hooks";
import CatalogGalleryResults from "@/features/catalog/CatalogGalleryResults";
import CompanyCard from "@/features/companies/CompanyCard";
import RoleToggle, { type RoleFilter } from "./_client/RoleToggle";

import type { CompanySort } from "@/app/api/companies/route";

const companySorts = ["nameAsc", "nameDesc", "countDesc", "countAsc"] as const;

export default function CompaniesGallery() {
    const [args, setArgs] = useState<{ role: RoleFilter; sort: CompanySort; pageSize: number }>({ role: "all", sort: "nameAsc", pageSize: 12 });
    const { role, sort } = args;
    const t = useTranslations("companies");
    const common = useTranslations("common");
    const dispatch = useAppDispatch();
    const { data, isFetching, isError, refetch, hasNextPage, fetchNextPage } =
        useGetCompaniesInfiniteQuery(args);

    const updateArgs = (changes: Partial<Pick<typeof args, "role" | "sort">>) => {
        const nextArgs = { ...args, ...changes };
        dispatch(companiesAPI.util.updateQueryData("getCompanies", nextArgs, (cached) => {
            cached.pages.splice(1);
            cached.pageParams.splice(1);
        }));
        setArgs(nextArgs);
    };

    return (
        <>
            <Box data-testid="companies-controls" sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 1 }}>
                <RoleToggle
                    value={role}
                    onChange={role => updateArgs({ role })}
                    labels={{
                        all: t("roles.all"),
                        developer: t("roles.developer"),
                        publisher: t("roles.publisher"),
                    }}
                />
                <TextField select slotProps={{ select: { native: true } }} label={t("sortCompanies.label")}
                    value={sort} onChange={(event) => {
                        const sort = companySorts.find(option => option === event.target.value);
                        if (sort) updateArgs({ sort });
                    }}>
                    {companySorts.map((option) =>
                        <option key={option} value={option}>{common(`sort.options.${option}`)}</option>)}
                </TextField>
            </Box>
            <CatalogGalleryResults currentData={data} isFetching={isFetching} isError={isError}
                hasNextPage={hasNextPage} onRetry={refetch} onLoadMore={fetchNextPage}
                showRetainedError={false} loadMoreLabel={common("loadMore")}
                renderCard={company => <CompanyCard company={{
                    id: company.id, title: company.name,
                    imagePath: company.imagePath, gamesCount: company.gamesCount,
                }} />} />
        </>
    );
}
