import React from "react";

import Card from "@material-ui/core/Card";
import CardHeader from "@material-ui/core/CardHeader";
import CardMedia from "@material-ui/core/CardMedia";
import CardActions from "@material-ui/core/CardActions";

import MyExpandMore from "../Others/MyExpandMore";
import Collapse from "@material-ui/core/Collapse";
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";

import IconButton from "@material-ui/core/IconButton";
import ShareIcon from '@material-ui/icons/Share';
import PlayArrowIcon from "@material-ui/core/SvgIcon/SvgIcon";

function CardEntry(props) {

    const {playlist} = props;

    const [expanded, setExpanded] = React.useState(false);

    // https://material-ui.com/components/cards/
    // TODO
    return (
        <Card>
            <CardHeader
                title={playlist.title}
                subheader={playlist.dateCreated.toLocaleDateString()}
            />
            <CardMedia
                image={playlist.thumbnails.medium.url}
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
                    <Typography paragraph>{playlist.length} video(s)</Typography>
                    <Typography paragraph>
                        Mots clés :
                    </Typography>
                    <Typography paragraph>
                        {playlist.tags.join(" , ")}
                    </Typography>
                    <Typography paragraph>
                        Description :
                    </Typography>
                    <Typography paragraph>
                        {playlist.description}
                    </Typography>
                </CardContent>
            </Collapse>

        </Card>
    );
}

export default CardEntry;