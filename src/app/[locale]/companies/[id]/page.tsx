"use client";

import { use, useMemo, useState } from "react";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useTranslations } from "next-intl";
import { notFound } from "next/navigation";

import { useRouter } from "@/i18n/routing";
import { useGetCompanyQuery } from "@/redux/services/companiesAPI";
import { QueryBoundary } from "@/components/common/QueryBoundary";
import { CardGrid } from "@/features/games/components/CardGrid";
import { usePagedSlice } from "@/hooks/usePagedSlice";
import { SORT_OPTIONS, compareGames } from "@/features/companies/gameSorting";
import LoadingButton from "../../games/_client/LoadingButton";
import type { GameSort } from "@/features/companies/gameSorting";
import type { CompanyType } from "@/app/api/companies/route";

const PAGE_SIZE = 12;

export default function CompanyDetail({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { data, error, isLoading, refetch } = useGetCompanyQuery(id);
    if (error && "status" in error && error.status === 404) return notFound();

    return (
        <QueryBoundary error={error} isLoading={isLoading} data={data} onRetry={refetch} loadingFallback={<CircularProgress />}>
            {(company) => <CompanyGames company={company} />}
        </QueryBoundary>
    );
}

function CompanyGames({ company }: { company: CompanyType }) {
    const [sort, setSort] = useState<GameSort>("titleAsc");
    const t = useTranslations("companies");
    const common = useTranslations("common");
    const router = useRouter();
    const games = useMemo(
        () => [...new Map([...company.developerGames, ...company.publisherGames].map((game) => [game.id, game])).values()]
            .sort((first, second) => compareGames(first, second, sort)),
        [company, sort]
    );

    // New company data or sort order resets pagination to the first page.
    const { visible, hasMore, loadMore } = usePagedSlice(games, PAGE_SIZE);

    return (
        <>
            <Box data-testid="company-header" sx={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 1, minWidth: 0 }}>
                <IconButton aria-label={t("back")} onClick={() => router.back()}><ArrowBackIcon /></IconButton>
                <Typography variant="h5" sx={{ overflowWrap: "anywhere", minWidth: 0 }}>{company.name}</Typography>
            </Box>
            <Box data-testid="company-sort-controls" sx={{ display: "flex", justifyContent: "flex-end", flexWrap: "wrap", gap: 1 }}>
                <TextField select slotProps={{ select: { native: true } }} label={t("sort.label")}
                    value={sort} onChange={(event) => {
                        const option = SORT_OPTIONS.find(option => option === event.target.value);
                        if (option) setSort(option);
                    }}>
                    {SORT_OPTIONS
                        .map((option) => <option key={option} value={option}>{t(`sort.${option}`)}</option>)}
                </TextField>
            </Box>
            <CardGrid items={visible} size={{ xs: 6, md: 4, lg: 2 }} />
            {hasMore && <Grid container sx={{ justifyContent: "center" }}>
                <LoadingButton onClick={loadMore} label={common("loadMore")} />
            </Grid>}
        </>
    );
}
