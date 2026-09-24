"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import type { CompanySort } from "@/app/api/companies/route";

import { companiesAPI, useGetCompaniesInfiniteQuery } from "@/redux/services/companiesAPI";
import { useAppDispatch } from "@/redux/hooks";
import QueryErrorState from "@/components/common/QueryErrorState";
import CompanyCard from "@/features/companies/CompanyCard";
import LoadingButton from "../games/_client/LoadingButton";
import RoleToggle, { type RoleFilter } from "./_client/RoleToggle";

export default function CompaniesGallery() {
    const [role, setRole] = useState<RoleFilter>("all");
    const [sort, setSort] = useState<CompanySort>("nameAsc");
    const t = useTranslations("companies");
    const common = useTranslations("common");
    const dispatch = useAppDispatch();
    const { data, isFetching, isError, refetch, hasNextPage, fetchNextPage } =
        useGetCompaniesInfiniteQuery({ role, sort, pageSize: 12 });

    const resetPages = (nextRole: RoleFilter, nextSort: CompanySort) => {
        dispatch(companiesAPI.util.updateQueryData("getCompanies", { role: nextRole, sort: nextSort, pageSize: 12 }, (cached) => {
            cached.pages.splice(1);
            cached.pageParams.splice(1);
        }));
    };

    return (
        <>
            <Box data-testid="companies-controls" sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 1 }}>
                <RoleToggle
                    value={role}
                    onChange={(nextRole) => {
                        resetPages(nextRole, sort);
                        setRole(nextRole);
                    }}
                    labels={{
                        all: t("roles.all"),
                        developer: t("roles.developer"),
                        publisher: t("roles.publisher"),
                    }}
                />
                <TextField select slotProps={{ select: { native: true } }} label={t("sortCompanies.label")}
                    value={sort} onChange={(event) => {
                        const nextSort = event.target.value as CompanySort;
                        resetPages(role, nextSort);
                        setSort(nextSort);
                    }}>
                    {(["nameAsc", "nameDesc", "countDesc", "countAsc"] as const).map((option) =>
                        <option key={option} value={option}>{t(`sortCompanies.${option}`)}</option>)}
                </TextField>
            </Box>
            {isError && !data ? <QueryErrorState onRetry={refetch} /> : (
                <>
                    <Grid container spacing={1} rowSpacing={1}>
                        {data?.pages.flatMap((page) => page.items).map((company) => (
                            <Grid key={company.id} size={{ xs: 6, md: 4, lg: 2 }}>
                                <CompanyCard company={{
                                    id: company.id, title: company.name,
                                    imagePath: company.imagePath, gamesCount: company.gamesCount,
                                }} />
                            </Grid>
                        ))}
                    </Grid>
                    <Grid container sx={{ justifyContent: "center" }}>
                        <LoadingButton loading={isFetching} disabled={!hasNextPage} onClick={() => { void fetchNextPage(); }} label={common("loadMore")} />
                    </Grid>
                </>
            )}
        </>
    );
}
