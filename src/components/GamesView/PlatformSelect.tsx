"use client";

// Hooks
import { useTranslations } from "next-intl";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { filterByPlatform, selectSelectedPlatform } from "@/redux/features/gamesSlice";

// React Material UI
import Autocomplete from "@mui/material/Autocomplete";
import TextField from '@mui/material/TextField';
import SvgIcon from '@mui/material/SvgIcon';

// icons
import iconsSVG from "@/components/GamesView/PlatformIcons";

type Platform_Entry = {
    label: string;
    id: number;
}

type NumericRange<
    START extends number,
    END extends number,
    ARR extends unknown[] = [],
    ACC extends number = never
> = ARR['length'] extends END
    ? ACC | START | END
    : NumericRange<START, END, [...ARR, 1], ARR[START] extends undefined ? ACC : ACC | ARR['length']>
type Platform = NumericRange<1, 6>

function PlatformSelect() {

    const t = useTranslations("gamesLibrary.filtersLabels")
    const dispatch = useAppDispatch();
    const selectedPlatform = useAppSelector(
        (state) => selectSelectedPlatform(state)
    )

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
                    <SvgIcon titleAccess={option.label}>
                        {iconsSVG[option.id as Platform]}
                    </SvgIcon>
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