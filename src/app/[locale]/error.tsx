'use client'; // Error components must be Client Components

// Hooks
import { useEffect } from 'react'

// Components
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
 
export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
  
    useEffect(() => {
        // Log the error to an error reporting service
        console.error(error)
    }, [error])

    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "80vh"
            }}>
            <Typography variant="h4" gutterBottom>{"Something went wrong !"}</Typography>
            <Button variant="contained" color="primary" onClick={reset}>{"Try Again"}</Button>
        </Box>
    );
}