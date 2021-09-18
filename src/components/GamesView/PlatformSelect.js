import React from "react";
import {useTranslation} from "react-i18next";
import {connect} from 'react-redux';

// React Material UI
import Autocomplete from "@mui/material/Autocomplete";
import TextField from '@mui/material/TextField';
import SvgIcon from '@mui/material/SvgIcon';

import {
    filter_games_by_platform
} from "../../actions/games";

// icons
import iconsSVG from "./PlatformIcons";

function PlatformSelect(props) {

    const { filters } = props;
    const { t } = useTranslation('common');

    const options = filters
        .platforms
        .map(platform => ({
            label: platform,
            key: platform
        }))

    return <>
        <Autocomplete
            id="select-game-platform"
            openOnFocus
            options={options}
            getOptionLabel={(option) => option.label}
            isOptionEqualToValue={(option, value) => 
                Array.isArray(value) ? value.some(v => v.key === option.key) : value.key === option.key
            }
            renderInput={(params) => <TextField {...params} label={t("gamesLibrary.filtersLabels.platform")} />}
            renderOption={(option, _state) => (
                <li key={option.key}>
                    <SvgIcon titleAccess={option.label}>
                        <path d={iconsSVG[option.key]} />
                    </SvgIcon>
                    {option.label}
                </li>
            )}
            onChange={(_event, value) => {
                const platform = (value) ? value.key : "";
                props.filterByPlatform(platform);
            }}
            //value={filters.selected_genres}
        />
    </>;
}


// mapStateToProps(state, ownProps)
const mapStateToProps = state => ({
    filters: state.games.filters,
});

const mapDispatchToProps = {
    filterByPlatform: filter_games_by_platform, 
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(PlatformSelect);