import React from "react";

import clsx from "clsx";
import PropTypes from "prop-types";

import {makeStyles} from "@material-ui/core";

import IconButton from "@material-ui/core/IconButton";
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

const useStyles = makeStyles(theme => ({
    expand: {
        transform: "rotate(0deg)",
        marginLeft: "auto",
        transition: theme.transitions.create("transform", {
            duration: theme.transitions.duration.shortest
        })
    },
    expandOpen: {
        transform: "rotate(180deg)"
    },
}));

function MyExpandMore(props) {
    const classes = useStyles();
    const {expanded, setExpanded} = props;

    const handleExpandClick = () => {
        setExpanded(!expanded);
    };

    return (
        <IconButton
            className={clsx(classes.expand, {
                [classes.expandOpen]: expanded
            })}
            onClick={handleExpandClick}
            aria-expanded={expanded}
            aria-label="show more"
        >
            <ExpandMoreIcon/>
        </IconButton>
    )
}

MyExpandMore.propTypes = {
    expanded: PropTypes.bool.isRequired,
    setExpanded: PropTypes.func.isRequired
};

export default MyExpandMore;