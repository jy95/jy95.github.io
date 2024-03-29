"use client";

// Hooks
import { useTranslations } from "next-intl";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";

// React Material UI
import Autocomplete from "@mui/material/Autocomplete";
import TextField from '@mui/material/TextField';

import { filteringByGenre, selectSelectedGenres } from "@/redux/features/gamesSlice";

import type { Genre as GenreValue } from "@/redux/sharedDefintion";
// Each one is also a key for translation
import { genre_list as GENRES } from "@/redux/sharedDefintion";

// Generate list of values for game genre
type Genre = {
    label: string,
    id: GenreValue
};

// Genres filter of GamesGallery
function GenresSelect() {

    const dispatch = useAppDispatch();
    const selectedGenres = useAppSelector(
        (state) => selectSelectedGenres(state)
    )
    const t = useTranslations("gamesLibrary")

    const genre_options : Genre[] = GENRES
        .map(genre => ({
            label: t(`gamesGenres.${genre}` as const),
            id: genre
        }))
        .sort( 
            (a, b) => (a.label < b.label) ? -1 : (a.label > b.label ? 1 : 0) 
        );

    return <>
        <Autocomplete<Genre, true, true>
            multiple
            openOnFocus
            filterSelectedOptions 
            id="select-game-genre"
            limitTags={3}
            options={genre_options}
            getOptionLabel={(option) => option.label}
            isOptionEqualToValue={(option, value) => 
                Array.isArray(value) ? value.some(v => v.id === option.id) : value.id === option.id
            }
            value={selectedGenres.map(genre => ({
                label: t(`gamesGenres.${genre as GenreValue}` as const),
                id: genre as GenreValue
            }))}
            renderInput={(params) => <TextField {...params} label={t("filtersLabels.genres") as string} />}
            onChange={(_event, value) => {
                dispatch(filteringByGenre(value.map(v => v.id)));
            }}
        />
    </>;
}

export default GenresSelect;