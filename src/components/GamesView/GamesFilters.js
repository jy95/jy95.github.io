import React from "react";
import {useTranslation} from "react-i18next";
import {connect} from 'react-redux';

// React Material UI
import Autocomplete from '@material-ui/lab/Autocomplete';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import FormGroup from '@material-ui/core/FormGroup';
import Popover from '@material-ui/core/Popover';
import FormControl from '@material-ui/core/FormControl';

import {
    filter_games_by_genre, 
    filter_games_by_title
} from "../../actions/games";

// Filter buttons of GamesGallery
function GamesFilters(props) {

    const { filters } = props;
    const { t } = useTranslation('common');

    // For Popover
    const [anchorEl, setAnchorEl] = React.useState(null);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };
    
    const handleClose = () => {
        setAnchorEl(null);
    };
    
    const open = Boolean(anchorEl);
    const id = open ? 'filter-popover' : undefined;

    // Generate list of values for game genre
    const genre_options = filters
        .genres
        .map(genre => ({
            label: t("gamesLibrary.gamesGenres." + genre),
            key: genre
        }))
        .sort( 
            (a, b) => (a.label < b.label) ? -1 : (a.label > b.label ? 1 : 0) 
        );

    return (
        <>
            <Button aria-describedby={id} variant="contained" color="primary" onClick={handleClick}>
                {t("gamesLibrary.filtersButtonLabel")}
            </Button>

            <Popover
                id={id}
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'center',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'center',
                }}
            >
                <FormControl component="fieldset">
                    <FormGroup>
                        <FormControl>
                            <Autocomplete
                                multiple
                                filterSelectedOptions 
                                id="select-game-genre"
                                style={{ width: 300 }}
                                options={genre_options}
                                getOptionLabel={(option) => option.label}
                                getOptionSelected={(option, value) => 
                                    Array.isArray(value) ? value.some(v => v.key === option.key) : value.key === option.key
                                }
                                renderInput={(params) => <TextField {...params} label={t("gamesLibrary.filtersLabels.genres")} variant="outlined" />}
                                onChange={(_event, value) => {
                                    const genres = (value) ? value : [];
                                    props.filterByGenre(genres);
                                }}
                            />
                        </FormControl>
                    </FormGroup>
                </FormControl>
            </Popover>
        </>
    );
}

// mapStateToProps(state, ownProps)
const mapStateToProps = state => ({
    filters: state.games.filters,
});

const mapDispatchToProps = {
    filterByGenre: filter_games_by_genre, 
    filterByTitle: filter_games_by_title
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(GamesFilters);