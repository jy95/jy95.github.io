import useTranslation from 'next-translate/useTranslation'

// React Material UI
import Autocomplete from "@mui/material/Autocomplete";
import TextField from '@mui/material/TextField';

import {
    filterByTitle,
    selectSelectedTitle,
    selectListOfGameTitles
} 
from "@/redux/services/gamesSlice";
// Hooks
import { useAppDispatch, useAppSelector } from "@/redux/hooks";

function TitleFilter() {

    const { t } = useTranslation('common');
    const dispatch = useAppDispatch();

    // needed as this Autocomplete cannot have duplicate
    const options = useAppSelector((state) => selectListOfGameTitles(state));
    const title : string  = useAppSelector((state) => selectSelectedTitle(state));

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