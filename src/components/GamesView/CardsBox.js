import React from "react";

import ButtonGroup from '@material-ui/core/ButtonGroup';
import Button from '@material-ui/core/Button';
import ImportExportIcon from '@material-ui/icons/ImportExport';
import Typography from '@material-ui/core/Typography';
import Box from "@material-ui/core/Box";

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
    let aa = a["releaseDate"].split('/').reverse().join();
    let bb = a["releaseDate"].split('/').reverse().join();
    return aa < bb ? -1 : (aa > bb ? 1 : 0);
};
const sortByReleaseDateDESC = (a, b) => -sortByReleaseDateASC(a, b);

class CardsBox extends React.Component {
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

    handleSortChange(field) {
        // Invert previous state value for this field
        const oldValue = this.state.sortersState[field];
        const newValue = (oldValue === "ASC") ? "DESC" : "ASC";

        // keep track of the sorters state
        const updatedSortersState = Object.assign({}, this.state.sortersState, {
            [field]: newValue
        })

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
        })
    }

    render() {

        const {data} = this.props;

        // Apply given sort choice
        let sorted = data.sort(
            makeMultiCriteriaSort(this.state.currentSorters)
        );

        return (
            <div>
                <ButtonGroup color="primary" aria-label="outlined primary button group">
                    {
                        this.state.sortersKeys
                            .map(criteria => 
                                <Button onClick={() => this.handleSortChange(criteria)}>
                                    <ImportExportIcon />
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
                <Box
                    display="flex"
                    flexWrap="wrap"
                    flexDirection="row"
                >
                    {
                        sorted.map(
                            game => <CardEntry game={game} key={game.playlistId}/>
                        )
                    }
                </Box>
            </div>
        )
    }
}

export default CardsBox;