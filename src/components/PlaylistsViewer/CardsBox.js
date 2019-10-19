import React from "react";

import Box from "@material-ui/core/Box";

function CardEntry(props) {

    const { playlist } = props;

    // https://material-ui.com/components/cards/
    // TODO
    return (
        <React.Fragment>

        </React.Fragment>
    );
}


class CardsBox extends React.Component {
    render() {

        const { data } = this.props;

        return (
            <Box
                flexWrap="wrap"
                display="flex"
            >
                {
                    data.map(
                        playlist => <Box>
                            <CardEntry playlist={playlist}/>
                        </Box>
                    )
                }
            </Box>
        )
    }
}

export default CardsBox;