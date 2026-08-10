"use client";

// hooks
import { useGetStatsQuery } from "@/redux/services/statsAPI";

// MUI component
import Grid from '@mui/material/Grid';

// Components
import SkeletonStats from "./_client/SkeletonStats";
import GeneralStats from "./_client/GeneralStats";
import GenresChart from "./_client/GenresChart";
import PlatformsChart from "./_client/PlatformsChart";
import QueryErrorState from "@/components/common/QueryErrorState";

export default function StatsPage() {

  // Using a query hook automatically fetches data and returns query values
  const { data, error, isLoading, refetch } = useGetStatsQuery();

  if (error) {
    return <QueryErrorState onRetry={refetch} />;
  }

  if (isLoading) {
    return <SkeletonStats />;
  }

  if (!data) {
    return null;
  }

  return (
    <Grid container spacing={3}>
      <GeneralStats stats={data}/>
      <GenresChart stats={data}/>
      <PlatformsChart stats={data}/>
    </Grid>
  );
}