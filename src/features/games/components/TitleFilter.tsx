"use client";

// Hooks 
import { useTranslations } from "next-intl";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
    filterByTitle,
    selectSelectedTitle,
} 
from "@/redux/features/gamesSlice";

// React Material UI
import TextField from '@mui/material/TextField';

// Types
import type { ChangeEvent } from "react";

function TitleFilter() {

    const t = useTranslations("gamesLibrary.filtersLabels")
    const dispatch = useAppDispatch();

    // current value
    const title : string  = useAppSelector((state) => selectSelectedTitle(state));

    return <>
        <TextField
            id="search-game-title"
            label={t("title")}
            fullWidth
            value={title}
            onChange={(event: ChangeEvent<HTMLInputElement>) => {
                dispatch(filterByTitle(event.target.value));
            }}
        />
    </>;

}

export default TitleFilter;