"use client";

// Hooks
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { filtersToSearchParams } from "@/lib/gamesFilterUtils";

// Material UI
import Chip from '@mui/material/Chip';
import Stack from "@mui/material/Stack";

// Types
import type { GameGenreId } from "@/types/genres";

function GameGenres(props: { genreIds: number[] }) {
    const t = useTranslations();
    const router = useRouter();

    return (
        <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
            
            {props.genreIds.map((genreId) => {
                const genreKey = genreId.toString() as GameGenreId;
                const genreName = t(`gamesLibrary.gamesGenres.${genreKey}`);
                return <Chip 
                    key={genreId} 
                    label={genreName} 
                    size="small" 
                    variant="outlined"
                    onClick={() => router.push({
                        pathname: "/games",
                        query: Object.fromEntries(filtersToSearchParams({ genres: [genreId] })),
                    })}
                />;
            })}

        </Stack>
    );
}

export default GameGenres;
