import React from "react";
import {connect} from 'react-redux';
import {get_games} from "../../actions/games";

// Style

import ButtonGroup from '@material-ui/core/ButtonGroup';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Box from "@material-ui/core/Box";

import CircularProgress from '@material-ui/core/CircularProgress';
import Fab from '@material-ui/core/Fab';
import AutorenewIcon from '@material-ui/icons/Autorenew';
import ArrowDropUpIcon from '@material-ui/icons/ArrowDropUp';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';

// Custom

import CenteredGrid from "../Others/CenteredGrid";
import SnackbarWrapper from "../Others/CustomSnackbar";
import CardEntry from "./CardEntry";

// Inspired by https://stackoverflow.com/a/60068169/6149867
function makeMultiCriteriaSort(criteria) {
    return (a, b) => {
        for(let i = 0; i < criteria.length; i++) {
            const comparatorResult = criteria[i](a, b);
            if (comparatorResult !== 0) {
                return comparatorResult;
            }
        }
        return 0;
    }
}

// search criterias
const sortByNameASC = (a, b) => (a.title < b.title) ? -1 : (a.title > b.title ? 1 : 0) ;
const sortByNameDESC = (a, b) => -sortByNameASC(a, b);
const sortByReleaseDateASC = (a, b) => {
    let aa = a["releaseDate"];
    let bb = b["releaseDate"];
    return aa < bb ? -1 : (aa > bb ? 1 : 0);
};
const sortByReleaseDateDESC = (a, b) => -sortByReleaseDateASC(a, b);

// The gallery component
class GamesGallery extends React.Component {

    constructor(props) {
        super(props);
        this.handleSortChange = this.handleSortChange.bind(this);
        this.state = {
            currentSorters: [sortByNameASC], // the current sort(s) applied
            sortersState: {
                "name": "ASC",
                "releaseDate": "ASC"
            },
            sortersKeys: ["name", "releaseDate"], // useful to recreate currentSorters
            // in order to prevent if / else chain in the code
            sorters: {
                "name": {
                    "ASC": sortByNameASC,
                    "DESC": sortByNameDESC
                },
                "releaseDate": {
                    "ASC": sortByReleaseDateASC,
                    "DESC": sortByReleaseDateDESC
                }
            }
        }
    }

    componentDidMount() {
        this.props.get_games();
    };

    handleSortChange(field) {
        // Invert previous state value for this field
        const oldValue = this.state.sortersState[field];
        const newValue = (oldValue === "ASC") ? "DESC" : "ASC";

        // keep track of the sorters state
        const updatedSortersState = {
            ...this.state.sortersState,
            [field]: newValue
        }

        // Decide the sort algorithm now
        // Changed field should be the first criteria, other should be unchanged (following my simple order, from now)
        let updatedCurrentSorters = [field]
            .concat(
                this.state.sortersKeys.filter(s => s !== field)
            )
            .map(criteria => {
                const sortFcts = this.state.sorters[criteria];
                const state = updatedSortersState[criteria];
                return sortFcts[state];
            });
        
        // update state
        this.setState({
            ...this.state,
            sortersState: updatedSortersState,
            currentSorters: updatedCurrentSorters
        });
    }

    render() {
        const {loading, error, data} = this.props;

        if (loading) {
            return <CenteredGrid>
                <CircularProgress/>
            </CenteredGrid>
        }

        if (error) {

            return <React.Fragment>
                <SnackbarWrapper
                    variant={"error"}
                    message={this.props.error}
                />
                <CenteredGrid>
                    <Fab
                        variant="extended"
                        size="medium"
                        color="primary"
                        aria-label="reload"
                        onClick={() => {
                            this.props.get_games();
                        }}
                    >
                        <AutorenewIcon/>
                        Recharger
                    </Fab>
                </CenteredGrid>
            </React.Fragment>;
        }

        // Apply given sort choice
        let sorted = data.sort(
            makeMultiCriteriaSort(this.state.currentSorters)
        );

        return (
            <>
                <Box
                    display="flex"
                    flexWrap="wrap"
                    flexDirection="row"
                    justifyContent="flex-end"
                >
                    <ButtonGroup color="primary" aria-label="outlined primary button group">
                        {
                            this.state.sortersKeys
                                .map(criteria => 
                                    <Button onClick={this.handleSortChange.bind(this, criteria)} key={"searchCriteria_"+criteria}>
                                        {
                                            this.state.sortersState[criteria] === "ASC" ? <ArrowDropDownIcon /> : <ArrowDropUpIcon />
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
                <Box
                    display="flex"
                    flexWrap="wrap"
                    flexDirection="row"
                >
                    {
                        sorted.map(
                            game => <CardEntry game={game} key={game.playlistId ?? game.videoId}/>
                        )
                    }
                </Box>
            </>
        )
    }
}

// mapStateToProps(state, ownProps)
const mapStateToProps = state => ({
    data: state.games.games,
    loading: state.games.loading,
    error: state.games.error,
});

const mapDispatchToProps = {
    get_games
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(GamesGallery);