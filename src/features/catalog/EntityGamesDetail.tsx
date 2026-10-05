"use client";

import { useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import Grid from "@mui/material/Grid";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { CardMediaImage } from "@/components/common/CardMediaImage";
import { CardGrid } from "@/features/games/components/CardGrid";
import { usePagedSlice } from "@/hooks/usePagedSlice";
import LoadingButton from "@/app/[locale]/games/_client/LoadingButton";
import { compareGames, SORT_OPTIONS } from "./gameSorting";
import type { EntityGamesDetailLabels } from "./entityGamesDetailLabels";
import type { GameSort, TieredCardGame } from "./gameSorting";

type Props = {
    name: string; games: TieredCardGame[]; imagePath?: string; countLabel?: string; onBack: () => void;
    labels: EntityGamesDetailLabels;
};

export default function EntityGamesDetail({ name, games, imagePath, countLabel, onBack, labels }: Props) {
    const [sort, setSort] = useState<GameSort>("titleAsc");
    const sorted = useMemo(() => [...games].sort((a, b) => compareGames(a, b, sort)), [games, sort]);
    const { visible, hasMore, loadMore } = usePagedSlice(sorted, 12);
    return <>
        <Box data-testid="entity-header" sx={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 1, minWidth: 0 }}>
            <IconButton aria-label={labels.back} onClick={onBack}><ArrowBackIcon /></IconButton>
            {imagePath && <Box sx={{ width: 120 }}><CardMediaImage src={imagePath} alt={name} ratio="square" objectFit="contain" /></Box>}
            <Typography variant="h5" sx={{ overflowWrap: "anywhere", minWidth: 0 }}>{name}</Typography>
            {countLabel && <Typography>{countLabel}</Typography>}
        </Box>
        <Box data-testid="entity-sort-controls" sx={{ display: "flex", justifyContent: "flex-end", flexWrap: "wrap", gap: 1 }}>
            <TextField select slotProps={{ select: { native: true } }} label={labels.sort} value={sort}
                onChange={event => { const option = SORT_OPTIONS.find(option => option === event.target.value); if (option) setSort(option); }}>
                {SORT_OPTIONS.map(option => <option key={option} value={option}>{labels.options[option]}</option>)}
            </TextField>
        </Box>
        <CardGrid items={visible} size={{ xs: 6, md: 4, lg: 2 }} />
        {hasMore && <Grid container sx={{ justifyContent: "center" }}><LoadingButton onClick={loadMore} label={labels.loadMore} /></Grid>}
    </>;
}
