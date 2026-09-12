"use client";

// hooks
import { useGetStatsQuery } from "@/redux/services/statsAPI";

// MUI component
import Grid from '@mui/material/Grid';

// Components
import { QueryBoundary } from "@/components/common/QueryBoundary";
import SkeletonStats from "./_client/SkeletonStats";
import GeneralStats from "./_client/GeneralStats";
import GenresChart from "./_client/GenresChart";
import PlatformsChart from "./_client/PlatformsChart";

export default function StatsPage() {

  // Using a query hook automatically fetches data and returns query values
  const { data, error, isLoading, refetch } = useGetStatsQuery();

  return (
    <QueryBoundary 
      error={error} 
      isLoading={isLoading} 
      data={data} 
      onRetry={refetch} 
      loadingFallback={<SkeletonStats />}>
        {(stats) => (
            <Grid container spacing={3}>
                <GeneralStats stats={stats} />
                <GenresChart stats={stats} />
                <PlatformsChart stats={stats} />
            </Grid>
        )}
    </QueryBoundary>
  );
}