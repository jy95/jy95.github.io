import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';

interface LoadingButtonProps {
    onClick: () => void;
    disabled?: boolean;
    loading?: boolean;
    label: string
}

const LoadingButton = ({ onClick, disabled, loading, label } : LoadingButtonProps) => {


  const handleClick = async () => {
    onClick();
  };

  return (
    <Button 
      variant="outlined" 
      size="large" 
      onClick={handleClick}
      disabled={disabled || loading}
      sx={{
        margin: 1,
        position: "relative"
      }}
    >
      {loading && (
        <CircularProgress size={24}/>
      )}
      {!loading && (
        <span>{label}</span>
      )}
    </Button>
  );
};

export default LoadingButton;
