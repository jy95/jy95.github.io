import useTranslation from 'next-translate/useTranslation'

// React Material UI
import TextField from '@mui/material/TextField';

import {
    filterByTitle,
    selectSelectedTitle,
} 
from "@/redux/services/gamesSlice";
// Hooks
import { useAppDispatch, useAppSelector } from "@/redux/hooks";

function TitleFilter() {

    const { t } = useTranslation('common');
    const dispatch = useAppDispatch();

    // current value
    const title : string  = useAppSelector((state) => selectSelectedTitle(state));

    return <>
        <TextField
            id="search-game-title"
            label={t("gamesLibrary.filtersLabels.title")}
            value={title}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                dispatch(filterByTitle(event.target.value));
            }}
        />
    </>;

}

export default TitleFilter;