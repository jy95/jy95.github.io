"use client";

// Hooks
import { useEffect, useState } from 'react'
import useNavigateToRandomGame from '@/hooks/useNavigateToRandomGame';

// Components
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';

export default function Random() {
    const navigateToRandomGame = useNavigateToRandomGame();
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // call the centralized navigation routine on mount
        navigateToRandomGame().then((result) => {
            if (!result.success) {
                setError(result.error || 'Failed to navigate to random game');
                console.error('Random game navigation failed:', result.error);
            }
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (error) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh', padding: 2 }}>
                <Alert severity="error">{error}</Alert>
            </Box>
        );
    }

    return (<></>);
}
