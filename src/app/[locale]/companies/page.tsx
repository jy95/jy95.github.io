"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import Grid from "@mui/material/Grid";

import { companiesAPI, useGetCompaniesInfiniteQuery } from "@/redux/services/companiesAPI";
import { useAppDispatch } from "@/redux/hooks";
import QueryErrorState from "@/components/common/QueryErrorState";
import CompanyCard from "@/features/companies/CompanyCard";
import LoadingButton from "../games/_client/LoadingButton";
import RoleToggle, { type RoleFilter } from "./_client/RoleToggle";

export default function CompaniesGallery() {
    const [role, setRole] = useState<RoleFilter>("all");
    const t = useTranslations("companies");
    const common = useTranslations("common");
    const dispatch = useAppDispatch();
    const { data, isFetching, isError, refetch, hasNextPage, fetchNextPage } =
        useGetCompaniesInfiniteQuery({ role, pageSize: 12 });

    return (
        <>
            <RoleToggle
                value={role}
                onChange={(nextRole) => {
                    dispatch(companiesAPI.util.updateQueryData("getCompanies", { role: nextRole, pageSize: 12 }, (cached) => {
                        cached.pages.splice(1);
                        cached.pageParams.splice(1);
                    }));
                    setRole(nextRole);
                }}
                labels={{
                    all: t("roles.all"),
                    developer: t("roles.developer"),
                    publisher: t("roles.publisher"),
                }}
            />
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
