import React from 'react';
import PropTypes from 'prop-types';
import Grid from "@material-ui/core/Grid";

function CenteredBox(props) {
    const {children} = props;
    return (
        <Grid
            container
            spacing={0}
            direction="column"
            alignItems="center"
            justify="center"
            style={{minHeight: '80vh'}}
        >
            {children}
        </Grid>
    )
}

CenteredBox.propTypes = {
  children: PropTypes.node,
};

export default CenteredBox;