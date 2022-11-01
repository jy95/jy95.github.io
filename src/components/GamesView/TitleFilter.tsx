import { useTranslation } from "react-i18next";
import { useSelector, useDispatch } from 'react-redux';

// React Material UI
import Autocomplete from "@mui/material/Autocomplete";
import TextField from '@mui/material/TextField';

import {
    filterByTitle,
    selectFilterByName
} 
from "../../services/gamesSlice";
import type { RootState, AppDispatch } from '../Store';

function TitleFilter(_props : {[key: string | number | symbol] : any}) {

    const { t } = useTranslation('common');
    const dispatch: AppDispatch = useDispatch();

    // needed as this Autocomplete cannot have duplicate
    const options = useSelector((state: RootState) => 
        [...new Set(state.games.games.map(game => game.title))]
    );
    const title : string  = useSelector(
        (state: RootState) => selectFilterByName(state, {
            filterKey: "selected_title",
            defaultValue: ""
        })
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