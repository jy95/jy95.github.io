import React from "react";

import FormControl from '@material-ui/core/FormControl';
import FormGroup from '@material-ui/core/FormGroup';
import Popover from '@material-ui/core/Popover';
import Switch from '@material-ui/core/Switch';
import FormControlLabel from '@material-ui/core/FormControlLabel';

import Button from '@material-ui/core/Button';
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

        // For Popover
        const [anchorEl, setAnchorEl] = React.useState(null);

        const handleClick = (event) => {
          setAnchorEl(event.currentTarget);
        };
      
        const handleClose = () => {
          setAnchorEl(null);
        };
      
        const open = Boolean(anchorEl);
        const id = open ? 'simple-popover' : undefined;

        // label
        const field_labels = {
            "name": "Trier par nom",
            "releaseDate": "Trier par date de sortie"
        }

        return (
            <Box
                display="flex"
                flexWrap="wrap"
                flexDirection="row"
                justifyContent="flex-end"
            >
                <Button aria-describedby={id} variant="contained" color="primary" onClick={handleClick}>
                    Tris
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
                            {
                                sorters
                                    .keys
                                    .map(criteria => 
                                        <FormControlLabel
                                            control={
                                                <>
                                                    <Switch 
                                                        checked={
                                                            sorters.state[criteria] !== "ASC"
                                                        } 
                                                        onChange={this.handleSortChange.bind(this, criteria)} 
                                                        field={criteria} 
                                                    />
                                                    {
                                                        sorters.state[criteria] === "ASC" ? <ArrowDropDownIcon /> : <ArrowDropUpIcon />
                                                    }
                                                </>
                                            }
                                            key={"searchCriteria_"+criteria}
                                            label={field_labels[criteria]}
                                        />
                                    )
                            }
                        </FormGroup>
                    </FormControl>
                </Popover>
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