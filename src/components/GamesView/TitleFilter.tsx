import { useTranslation } from "react-i18next";

// React Material UI
import Autocomplete from "@mui/material/Autocomplete";
import TextField from '@mui/material/TextField';

import {
    filterByTitle,
    selectSelectedTitle
} 
from "../../services/gamesSlice";
// Hooks
import { useAppDispatch, useAppSelector } from "../../hooks/typedRedux";

function TitleFilter(_props : {[key: string | number | symbol] : any}) {

    const { t } = useTranslation('common');
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