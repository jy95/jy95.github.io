import React from "react";

import Grid from '@material-ui/core/Grid';

//
const NUMBER_OF_ITEMS_BY_ROW = 3;

function CardEntry(props) {

    const { playlist } = props;

    return (
        <React.Fragment>

        </React.Fragment>
    );
}


class CardsGrid extends React.Component {
    render() {

        const { data } = this.props;
        let items = [];
        let sub_items;

        while (data.length !== 0) {
            sub_items = data.splice(0, NUMBER_OF_ITEMS_BY_ROW);
            items.push(
                <Grid container item xs={12} spacing={3}>
                    {
                        sub_items.map(
                            playlist => <CardEntry playlist={playlist}/>
                        )
                    }
                </Grid>
            )
        }

        return (
            <Grid container spacing={1}>
                {items}
            </Grid>
        )
    }
}

export default CardsGrid;