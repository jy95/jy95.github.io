import React from "react";
import {useTranslation} from "react-i18next";
import {connect} from 'react-redux';

// React Material UI
import Autocomplete from "@mui/material/Autocomplete";
import TextField from '@mui/material/TextField';

import {
    filter_games_by_title
} 
// @ts-ignore
from "../../actions/games.tsx";

function TitleFilter(props) {

    const { title, filterByTitle, games } = props;
    const { t } = useTranslation('common');
    // needed as this Autocomplete cannot have duplicate
    const options = [...new Set(games.map(game => game.title))];

    return <>
        <Autocomplete
            id="search-game-title"
            freeSolo
            options={options}
            value={title}
            renderInput={(params) => <TextField {...params} label={t("gamesLibrary.filtersLabels.title")} />}
            onInputChange={(_event, value) => {
                filterByTitle(value);
            }}
        />
    </>;

}

// mapStateToProps(state, ownProps)
const mapStateToProps = state => ({
    title: state.games.filters.activeFilters.find(s => s.key === "selected_title")?.value || "",
});

const mapDispatchToProps = {
    filterByTitle: filter_games_by_title, 
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(TitleFilter);