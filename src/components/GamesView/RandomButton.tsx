"use client";

// Needed because of 
// https://nextjs.org/docs/app/api-reference/functions/use-search-params#behavior
// https://nextjs.org/docs/messages/missing-suspense-with-csr-bailout
import { Suspense } from 'react'

// Hooks
import { useRouter } from '@/i18n/routing';
import { useTranslations } from "next-intl";

// Components
import Fab from '@mui/material/Fab';
import CasinoIcon from '@mui/icons-material/Casino';

// Types
import type { RandomAnswer } from "@/app/api/random/route";

export default function RandomButton() {
    return (
        <Suspense fallback={null}>
            <RandomButtonInner />
        </Suspense>
    );
}

export function RandomButtonInner() {

    const router = useRouter();
    const t = useTranslations("gamesLibrary");

    const fetchRandomGame = async () => {
        const response = await fetch('/api/random');
        const data = await response.json() as RandomAnswer;
        router.push({
            pathname: data.type === "PLAYLIST" ? "/playlist/[id]" : "/video/[id]",
            params: { id: data.identifier }
        });
    }

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '10px' }}>
            <Fab color="primary" variant="extended" onClick={fetchRandomGame}>
                <CasinoIcon sx={{ mr: 1 }} />
                { t("randomButtonLabel") }
            </Fab>
        </div>
    )
}