import React from "react";
import {useTranslation} from "react-i18next";
import {connect} from 'react-redux';

// React Material UI
import Autocomplete from "@mui/material/Autocomplete";
import TextField from '@mui/material/TextField';
import SvgIcon from '@mui/material/SvgIcon';

import {
    filter_games_by_platform
} 
// @ts-ignore
from "../../actions/games.tsx";

// icons
// @ts-ignore
import iconsSVG from "./PlatformIcons.tsx";

const PLATFORMS = [
    "GBA",
    "PC",
    "PS1",
    "PS2",
    "PS3",
    "PSP"
];

function PlatformSelect(props) {

    const { selectedPlatform } = props;
    const { t } = useTranslation('common');

    const options = PLATFORMS
        .map(platform => ({
            label: platform,
            key: platform
        }))

    return <>
        <Autocomplete
            id="select-game-platform"
            openOnFocus
            options={options}
            getOptionLabel={(option: any) => option.label}
            isOptionEqualToValue={(option, value) => 
                Array.isArray(value) ? value.some(v => v.key === option.key) : value.key === option.key
            }
            renderInput={(params) => <TextField {...params} label={t("gamesLibrary.filtersLabels.platform")} />}
            renderOption={(props, option, _state) => (
                <li {...props} key={option.key}>
                    <SvgIcon titleAccess={option.label}>
                        <path d={iconsSVG[option.key]} />
                    </SvgIcon>
                    {option.label}
                </li>
            )}
            onChange={(_event, value) => {
                const platform = (value) ? (value as {[key: string]: any})?.key || value : "";
                props.filterByPlatform(platform);
            }}
            value={
                selectedPlatform ? {
                    key: selectedPlatform,
                    label: selectedPlatform
                } : null
            }
        />
    </>;
}


// mapStateToProps(state, ownProps)
const mapStateToProps = state => ({
    selectedPlatform: state.games.filters.activeFilters.find(s => s.key === "selected_platform")?.value || ""
});

const mapDispatchToProps = {
    filterByPlatform: filter_games_by_platform, 
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(PlatformSelect);