"use client";

// Hooks
import { useTranslations } from "next-intl";

// React Material UI
import Autocomplete from "@mui/material/Autocomplete";

import { renderAutocompleteInput } from "./renderAutocompleteInput";

// actions
import { useGetGenresQuery } from "@/redux/services/genresAPI"

// Generate list of values for game genre
import type { Genre } from "@/app/api/genres/route"
import type { GameGenreId } from "@/types/genres";

// Genres filter of GamesGallery
type Props = { value: number[]; onChange: (genres: number[]) => void };

function GenresSelect({ value: selectedGenres, onChange }: Props) {

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
            renderInput={renderAutocompleteInput(t("filtersLabels.genres"))}
            onChange={(_event, value) => {
                onChange(value.map(v => v.id));
            }}
        />
    </>;
}

export default GenresSelect;
