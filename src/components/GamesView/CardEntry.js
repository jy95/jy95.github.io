import React from "react";
import {useTranslation} from "react-i18next";

import { makeStyles } from '@material-ui/core/styles';

import {Link} from 'react-router-dom';

import Card from "@material-ui/core/Card";
import CardMedia from "@material-ui/core/CardMedia";
import CardActions from "@material-ui/core/CardActions";

import IconButton from "@material-ui/core/IconButton";
import YouTubeIcon from '@material-ui/icons/YouTube';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';

import Tooltip from '@material-ui/core/Tooltip';

const useStyles = makeStyles((theme) => ({
    localVideoPlayerButton : {
        [theme.breakpoints.down('sm')]: {
            display: "none"
        }
    },
    gameCover: {
        [theme.breakpoints.between('xs', 'md')]: {
            height: 200
        },
        [theme.breakpoints.up('md')]: {
            height: 150
        },
    },
    gameControls : {
        display: 'flex',
        justifyContent: 'center',
        paddingLeft: theme.spacing(1),
        paddingBottom: theme.spacing(1),
    }
}));

function CardEntry(props) {

    const {game} = props;
    const { t } = useTranslation('common');
    const classes = useStyles(props);

    return (
        <Card>

            <CardMedia
                component="img"
                className={classes.gameCover}
                image={game.imagePath}
                title={game.title}
            />

            <CardActions className={classes.gameControls}>

                <Tooltip title={t("gamesLibrary.actionsButton.watchHere", { "gameName": game.title})} aria-label="Watch" className={classes.localVideoPlayerButton}>
                    <IconButton
                        aria-label="play"
                        component={Link}
                        to={
                            game.url_type === "PLAYLIST" ? "/playlist/" + game.playlistId : "/video/" + game.videoId
                        }
                    >
                        <PlayArrowIcon/>
                    </IconButton>
                </Tooltip>            

                <Tooltip title={t("gamesLibrary.actionsButton.watchOnYt", { "gameName": game.title})} aria-label="WatchOnYoutube">
                    <IconButton
                        aria-label="share"
                        href={game.url}
                    >
                        <YouTubeIcon/>
                    </IconButton>
                </Tooltip>
            </CardActions>

        </Card>
    );
}

export default CardEntry;