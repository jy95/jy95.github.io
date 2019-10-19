import React from "react";

import Box from "@material-ui/core/Box";
import CardEntry from "./CardEntry";

class CardsBox extends React.Component {
    render() {

        const {data} = this.props;

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