// Hooks
import { useTranslations } from "next-intl";

// React Material UI
import Autocomplete from "@mui/material/Autocomplete";

import { renderAutocompleteInput } from "./renderAutocompleteInput";

// actions
import { useGetGenresQuery } from "@/redux/services/genresAPI"

// Generate list of values for game genre
import type { ChipTypeMap } from "@mui/material/Chip";
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
        <Autocomplete<Genre, true, true, false, ChipTypeMap['defaultComponent'], number>
            multiple
            disableClearable
            openOnFocus
            filterSelectedOptions
            id="select-game-genre"
            limitTags={3}
            loading={isFetching}
            options={options}
            getOptionLabel={(option) => option.name}
            getOptionValue={(option) => option.id}
            value={selectedGenres.filter(id => options.some(option => option.id === id))}
            renderInput={renderAutocompleteInput(t("filtersLabels.genres"))}
            onChange={(_event, value) => {
                onChange(value);
            }}
        />
    );
}

export default GenresSelect;
