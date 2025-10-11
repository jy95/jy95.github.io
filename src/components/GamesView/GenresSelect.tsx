"use client";

// Hooks
import { useTranslations } from "next-intl";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";

// React Material UI
import Autocomplete from "@mui/material/Autocomplete";
import TextField from '@mui/material/TextField';

// actions
import { filteringByGenre, selectSelectedGenres } from "@/redux/features/gamesSlice";
import { useGetGenresQuery } from "@/redux/services/genresAPI"

// Generate list of values for game genre
import type { Genre } from "@/app/api/genres/route"

import type { AppConfig } from 'next-intl';

/**
 * Accesses the keys of the 'gamesGenres' object defined within
 * the 'Messages' type of next-intl's augmented AppConfig.
 */
type GamesLibraryMessages = AppConfig['Messages']['gamesLibrary'];

// 🔑 This is the direct type you want:
export type GameGenreId = keyof GamesLibraryMessages['gamesGenres'];

// Genres filter of GamesGallery
function GenresSelect() {

    const dispatch = useAppDispatch();
    const selectedGenres = useAppSelector(
        (state) => selectSelectedGenres(state)
    )
    const { data, isFetching } = useGetGenresQuery();
    const t = useTranslations("gamesLibrary")

    function idToName(genreId: GameGenreId) {
        return t(`gamesGenres.${genreId}`);
    }

    const genre_options : Genre[] = (data || [])
        .map(genre => ({
            name: idToName(genre.id.toString() as GameGenreId),
            id: genre.id
        }))
        .sort( 
            (a, b) => (a.name < b.name) ? -1 : (a.name > b.name ? 1 : 0) 
        );

    return <>
        <Autocomplete<Genre, true, true>
            multiple
            openOnFocus
            filterSelectedOptions 
            id="select-game-genre"
            limitTags={3}
            loading={isFetching}
            options={genre_options}
            getOptionLabel={(option) => option.name}
            isOptionEqualToValue={(option, value) => 
                Array.isArray(value) ? value.some(v => v.id === option.id) : value.id === option.id
            }
            value={selectedGenres.map(genre => ({
                name: idToName(genre.toString() as GameGenreId),
                id: genre
            }))}
            /* eslint-disable */
            // @ts-ignore Type not accurate, will report it to MUI later
            renderInput={(params) => <TextField {...params} label={t("filtersLabels.genres") as string} />}
            /* eslint-enable */
            onChange={(_event, value) => {
                dispatch(filteringByGenre(value.map(v => v.id)));
            }}
        />
    </>;
}

export default GenresSelect;