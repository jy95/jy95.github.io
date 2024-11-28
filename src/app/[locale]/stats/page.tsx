"use client";

// hooks
import { useGetStatsQuery } from "@/redux/services/statsAPI";

// MUI component
import Grid from '@mui/material/Grid2';

// Components
import SkeletonStats from "./_client/SkeletonStats";
import GeneralStats from "./_client/GeneralStats";
import GenresChart from "./_client/GenresChart";
import PlatformsChart from "./_client/PlatformsChart";

export default function StatsPage() {

  // Using a query hook automatically fetches data and returns query values
  const { data, error, isLoading } = useGetStatsQuery();

  if (error) {
    return <>Something bad happened</>;
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