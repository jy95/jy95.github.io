"use client";

import { useEffect, useState } from "react";
import useNavigateToRandomGame from "`@/hooks/useNavigateToRandomGame`";

import Alert from "`@mui/material/Alert`";
import Box from "`@mui/material/Box`";

export default function Random() {
    const navigateToRandomGame = useNavigateToRandomGame();
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        void navigateToRandomGame().then(result => {
            if (!result.success) {
                setError(result.error);
            }
        });
    }, [navigateToRandomGame]);

    if (error) {
        return (
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    minHeight: "50vh",
                    padding: 2
                }}
            >
                <Alert severity="error">{error}</Alert>
            </Box>
        );
    }

    return <></>;
}
