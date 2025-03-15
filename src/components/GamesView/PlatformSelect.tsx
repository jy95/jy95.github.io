"use client";

// Hooks
import { useTranslations } from "next-intl";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { filterByPlatform, selectSelectedPlatform } from "@/redux/features/gamesSlice";
import { useGetPlatformsQuery } from "@/redux/services/platformsAPI";

// React Material UI
import Autocomplete from "@mui/material/Autocomplete";
import TextField from '@mui/material/TextField';

import type { Platform_Entry } from "@/app/api/platforms/route";

function PlatformSelect() {

    const t = useTranslations("gamesLibrary.filtersLabels")
    const dispatch = useAppDispatch();
    const { data, isFetching } = useGetPlatformsQuery();
    const selectedPlatform = useAppSelector(
        (state) => selectSelectedPlatform(state)
    )

    return (
        <Autocomplete<Platform_Entry, false>
            id="select-game-platform"
            openOnFocus
            options={data || []}
            loading={isFetching}
            getOptionLabel={(option) => option.name}
            isOptionEqualToValue={(option, value) => value.id === option.id}
            // @ts-ignore Type not accurate, will report it to MUI later
            renderInput={(params) => <TextField {...params} label={t("platform") as string} />}
            renderOption={(props, option) => (
                <li {...props} key={option.name}>
                    {option.name}
                </li>
            )}
            onChange={(_event, value) => {
                const platform = (value) ? value.id : undefined;
                dispatch(filterByPlatform(platform));
            }}
            value={
                selectedPlatform ? {
                    id: selectedPlatform,
                    name: (data || [] ).find(p => p.id === selectedPlatform)?.name || ""
                } : null
            }
        />
    );
}

export default PlatformSelect;