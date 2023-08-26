"use client";

// Hooks
import { useTranslations } from "next-intl";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { filterByPlatform, selectSelectedPlatform } from "@/redux/features/gamesSlice";

// React Material UI
import Autocomplete from "@mui/material/Autocomplete";
import TextField from '@mui/material/TextField';

// icons
import Image from 'next/image'
import type { Platform } from "@/redux/sharedDefintion";

const PLATFORMS = [
    "GBA",
    "PC",
    "PS1",
    "PS2",
    "PS3",
    "PSP"
];

type Platform_Entry = {
    label: string;
    id: Platform;
}

function PlatformSelect() {

    const t = useTranslations("gamesLibrary.filtersLabels")
    const dispatch = useAppDispatch();
    const selectedPlatform = useAppSelector(
        (state) => selectSelectedPlatform(state)
    )

    const options = PLATFORMS
        .map(platform => ({
            label: platform,
            id: platform as Platform
        }))

    return (
        <Autocomplete<Platform_Entry, false>
            id="select-game-platform"
            openOnFocus
            options={options}
            getOptionLabel={(option) => option.label}
            isOptionEqualToValue={(option, value) => value.id === option.id}
            renderInput={(params) => <TextField {...params} label={t("platform") as string} />}
            renderOption={(props, option) => (
                <li {...props} key={option.id}>
                    <Image 
                        src={`/platforms/${option.id}.svg`}
                        height={24}
                        width={24}
                        alt={option.label}
                    />
                    {option.label}
                </li>
            )}
            onChange={(_event, value) => {
                const platform = (value) ? value.id : "";
                dispatch(filterByPlatform(platform));
            }}
            value={
                selectedPlatform ? {
                    id: selectedPlatform as Platform,
                    label: selectedPlatform
                } : null
            }
        />
    );
}

export default PlatformSelect;