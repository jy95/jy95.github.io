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
                let aa = a["releaseDate"].split('/').reverse().join();
                let bb = a["releaseDate"].split('/').reverse().join();
                return aa < bb ? -1 : (aa > bb ? 1 : 0);
            }
        );

        return (
            <Box
                flexWrap="wrap"
                display="flex"
            >
                {
                    sorted.map(
                        game => <Box>
                            <CardEntry game={game}/>
                        </Box>
                    )
                }
            </Box>
        )
    }
}

export default CardsBox;