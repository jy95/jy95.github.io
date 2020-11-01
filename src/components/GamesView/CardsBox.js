import React from "react";

import Box from "@material-ui/core/Box";
import CardEntry from "./CardEntry";

// Inspired by https://stackoverflow.com/a/60068169/6149867
function makeMultiCriteriaSort(...criteria) {
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
    render() {

        const {data} = this.props;

        // trier en fonction de la longueur du titre pour mettre un maximum d'éléments par row
        // en attendant de trouver un meilleur fix
        let sorted = data.sort(
            makeMultiCriteriaSort(sortByNameASC)
        );

        return (
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
        )
    }
}

export default CardsBox;