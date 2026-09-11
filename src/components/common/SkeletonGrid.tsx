import Skeleton from '@mui/material/Skeleton';

type Props = { 
    // Number of skeletons to display
    count?: number; 
    // Height of each skeleton
    height?: number 
};

export default function SkeletonGrid({ count = 5, height = 50 }: Props) {
    return (
        <div>
            {Array.from({ length: count }).map((_, index) => (
                <div key={index} style={{ marginBottom: '15px' }}>
                    <Skeleton variant="rectangular" width="100%" height={height} />
                </div>
            ))}
        </div>
    );
}