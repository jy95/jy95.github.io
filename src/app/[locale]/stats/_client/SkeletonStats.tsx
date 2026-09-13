"use client";

// MUI component
import Grid from '@mui/material/Grid';
// Custom components
import { StatPanelSkeleton } from '@/components/common/StatPanelSkeleton';

export default function SkeletonStats() {
  return (
    <Grid container spacing={2}>
      <StatPanelSkeleton size={{ xs: 12 }} height={150} titleWidth="28%" />
      <StatPanelSkeleton size={{ xs: 12, md: 8 }} height={250} />
      <StatPanelSkeleton size={{ xs: 12, md: 4 }} height={250} />
    </Grid>
  );
}
