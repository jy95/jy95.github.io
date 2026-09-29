import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';

interface LoadingButtonProps {
    onClick: () => void;
    disabled?: boolean;
    loading?: boolean;
    label: string;
}

export default function LoadingButton({ onClick, disabled, loading, label }: LoadingButtonProps) {
    return (
        <Button
            variant="outlined"
            size="large"
            onClick={onClick}
            disabled={disabled || loading}
            sx={{ m: 1 }}
        >
            {loading ? <CircularProgress size={24} /> : label}
        </Button>
    );
}
