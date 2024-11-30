import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';

// Types
import type { ReactNode } from "react";

interface LoadingButtonProps {
    onClick: () => void;
    disabled?: boolean;
    loading?: boolean;
    children: ReactNode;
}

const LoadingButton = ({ onClick, disabled, loading, children } : LoadingButtonProps) => {


  const handleClick = async () => {
    onClick();
  };

  return (
    <Button 
      variant="outlined" 
      onClick={handleClick}
      disabled={disabled || loading}
      sx={{
        margin: 1,
        position: "relative"
      }}
    >
      {loading && (
        <CircularProgress
          size={24}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            marginTop: -12,
            marginLeft: -12,
          }}
        />
      )}
      {loading ? 'Loading...' : children}
    </Button>
  );
};

export default LoadingButton;
