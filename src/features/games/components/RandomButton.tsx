"use client";

// Needed because of 
// https://nextjs.org/docs/app/api-reference/functions/use-search-params#behavior
// https://nextjs.org/docs/messages/missing-suspense-with-csr-bailout
import { SilentSuspenseBoundary } from '@/components/common/SuspenseBoundary';

// Components
import Fab from '@mui/material/Fab';
import CasinoIcon from '@mui/icons-material/Casino';
import CircularProgress from '@mui/material/CircularProgress';

// Hooks
import { useNavigateToRandomGame } from '@/hooks/useNavigateToRandomGame';

export default function RandomButton(props: Props) {
    return (
        <SilentSuspenseBoundary>
            <RandomButtonInner {...props} />
        </SilentSuspenseBoundary>
    );
}

type Props = {
    label: string
}

export function RandomButtonInner(props: Props) {

    const { navigateToRandomGame, isPending } = useNavigateToRandomGame();

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '10px' }}>
            <Fab
                color="primary"
                variant="extended"
                onClick={navigateToRandomGame}
                disabled={isPending}
            >
                {isPending
                    ? <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
                    : <CasinoIcon sx={{ mr: 1 }} />
                }
                { props.label }
            </Fab>
        </div>
    )
}