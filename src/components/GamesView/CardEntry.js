import React from "react";

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

    // Use the medium size
    const theme = useTheme();
    const is_large_screen = useMediaQuery(theme.breakpoints.up('lg'));

    return (
        <Card>

            <CardMedia
                component="img"
                // https://material-ui.com/api/card-media/
                height="150"
                image={game.imagePath}
                title={game.title}
            />

            <CardActions disableSpacing justifyContent='center'>
                { is_large_screen &&
                    <Tooltip title={"Regarder " + game.title} aria-label="Regarder">
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
                <Tooltip title={"Regarder " + game.title + " sur Youtube"} aria-label="Regarder sur Youtube">
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