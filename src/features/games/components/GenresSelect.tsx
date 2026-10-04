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

    function toOption(id: number): Genre {
        return { id, name: t(`gamesGenres.${id.toString() as GameGenreId}`) };
    }

    const options = (data || [])
        .map(genre => toOption(genre.id))
        .sort(
            (a, b) => (a.name < b.name) ? -1 : (a.name > b.name ? 1 : 0)
        );

    return (
        <Autocomplete<Genre, true, true>
            multiple
            openOnFocus
            filterSelectedOptions
            id="select-game-genre"
            limitTags={3}
            loading={isFetching}
            options={options}
            getOptionLabel={(option) => option.name}
            isOptionEqualToValue={(option, value) => value.id === option.id}
            value={selectedGenres.map(toOption)}
            renderInput={renderAutocompleteInput(t("filtersLabels.genres"))}
            onChange={(_event, value) => {
                onChange(value.map(v => v.id));
            }}
        />
    );
}

export default GenresSelect;
