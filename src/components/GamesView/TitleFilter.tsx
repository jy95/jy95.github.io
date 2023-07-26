import { useTranslation } from "@/i18n/client";
import { useLocale } from "@/hooks/useLocale";

// React Material UI
import Autocomplete from "@mui/material/Autocomplete";
import TextField from '@mui/material/TextField';

import {
    filterByTitle,
    selectSelectedTitle
} 
from "@/redux/services/gamesSlice";
// Hooks
import { useAppDispatch, useAppSelector } from "@/redux/hooks";

function TitleFilter() {

    const locale = useLocale();
    const { t } = useTranslation(locale, 'common');
    const dispatch = useAppDispatch();

    // needed as this Autocomplete cannot have duplicate
    const options = useAppSelector((state) => 
        [...new Set(state.games.games.map(game => game.title))]
    );
    const title : string  = useAppSelector(
        (state) => selectSelectedTitle(state)
    )

    return <>
        <Autocomplete
            id="search-game-title"
            freeSolo
            options={options}
            value={title}
            renderInput={(params) => <TextField {...params} label={t("gamesLibrary.filtersLabels.title")} />}
            onInputChange={(_event, value) => {
                dispatch(filterByTitle(value));
            }}
        />
    </>;

}

export default TitleFilter;