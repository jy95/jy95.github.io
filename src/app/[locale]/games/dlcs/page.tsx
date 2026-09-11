"use client";

// Next js
import dynamic from 'next/dynamic'

// Hooks
import { useGetDLCsQuery } from "@/redux/services/dlcsAPI";

// MUI component
import Grid from '@mui/material/Grid';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

// Components
import QueryErrorState from '@/components/common/QueryErrorState';
import SkeletonGrid from '@/components/common/SkeletonGrid';
import { GroupedGamesAccordion } from '@/features/games/components/GroupedGamesAccordion';

// Custom
const CardEntry = dynamic(() => import('@/features/games/components/CardEntry'), { ssr: false });
const AccordionDetails = dynamic(() => import('@mui/material/AccordionDetails'), { ssr: false });

// The gallery component
function GamesGalleryList() {

    const { data, error, isLoading, refetch } = useGetDLCsQuery();

    if (error) {
        return <QueryErrorState onRetry={refetch} />;
    }

    if (isLoading) {
        return <SkeletonGrid />;
    }

    if (!data) {
        return null;
    }

    return (
        <GroupedGamesAccordion groups={data} itemSize={{
            xs: 6,
            md: 4,
            lg: 1.5
        }} />
    )
}

export default GamesGalleryList;