"use client";

// Hooks
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { filtersToSearchParams } from "@/lib/gamesFilterUtils";

// Material UI
import Chip from '@mui/material/Chip';
import Stack from "@mui/material/Stack";
import LabelIcon from '@mui/icons-material/Label';
import InfoRow from './rows/InfoRow';

// Types
import type { GameGenreId } from "@/types/genres";

function GameGenres(props: { genreIds: number[] }) {
    const t = useTranslations();
    const router = useRouter();
    if (!props.genreIds.length) return null;

    return (
        <InfoRow
            label={t('gameDetail.genres', { count: props.genreIds.length })}
            icon={<LabelIcon fontSize="small" />}
            value={
                <Stack component="span" direction="row" useFlexGap spacing={1} sx={{ flexWrap: "wrap" }}>
                    {props.genreIds.map((genreId) => {
                        const genreKey = genreId.toString() as GameGenreId;
                        const genreName = t(`gamesLibrary.gamesGenres.${genreKey}`);
                        return <Chip
                            component="span"
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
            }
        />
    );
}

export default GameGenres;
