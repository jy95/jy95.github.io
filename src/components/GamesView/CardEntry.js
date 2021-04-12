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

// Context Menu
import {
    usePopupState,
    bindContextMenu
} from 'material-ui-popup-state/hooks'

import CardDialog from "./CardDialog";

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

    // props
    const {game} = props;
    const classes = useStyles(props);
    const is_mobile_device = useMediaQuery(theme.breakpoints.down('sm'));
    
    // labels
    const LABEL_WATCH_ON_YT = "gamesLibrary.actionsButton.watchOnYt";
    const LABEL_WATCH_HERE = "gamesLibrary.actionsButton.watchHere";

    // consts
    const label_for_game = (is_mobile_device) ? LABEL_WATCH_ON_YT : LABEL_WATCH_HERE;
    const {
        title: gameTitle,
        url: gameURL
    } = game;
    const local_path = game.url_type === "PLAYLIST" ? "/playlist/" + game.playlistId : "/video/" + game.videoId;

    function watchGame() {
        if (is_mobile_device) {
            window.location.href = gameURL;
        } else {
            history.push(local_path);
        }
    }

    const popupState = usePopupState({ variant: 'popover', popupId: 'contextMenu' });

    return (
        <Card className={classes.gameRoot}>

            <Tooltip title={t(label_for_game, { "gameName": gameTitle})} aria-label="WatchGame">
                <CardActionArea 
                    onClick={watchGame}
                    {...bindContextMenu(popupState)}
                    classes={{root: classes.MuiCardActionArea}}
                >
                    <CardMedia
                        component="img"
                        className={classes.gameCover}
                        image={game.imagePath}
                        title={gameTitle}
                    />
                </CardActionArea>
            </Tooltip>
            <CardDialog game={game} popupState={popupState} />
            
        </Card>
    );
}

export default CardEntry;