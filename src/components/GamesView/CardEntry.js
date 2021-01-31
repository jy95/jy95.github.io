import React from "react";
import {useTranslation} from "react-i18next";
import { useHistory } from "react-router-dom";

// To check what should happen when clicking on a game
import { useTheme } from '@material-ui/core/styles';
import useMediaQuery from '@material-ui/core/useMediaQuery';

import { makeStyles } from '@material-ui/core/styles';

import Card from "@material-ui/core/Card";
import CardMedia from "@material-ui/core/CardMedia";
import CardActionArea from '@material-ui/core/CardActionArea';

import Tooltip from '@material-ui/core/Tooltip';

const useStyles = makeStyles((theme) => ({
    gameRoot: {
        position: "relative",
        height: "100%"
    },
    gameCover: {
        zIndex: 1,
        height: "inherit"
    },
    MuiCardActionArea:{
        height: "inherit",
        zIndex: 1
    }
}));

function CardEntry(props) {

    // hooks
    const theme = useTheme();
    const { t } = useTranslation('common');
    const history = useHistory();

    // rest
    const {game} = props;
    const classes = useStyles(props);
    const is_mobile_device = useMediaQuery(theme.breakpoints.down('md'));
    const label_for_game = (is_mobile_device) ? "gamesLibrary.actionsButton.watchOnYt" : "gamesLibrary.actionsButton.watchHere";

    function watchGame() {
        const local_path = game.url_type === "PLAYLIST" ? "/playlist/" + game.playlistId : "/video/" + game.videoId;
        console.log(is_mobile_device)
        if (is_mobile_device) {
            window.location.href = game.url;
        } else {
            history.push(local_path);
        }
    }

    return (
        <Card className={classes.gameRoot}>

            <Tooltip title={t(label_for_game, { "gameName": game.title})} aria-label="WatchGame">
                <CardActionArea 
                    onClick={watchGame}
                    classes={{root: classes.MuiCardActionArea}}
                >
                    <CardMedia
                        component="img"
                        className={classes.gameCover}
                        image={game.imagePath}
                        title={game.title}
                    />
                </CardActionArea>
            </Tooltip>
            
        </Card>
    );
}

export default CardEntry;