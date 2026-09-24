"use client";

import { use, useMemo, useState } from "react";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import Grid from "@mui/material/Grid";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import { useTranslations } from "next-intl";
import { notFound } from "next/navigation";

import { useRouter } from "@/i18n/routing";
import { useGetCompanyQuery } from "@/redux/services/companiesAPI";
import { QueryBoundary } from "@/components/common/QueryBoundary";
import { CardGrid } from "@/features/games/components/CardGrid";
import LoadingButton from "../../games/_client/LoadingButton";
import categories from "@/app/api/tier-lists/categories/categories.json";
import type { CompanyGame, CompanyType } from "@/app/api/companies/route";

type SortField = "title" | "duration" | "tier";
type SortDirection = "asc" | "desc";
const PAGE_SIZE = 12;
const tierOrder = new Map(categories.map((category) => [category.slug, category.display_order]));

function durationSeconds(duration?: string): number {
    return duration?.split(":").reduce((total, part) => total * 60 + Number(part), 0) ?? 0;
}

function compareGames(first: CompanyGame, second: CompanyGame, field: SortField, direction: SortDirection): number {
    let result: number;
    if (field === "title") result = first.title.localeCompare(second.title);
    else if (field === "duration") result = durationSeconds(first.duration) - durationSeconds(second.duration);
    else result = (tierOrder.get(first.tierCategory ?? "") ?? Number.MAX_SAFE_INTEGER) -
        (tierOrder.get(second.tierCategory ?? "") ?? Number.MAX_SAFE_INTEGER);
    return (direction === "asc" ? result : -result) || first.title.localeCompare(second.title) || first.id.localeCompare(second.id);
}

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
    const [sortField, setSortField] = useState<SortField>("title");
    const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
    const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
    const t = useTranslations("companies");
    const common = useTranslations("common");
    const router = useRouter();
    const games = useMemo(
        () => [...new Map([...company.developerGames, ...company.publisherGames].map((game) => [game.id, game])).values()]
            .sort((first, second) => compareGames(first, second, sortField, sortDirection)),
        [company, sortField, sortDirection]
    );

    return (
        <>
            <IconButton aria-label={t("back")} onClick={() => router.back()}><ArrowBackIcon /></IconButton>
            <Typography variant="h5" gutterBottom>{company.name}</Typography>
            <TextField select slotProps={{ select: { native: true } }} label={t("sort.label")}
                value={sortField} onChange={(event) => { setSortField(event.target.value as SortField); setVisibleCount(PAGE_SIZE); }}>
                {(["title", "duration", "tier"] as const)
                    .map((field) => <option key={field} value={field}>{t(`sort.${field}`)}</option>)}
            </TextField>
            <IconButton aria-label={t(`sort.${sortDirection === "asc" ? "descending" : "ascending"}`)}
                onClick={() => { setSortDirection((direction) => direction === "asc" ? "desc" : "asc"); setVisibleCount(PAGE_SIZE); }}>
                {sortDirection === "asc" ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />}
            </IconButton>
            <CardGrid items={games.slice(0, visibleCount)} size={{ xs: 6, md: 4, lg: 2 }} />
            {visibleCount < games.length && <Grid container sx={{ justifyContent: "center" }}>
                <LoadingButton onClick={() => setVisibleCount((count) => count + PAGE_SIZE)} label={common("loadMore")} />
            </Grid>}
        </>
    );
}
