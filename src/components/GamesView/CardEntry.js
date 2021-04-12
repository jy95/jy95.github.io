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
// For the contextMenu State
import {
    usePopupState,
    bindMenu,
    bindContextMenu
} from 'material-ui-popup-state/hooks'

// For a custom contextMenu (nice for UI)
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';

// Icons for contextMenu
import YouTubeIcon from '@material-ui/icons/YouTube';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import FileCopyIcon from '@material-ui/icons/FileCopy';
import RedditIcon from '@material-ui/icons/Reddit';
import TwitterIcon from '@material-ui/icons/Twitter';
import FacebookIcon from '@material-ui/icons/Facebook';

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
    const LABEL_COPY_LINK = "gamesLibrary.actionsButton.copyLink";
    const LABEL_TWITTER = "gamesLibrary.actionsButton.shareOnTwitter";
    const LABEL_FACEBOOK = "gamesLibrary.actionsButton.shareOnFacebook";
    const LABEL_REDDIT = "gamesLibrary.actionsButton.shareOnReddit";

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

    // dialog options
    const dialog_options = [
        // Watch here
        {
            "icon": () => <PlayArrowIcon fontSize="small"/>,
            "text": t(LABEL_WATCH_HERE, { "gameName": gameTitle}),
            "onClick": () => {
                popupState.close();
                history.push(local_path);
            }
        },
        // watch on Youtube
        {
            "icon": () => <YouTubeIcon fontSize="small"/>,
            "text": t(LABEL_WATCH_ON_YT, { "gameName": gameTitle}),
            "onClick": () => {
                popupState.close();
                window.location.href = gameURL;
            }
        },
        // Copy link
        {
            "divider": true,
            "icon": () => <FileCopyIcon fontSize="small"/>,
            "text": t(LABEL_COPY_LINK),
            "onClick": async () => {
                if (navigator.clipboard !== undefined) {//Chrome
                    await navigator.clipboard.writeText(gameURL);
                } else if(window.clipboardData) { // Internet Explorer
                    window.clipboardData.setData("text/plain", gameURL);
                }
                popupState.close();
            }
        },
        // Share on Twitter
        {
            "icon": () => <TwitterIcon fontSize="small"/>,
            "text": t(LABEL_TWITTER),
            "onClick": () => {
                window.open("https://twitter.com/intent/tweet?url=" + encodeURIComponent(gameURL), "_blank");
                popupState.close();
            }
        },
        // Share on Facebook
        {
            "icon": () => <FacebookIcon fontSize="small"/>,
            "text": t(LABEL_FACEBOOK),
            "onClick": () => {
                window.open("https://www.facebook.com/sharer/sharer.php?u=" + encodeURIComponent(gameURL), "_blank")
                popupState.close();
            }
        },
        // Share on Reddit
        {
            "icon": () => <RedditIcon fontSize="small"/>,
            "text": t(LABEL_REDDIT),
            "onClick": () => {
                window.open("http://www.reddit.com/submit?title=" + encodeURIComponent(gameTitle) + "&url=" + encodeURIComponent(gameURL) + "&title=","_blank")
                popupState.close();
            }
        }
    ];

    return (
        <Card className={classes.gameRoot}>

            <Tooltip title={t(label_for_game, { "gameName": game.title})} aria-label="WatchGame">
                <CardActionArea 
                    onClick={watchGame}
                    {...bindContextMenu(popupState)}
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

            <Menu {...bindMenu(popupState)}>
                {
                    dialog_options.map(option => 
                        <MenuItem
                            onClick={option.onClick}
                            divider={option.divider || false}
                        >
                            <ListItemIcon>
                                {option.icon()}
                            </ListItemIcon>
                            <ListItemText primary={option.text} />
                        </MenuItem>
                    )
                }
            </Menu>
            
        </Card>
    );
}

export default CardEntry;