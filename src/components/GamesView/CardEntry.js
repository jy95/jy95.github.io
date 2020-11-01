import React from "react";

import {Link} from 'react-router-dom';

import makeStyles from "@material-ui/core/styles/makeStyles";
import Card from "@material-ui/core/Card";
import CardMedia from "@material-ui/core/CardMedia";
import CardActions from "@material-ui/core/CardActions";

import IconButton from "@material-ui/core/IconButton";
import ShareIcon from '@material-ui/icons/Share';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';

import Tooltip from '@material-ui/core/Tooltip';

// React Material UI needs that information to render the picture
// source : https://material-ui.com/api/card-media/
const useStyles = (params) => makeStyles({
    media: {
        height: params.height,
        minWidth: params.width,
    },
});

function CardEntry(props) {

    const {game} = props;

    // Use the medium size
    const classes = useStyles({height: "500px", minWidth: "250px"})();

    return (
        <Card>
            <Tooltip title={game.title} aria-label={game.title}>
                <CardMedia
                    image={game.imagePath}
                    className={classes.media}
                />
            </Tooltip>

            <CardActions disableSpacing>
                <IconButton
                    aria-label="play"
                    component={Link}
                    to={"/playlists/" + game.playlistId}
                >
                    <PlayArrowIcon/>
                </IconButton>
                {/* Ugly fix because react router cannot tell if it is a external url :(  */}
                <IconButton
                    aria-label="share"
                    component={
                        (props) =>
                            // eslint-disable-next-line jsx-a11y/anchor-has-content
                            <a
                                href={props.to}
                                {...props}
                            />
                    }
                    to={"https://www.youtube.com/playlist?list=" + game.playlistId }
                >
                    <ShareIcon/>
                </IconButton>
            </CardActions>

        </Card>
    );
}

export default CardEntry;