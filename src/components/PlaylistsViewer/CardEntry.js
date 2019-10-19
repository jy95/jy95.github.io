import React from "react";

import makeStyles from "@material-ui/core/styles/makeStyles";
import Card from "@material-ui/core/Card";
import CardHeader from "@material-ui/core/CardHeader";
import CardMedia from "@material-ui/core/CardMedia";
import CardActions from "@material-ui/core/CardActions";

import Collapse from "@material-ui/core/Collapse";
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";

import IconButton from "@material-ui/core/IconButton";
import ShareIcon from '@material-ui/icons/Share';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';

import MyExpandMore from "../Others/MyExpandMore";

// React Material UI needs that information to render the picture
// source : https://material-ui.com/api/card-media/
const useStyles = (params) => makeStyles({
    media: {
        height: params.height,
        minWidth: params.width,
    },
});

function CardEntry(props) {

    const {playlist} = props;

    // Use the medium size
    const classes = useStyles(playlist.thumbnails.medium)();
    const [expanded, setExpanded] = React.useState(false);

    // Text for Collapse
    let collapse_texts = [
        "" + playlist.length + " video(s)",
    ];
    // optional properties
    if (playlist.description) {
        collapse_texts.push(playlist.description)
    }
    if (playlist.tags) {
        collapse_texts.push("Mots clés :" + playlist.tags.join(" , "))
    }

    return (
        <Card>
            <CardHeader
                title={playlist.title}
                subheader={playlist.dateCreated.toLocaleDateString()}
            />
            <CardMedia
                image={playlist.thumbnails.medium.url}
                className={classes.media}
                title={playlist.title}
            />
            <CardActions disableSpacing>
                <IconButton aria-label="play">
                    <PlayArrowIcon/>
                </IconButton>
                <IconButton aria-label="share">
                    <ShareIcon/>
                </IconButton>
                <MyExpandMore
                    expanded={expanded}
                    setExpanded={setExpanded}
                />
            </CardActions>

            <Collapse in={expanded} timeout="auto" unmountOnExit>
                <CardContent>
                    {collapse_texts.map(
                        text =>
                            <Typography paragraph>
                                {text}
                            </Typography>
                    )}
                </CardContent>
            </Collapse>

        </Card>
    );
}

export default CardEntry;