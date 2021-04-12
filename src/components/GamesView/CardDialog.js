import React from "react";
import {useTranslation} from "react-i18next";
import { useHistory } from "react-router-dom";
import { bindMenu } from 'material-ui-popup-state/hooks'

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

// labels
const LABEL_WATCH_ON_YT = "gamesLibrary.actionsButton.watchOnYt";
const LABEL_WATCH_HERE = "gamesLibrary.actionsButton.watchHere";
const LABEL_COPY_LINK = "gamesLibrary.actionsButton.copyLink";
const LABEL_TWITTER = "gamesLibrary.actionsButton.shareOnTwitter";
const LABEL_FACEBOOK = "gamesLibrary.actionsButton.shareOnFacebook";
const LABEL_REDDIT = "gamesLibrary.actionsButton.shareOnReddit";

function CardDialog(props) {
    
    // hooks
    const { t } = useTranslation('common');
    const history = useHistory();

    // props
    const {game, popupState} = props;
    const {
        title: gameTitle,
        url: gameURL
    } = game;
    const local_path = game.url_type === "PLAYLIST" ? "/playlist/" + game.playlistId : "/video/" + game.videoId;

    // dialog options
    const dialog_options = [
        // Watch here
        {
            "key": "watchHere",
            "icon": () => <PlayArrowIcon fontSize="small"/>,
            "text": t(LABEL_WATCH_HERE, { "gameName": gameTitle}),
            "onClick": () => {
                popupState.close();
                history.push(local_path);
            }
        },
        // watch on Youtube
        {
            "key": "watchOnYoutube",
            "icon": () => <YouTubeIcon fontSize="small"/>,
            "text": t(LABEL_WATCH_ON_YT, { "gameName": gameTitle}),
            "onClick": () => {
                popupState.close();
                window.location.href = gameURL;
            }
        },
        // Copy link
        {
            "key": "copyLink",
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
            "key": "share-on-twitter",
            "icon": () => <TwitterIcon fontSize="small"/>,
            "text": t(LABEL_TWITTER),
            "onClick": () => {
                window.open("https://twitter.com/intent/tweet?url=" + encodeURIComponent(gameURL), "_blank");
                popupState.close();
            }
        },
        // Share on Facebook
        {
            "key": "share-on-facebook",
            "icon": () => <FacebookIcon fontSize="small"/>,
            "text": t(LABEL_FACEBOOK),
            "onClick": () => {
                window.open("https://www.facebook.com/sharer/sharer.php?u=" + encodeURIComponent(gameURL), "_blank")
                popupState.close();
            }
        },
        // Share on Reddit
        {
            "key": "share-on-reddit",
            "icon": () => <RedditIcon fontSize="small"/>,
            "text": t(LABEL_REDDIT),
            "onClick": () => {
                window.open("http://www.reddit.com/submit?title=" + encodeURIComponent(gameTitle) + "&url=" + encodeURIComponent(gameURL) + "&title=","_blank")
                popupState.close();
            }
        }
    ];

    return (
        <Menu {...bindMenu(popupState)}>
            {
                dialog_options.map(option => 
                    <MenuItem
                        onClick={option.onClick}
                        divider={option.divider || false}
                        key={option.key}
                    >
                        <ListItemIcon>
                            {option.icon()}
                        </ListItemIcon>
                        <ListItemText primary={option.text} />
                    </MenuItem>
                )
            }
        </Menu>
    )
}

export default CardDialog;