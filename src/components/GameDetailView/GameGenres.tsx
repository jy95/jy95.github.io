// Hooks
import { useTranslations } from "next-intl";

// Material UI
import Chip from '@mui/material/Chip';
import Stack from "@mui/material/Stack";

// Types
import type { AppConfig } from 'next-intl';

/**
 * Accesses the keys of the 'gamesGenres' object defined within
 * the 'Messages' type of next-intl's augmented AppConfig.
 */
type GamesLibraryMessages = AppConfig['Messages']['gamesLibrary'];

// 🔑 This is the direct type you want:
export type GameGenreId = keyof GamesLibraryMessages['gamesGenres'];

function GameGenres(props: { genreIds: number[] }) {
    const t = useTranslations();

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
                />;
            })}

        </Stack>
    );
}

export default GameGenres;