"use client";

// Needed because of
// https://nextjs.org/docs/app/api-reference/functions/use-search-params#behavior
// https://nextjs.org/docs/messages/missing-suspense-with-csr-bailout
import { Suspense, useState } from "react";

import useNavigateToRandomGame from "`@/hooks/useNavigateToRandomGame`";

import Fab from "`@mui/material/Fab`";
import CasinoIcon from "`@mui/icons-material/Casino`";
import Alert from "`@mui/material/Alert`";

type Props = {
    label: string;
};

export default function RandomButton(props: Props) {
    return (
        <Suspense fallback={null}>
            <RandomButtonInner {...props} />
        </Suspense>
    );
}

export function RandomButtonInner(props: Props) {
    const navigateToRandomGame = useNavigateToRandomGame();
    const [error, setError] = useState<string | null>(null);

    const handleClick = async () => {
        setError(null);

        const result = await navigateToRandomGame();

        if (!result.success) {
            setError(result.error);
        }
    };

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                marginTop: "10px",
                gap: "10px"
            }}
        >
            {error && <Alert severity="error">{error}</Alert>}
            <Fab color="primary" variant="extended" onClick={handleClick}>
                <CasinoIcon sx={{ mr: 1 }} />
                {props.label}
            </Fab>
        </div>
    );
}
