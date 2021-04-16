import React from "react";
import {useTranslation} from "react-i18next";
import { useHistory } from "react-router-dom";

// For full screen Dialog 
import { useTheme } from '@material-ui/core/styles';
import useMediaQuery from '@material-ui/core/useMediaQuery';

// For Dialog
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';

// For a custom contextMenu (nice for UI)
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Button from '@material-ui/core/Button';

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
const LABEL_CLOSE_BUTTON = "gamesLibrary.actionsButton.closeContextMenu";

function CardDialog(props) {
    
    // hooks
    const { t } = useTranslation('common');
    const history = useHistory();
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

    // props
    const {game, contextMenuState: [contextMenuOpen,setContextMenuOpen]} = props;
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
                setContextMenuOpen(false);
                history.push(local_path);
            }
        },
        // watch on Youtube
        {
            "key": "watchOnYoutube",
            "icon": () => <YouTubeIcon fontSize="small"/>,
            "text": t(LABEL_WATCH_ON_YT, { "gameName": gameTitle}),
            "onClick": () => {
                setContextMenuOpen(false);
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
                setContextMenuOpen(false);
            }
        },
        // Share on Twitter
        {
            "key": "share-on-twitter",
            "icon": () => <TwitterIcon fontSize="small"/>,
            "text": t(LABEL_TWITTER),
            "onClick": () => {
                window.open("https://twitter.com/intent/tweet?url=" + encodeURIComponent(gameURL), "_blank");
                setContextMenuOpen(false);
            }
        },
        // Share on Facebook
        {
            "key": "share-on-facebook",
            "icon": () => <FacebookIcon fontSize="small"/>,
            "text": t(LABEL_FACEBOOK),
            "onClick": () => {
                window.open("https://www.facebook.com/sharer/sharer.php?u=" + encodeURIComponent(gameURL), "_blank")
                setContextMenuOpen(false);
            }
        },
        // Share on Reddit
        {
            "key": "share-on-reddit",
            "icon": () => <RedditIcon fontSize="small"/>,
            "text": t(LABEL_REDDIT),
            "onClick": () => {
                window.open("http://www.reddit.com/submit?title=" + encodeURIComponent(gameTitle) + "&url=" + encodeURIComponent(gameURL) + "&title=","_blank")
                setContextMenuOpen(false);
            }
        }
    ];

    return (
        <Dialog
            fullScreen={fullScreen}
            aria-labelledby="game-context-dialog-title"
            open={contextMenuOpen}
            onClose={() => setContextMenuOpen(false)}
        >
            <DialogTitle id="game-context-dialog-title">
                {gameTitle}    
            </DialogTitle>
            <DialogContent>
                <List>
                    {
                        dialog_options.map(option => 
                            <ListItem
                                onClick={option.onClick}
                                divider={option.divider || false}
                                key={option.key}
                            >
                                <ListItemIcon>
                                    {option.icon()}
                                </ListItemIcon>
                                <ListItemText primary={option.text} />
                            </ListItem>
                        )  
                    }
                </List>
            </DialogContent>
            <DialogActions>
                <Button autoFocus color="primary" onClick={() => {setContextMenuOpen(false)}}>{t(LABEL_CLOSE_BUTTON)}</Button>
            </DialogActions>
        </Dialog>
    )
}

export default CardDialog;