import React from "react";
import {useTranslation} from "react-i18next";

import { useTheme } from '@material-ui/core/styles';
import useMediaQuery from '@material-ui/core/useMediaQuery';

import {Link} from 'react-router-dom';

import Card from "@material-ui/core/Card";
import CardMedia from "@material-ui/core/CardMedia";
import CardActions from "@material-ui/core/CardActions";

import IconButton from "@material-ui/core/IconButton";
import YouTubeIcon from '@material-ui/icons/YouTube';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';

import Tooltip from '@material-ui/core/Tooltip';


function CardEntry(props) {

    const {game} = props;
    const { t } = useTranslation('common');

    // Use the medium size
    const theme = useTheme();
    const is_large_screen = useMediaQuery(theme.breakpoints.up('md'));

    return (
        <Card>

            <CardMedia
                component="img"
                // https://material-ui.com/api/card-media/
                height="150"
                image={game.imagePath}
                title={game.title}
            />

            <CardActions disableSpacing justify="center">
                { is_large_screen &&
                    <Tooltip title={t("gamesLibrary.actionsButton.watchHere", { "gameName": game.title})} aria-label="Watch">
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
                }
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