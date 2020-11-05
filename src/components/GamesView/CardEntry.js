import React from "react";

import { useTheme } from '@material-ui/core/styles';
import useMediaQuery from '@material-ui/core/useMediaQuery';

import {Link} from 'react-router-dom';

import makeStyles from "@material-ui/core/styles/makeStyles";
import Card from "@material-ui/core/Card";
import CardMedia from "@material-ui/core/CardMedia";
import CardActions from "@material-ui/core/CardActions";

import IconButton from "@material-ui/core/IconButton";
import YouTubeIcon from '@material-ui/icons/YouTube';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';

import Tooltip from '@material-ui/core/Tooltip';

// React Material UI needs that information to render the picture
// source : https://material-ui.com/api/card-media/
const useStyles = (params) => makeStyles({
    media: {
        height: params.height,
    },
});

function CardEntry(props) {

    const {game} = props;

    // Use the medium size
    const classes = useStyles({height: "150px"})();
    const theme = useTheme();
    const is_large_screen = useMediaQuery(theme.breakpoints.up('lg'));

    return (
        <Card>
            <Tooltip title={game.title} aria-label={game.title}>
                <CardMedia
                    image={game.imagePath}
                    className={classes.media}
                />
            </Tooltip>

            <CardActions disableSpacing>
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