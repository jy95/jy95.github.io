"use client";

// Hooks
import { useRouter } from 'next/navigation';
import { useTranslations } from "next-intl";

// Components
import Fab from '@mui/material/Fab';
import CasinoIcon from '@mui/icons-material/Casino';

// Types
import type { RandomAnswer } from "@/app/api/random/route";

export default function RandomButton() {

    const router = useRouter();
    const t = useTranslations("gamesLibrary");
    const errorLabels = useTranslations("error");

    const fetchRandomGame = async () => {
        const response = await fetch('/api/random');
        try {
            const data = await response.json() as RandomAnswer;
            const base_path = data.type === "PLAYLIST" ? "/playlist/" : "/video/";
            const local_path = base_path + data.identifier;
            router.push(`${local_path}`);
        } catch (err) {
            alert(errorLabels("title") + " " + errorLabels("retry"));
        }
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