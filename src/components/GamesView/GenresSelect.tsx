import { useTranslation } from "react-i18next";
import { useSelector, useDispatch } from 'react-redux';

// React Material UI
import Autocomplete from "@mui/material/Autocomplete";
import TextField from '@mui/material/TextField';

import { filteringByGenre } from "../../services/gamesSlice";
import type { RootState, AppDispatch } from '../Store';

// Each one is also a key for translation
const GENRES = [
    "Action",
    "Adventure",
    "Arcade",
    "Board Games",
    "Card",
    "Casual",
    "Educational",
    "Family",
    "Fighting",
    "Indie",
    "MMORPG",
    "Platformer",
    "Puzzle",
    "RPG",
    "Racing",
    "Shooter",
    "Simulation",
    "Sports",
    "Strategy",
    "Misc"
] as const;
type GenreValue = typeof GENRES[number];

// Genres filter of GamesGallery
function GenresSelect(_props : {[key: string | number | symbol] : any}) {

    const dispatch: AppDispatch = useDispatch();
    const selectedGenres : string[]  = useSelector(
        (state: RootState) => (state.games.activeFilters.find((s => s.key === "selected_genres")) as {
            key: "selected_genres";
            value: string[]
        } | undefined)?.value
    ) || [];
    const { t } = useTranslation('common');

    // Generate list of values for game genre
    const genre_options : {
        label: string,
        key: GenreValue
    }[] = GENRES
        .map(genre => ({
            label: t(`gamesLibrary.gamesGenres.${genre}` as const),
            key: genre
        }))
        .sort( 
            (a, b) => (a.label < b.label) ? -1 : (a.label > b.label ? 1 : 0) 
        );

    return <>
        <Autocomplete
            multiple
            openOnFocus
            filterSelectedOptions 
            id="select-game-genre"
            limitTags={3}
            options={genre_options}
            getOptionLabel={(option : any) => option.label}
            isOptionEqualToValue={(option, value) => 
                Array.isArray(value) ? value.some(v => v.key === option.key) : value.key === option.key
            }
            value={selectedGenres.map(genre => ({
                label: t(`gamesLibrary.gamesGenres.${genre as GenreValue}` as const),
                key: genre
            }))}
            renderInput={(params) => <TextField {...params} label={t("gamesLibrary.filtersLabels.genres") as string} />}
            onChange={(_event, value) => {
                dispatch(filteringByGenre(value.map(v => v.key)));
            }}
        />
    </>;
}

export default GenresSelect;