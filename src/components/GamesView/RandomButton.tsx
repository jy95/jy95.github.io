"use client";

// Needed because of 
// https://nextjs.org/docs/app/api-reference/functions/use-search-params#behavior
// https://nextjs.org/docs/messages/missing-suspense-with-csr-bailout
import { Suspense } from 'react'

// Hook
import useNavigateToRandomGame from '@/hooks/useNavigateToRandomGame';

// Components
import Fab from '@mui/material/Fab';
import CasinoIcon from '@mui/icons-material/Casino';

export default function RandomButton(props: Props) {
    return (
        <Suspense fallback={null}>
            <RandomButtonInner {...props} />
        </Suspense>
    );
}

type Props = {
    label: string
}

export function RandomButtonInner(props: Props) {

    const navigateToRandomGame = useNavigateToRandomGame();

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '10px' }}>
            <Fab color="primary" variant="extended" onClick={() => void navigateToRandomGame()}>
                <CasinoIcon sx={{ mr: 1 }} />
                { props.label }
            </Fab>
        </div>
    )
}
