import React from "react";

import Box from "@material-ui/core/Box";
import CardEntry from "./CardEntry";

class CardsBox extends React.Component {
    render() {

        const {data} = this.props;

        // trier en fonction de la longueur du titre pour mettre un maximum d'éléments par row
        // en attendant de trouver un meilleur fix
        let sorted = data.sort(
            function(a, b){
                // ASC  -> a.length - b.length
                // DESC -> b.length - a.length
                return a.title.length - b.title.length
            }
        );

        return (
            <Box
                flexWrap="wrap"
                display="flex"
            >
                {
                    sorted.map(
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