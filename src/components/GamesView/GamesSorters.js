import React from "react";

import ButtonGroup from '@material-ui/core/ButtonGroup';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Box from "@material-ui/core/Box";

import ArrowDropUpIcon from '@material-ui/icons/ArrowDropUp';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';

import {connect} from 'react-redux';
import {sort_games} from "../../actions/games";


// Sort buttons of GamesGallery
class GamesSorters extends React.Component {
    
    constructor(props) {
        super(props);
        this.handleSortChange = this.handleSortChange.bind(this);
    }

    handleSortChange(field) {
        this.props.sort_games(field);
    }

    render() {

        const { state: sorters } = this.props;

        return (
            <Box
                display="flex"
                flexWrap="wrap"
                flexDirection="row"
                justifyContent="flex-end"
            >
                <ButtonGroup color="primary" aria-label="outlined primary button group">
                    {
                        sorters
                            .keys
                            .map(criteria => 
                                <Button onClick={this.handleSortChange.bind(this, criteria)} key={"searchCriteria_"+criteria}>
                                    {
                                        sorters.state[criteria] === "ASC" ? <ArrowDropDownIcon /> : <ArrowDropUpIcon />
                                    }
                                    <Typography>
                                        { criteria === "name" &&
                                            "Trier par nom" 
                                        }
                                        { criteria === "releaseDate" &&
                                            "Trier par date de sortie"
                                        }
                                    </Typography>
                                </Button>
                            )
                    }
                </ButtonGroup>
            </Box>
        )
    }
}

// mapStateToProps(state, ownProps)
const mapStateToProps = state => ({
    state: state.games.sorters,
});

const mapDispatchToProps = {
    sort_games
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(GamesSorters);