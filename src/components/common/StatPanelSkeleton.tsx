import Grid, { type GridProps } from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Skeleton from '@mui/material/Skeleton';

type StatPanelSkeletonProps = {
  size: GridProps['size'];
  height: number;
  titleWidth?: string | number;
};

export function StatPanelSkeleton({
  size,
  height,
  titleWidth = '40%',
}: StatPanelSkeletonProps) {
  return (
    <Grid size={size}>
      <Paper sx={{ padding: 16 }}>
        <Skeleton
          variant="text"
          animation="wave"
          width={titleWidth}
          sx={{ mb: 16 }}
        />
        <Skeleton
          variant="rectangular"
          animation="wave"
          width="100%"
          height={height}
        />
      </Paper>
    </Grid>
  );
}
