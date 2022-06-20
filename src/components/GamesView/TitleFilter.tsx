import {useTranslation} from "react-i18next";
import { useSelector, useDispatch } from 'react-redux';

// React Material UI
import Autocomplete from "@mui/material/Autocomplete";
import TextField from '@mui/material/TextField';

import {
    filterByTitle
} 
// @ts-ignore
from "../../services/gamesSlice.tsx";
// @ts-ignore
import { RootState, AppDispatch } from '../Store.tsx';

function TitleFilter(_props) {

    const { t } = useTranslation('common');
    const dispatch: AppDispatch = useDispatch();

    // needed as this Autocomplete cannot have duplicate
    const options = useSelector((state: RootState) => 
        [...new Set(state.games.games.map(game => game.title))]
    );
    const title : string  = useSelector(
        (state: RootState) => (state.games.activeFilters.find((s => s.key === "selected_title")) as {
            key: "selected_title";
            value: string
        } | undefined)?.value || ""
    );

    return <>
        <Autocomplete
            id="search-game-title"
            freeSolo
            options={options}
            value={title}
            renderInput={(params) => <TextField {...params} label={t("gamesLibrary.filtersLabels.title")} />}
            onInputChange={(_event, value) => {
                // TODO : needed as because of useSelector, refreshs can happen
                if (value !== title){
                    dispatch(filterByTitle(value));
                }
            }}
        />
    </>;

}

export default TitleFilter;