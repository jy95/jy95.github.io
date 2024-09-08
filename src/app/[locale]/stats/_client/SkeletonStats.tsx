"use client";

// MUI component
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Skeleton from "@mui/material/Skeleton";

function KeyNumberSkeleton() {
    return (
        <Grid item xs={12} md={12} lg={12}>
            <Paper style={{ padding: 16 }}>
                <Skeleton variant="text" animation="wave" width="28%" style={{ marginBottom: 16 }} />
                <Skeleton variant="rectangular" animation="wave" width="100%" height={150} />
            </Paper>
      </Grid>
    )
}

function GenresSkeleton() {
    return (
        <Grid item xs={12} md={8} lg={8}>
            <Paper style={{ padding: 16 }}>
                <Skeleton variant="text" animation="wave" width="40%" style={{ marginBottom: 16 }} />
                <Skeleton variant="rectangular" animation="wave" width="100%" height={250} />
            </Paper>
      </Grid>
    );
}

function PlatformsSkeleton() {
    return (
        <Grid item xs={12} md={4} lg={4}>
            <Paper style={{ padding: 16 }}>
                <Skeleton variant="text" animation="wave" width="40%" style={{ marginBottom: 16 }} />
                <Skeleton variant="rectangular" animation="wave" width="100%" height={250} />
            </Paper>
      </Grid>
    );
}

export default function SkeletonStats() {
    return (
        <Grid container spacing={2}>
          <KeyNumberSkeleton />
          <GenresSkeleton />
          <PlatformsSkeleton />
      </Grid>
    );
}