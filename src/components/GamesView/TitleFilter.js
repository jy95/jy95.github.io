import React from "react";
import {useTranslation} from "react-i18next";
import {connect} from 'react-redux';

// React Material UI
import Autocomplete from "@material-ui/core/Autocomplete";
import TextField from '@material-ui/core/TextField';

import {
    filter_games_by_title
} from "../../actions/games";

function TitleFilter(props) {

    const { title, filterByTitle, games } = props;
    const { t } = useTranslation('common');
    const options = games.map(game => game.title);

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
    title: state.games.filters.selected_title,
});

const mapDispatchToProps = {
    filterByTitle: filter_games_by_title, 
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(TitleFilter);