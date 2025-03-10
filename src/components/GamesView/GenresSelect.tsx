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

// Genres filter of GamesGallery
function GenresSelect() {

    const dispatch = useAppDispatch();
    const selectedGenres = useAppSelector(
        (state) => selectSelectedGenres(state)
    )
    const { data, isFetching } = useGetGenresQuery();
    const t = useTranslations("gamesLibrary")

    const genre_options : Genre[] = (data || [])
        .map(genre => ({
            name: t(`gamesGenres.${genre.id}` as any),
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
                name: t(`gamesGenres.${genre}` as any),
                id: genre
            }))}
            renderInput={(params) => <TextField {...params.InputProps} label={t("filtersLabels.genres") as string} />}
            onChange={(_event, value) => {
                dispatch(filteringByGenre(value.map(v => v.id)));
            }}
        />
    </>;
}

export default GenresSelect;