import React from "react";
import {useTranslation} from "react-i18next";
import { useHistory } from "react-router-dom";

// To check what should happen when clicking on a game
import { useTheme, styled } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

import Card from "@mui/material/Card";
import CardMedia from "@mui/material/CardMedia";
import CardActionArea from '@mui/material/CardActionArea';

import Tooltip from '@mui/material/Tooltip';
import Image from '@jy95/material-ui-image';
// @ts-ignore
import CardDialog from "./CardDialog.tsx";

const PREFIX = 'CardEntry';

const classes = {
    gameRoot: `${PREFIX}-gameRoot`,
    gameCover: `${PREFIX}-gameCover`,
    MuiCardActionArea: `${PREFIX}-MuiCardActionArea`
};

const StyledCard = styled(Card)((
    {
        theme
    }
) => ({
    [`&.${classes.gameRoot}`]: {
        position: "relative",
        height: "100%"
    },
    [`& .${classes.gameCover}`]: {
        zIndex: 1,
        height: "inherit"
    },
    [`& .${classes.MuiCardActionArea}`]: {
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

    const is_mobile_device = useMediaQuery(theme.breakpoints.down('md'));

    // state of context menu
    const [contextMenuOpen,setContextMenuOpen] = React.useState(false);
    
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

    return (
        <StyledCard className={classes.gameRoot}>

            <Tooltip title={t(label_for_game, { "gameName": gameTitle})} aria-label="WatchGame">
                <CardActionArea 
                    onClick={watchGame}
                    onContextMenu={(event) => {
                        event.preventDefault();
                        setContextMenuOpen(true);
                    }}
                    classes={{root: classes.MuiCardActionArea}}
                >
                    <CardMedia
                        className={classes.gameCover}
                        title={gameTitle}
                    >
                        <Image src={game.imagePath} alt={gameTitle}/>
                    </CardMedia>

                </CardActionArea>
            </Tooltip>
            <CardDialog game={game} contextMenuState={[contextMenuOpen,setContextMenuOpen]} />
            
        </StyledCard>
    );
}

export default CardEntry;