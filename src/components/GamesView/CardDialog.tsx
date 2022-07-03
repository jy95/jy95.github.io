import { lazy } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

// For full screen Dialog 
import useMediaQuery from '@mui/material/useMediaQuery';

// For snackbars
import { useSnackbar } from 'notistack';

// For Dialog
const Dialog = lazy(() => import("@mui/material/Dialog"));
const DialogActions = lazy(() => import("@mui/material/DialogActions"));
const DialogContent = lazy(() => import("@mui/material/DialogContent"));
const DialogTitle = lazy(() => import("@mui/material/DialogTitle"));

// For a custom contextMenu (nice for UI)
const List = lazy(() => import("@mui/material/List"));
const ListItem = lazy(() => import("@mui/material/ListItem"));
const ListItemIcon = lazy(() => import("@mui/material/ListItemIcon"));
const ListItemText = lazy(() => import("@mui/material/ListItemText"));
const Button = lazy(() => import("@mui/material/Button"));

// Icons for contextMenu
const YouTubeIcon = lazy(() => import("@mui/icons-material/YouTube"));
const PlayArrowIcon = lazy(() => import("@mui/icons-material/PlayArrow"));
const FileCopyIcon = lazy(() => import("@mui/icons-material/FileCopy"));
const RedditIcon = lazy(() => import("@mui/icons-material/Reddit"));
const TwitterIcon = lazy(() => import("@mui/icons-material/Twitter"));
const FacebookIcon = lazy(() => import("@mui/icons-material/Facebook"));

// labels
const LABEL_WATCH_ON_YT = "gamesLibrary.actionsButton.watchOnYt";
const LABEL_WATCH_HERE = "gamesLibrary.actionsButton.watchHere";
const LABEL_COPY_LINK = "gamesLibrary.actionsButton.copyLink";
const LABEL_TWITTER = "gamesLibrary.actionsButton.shareOnTwitter";
const LABEL_FACEBOOK = "gamesLibrary.actionsButton.shareOnFacebook";
const LABEL_REDDIT = "gamesLibrary.actionsButton.shareOnReddit";
const LABEL_CLOSE_BUTTON = "gamesLibrary.actionsButton.closeContextMenu";
const LABEL_COPIED_LINK = "gamesLibrary.snackbarsMessages.copiedLink";

function CardDialog(props) {
    
    // hooks
    const { t } = useTranslation('common');
    const navigate = useNavigate();
    const fullScreen = useMediaQuery( (theme : any) => theme.breakpoints.down('md'));
    const { enqueueSnackbar } = useSnackbar();

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
                navigate(local_path);
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
                if (navigator.clipboard !== undefined) {
                    await navigator.clipboard.writeText(gameURL);
                    enqueueSnackbar(
                        t(LABEL_COPIED_LINK, { "gameName": gameTitle }),
                        {
                            "variant": "success",
                            "autoHideDuration": 2500
                        }
                    )
                    setContextMenuOpen(false);
                }
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
                <Button autoFocus onClick={() => {setContextMenuOpen(false)}}>{t(LABEL_CLOSE_BUTTON)}</Button>
            </DialogActions>
        </Dialog>
    );
}

export default CardDialog;