import React, {Suspense} from "react";
import {useTranslation} from "react-i18next";
import { useNavigate } from "react-router-dom";

// To check what should happen when clicking on a game
import { useTheme, styled } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

import Card from "@mui/material/Card";
import CardMedia from "@mui/material/CardMedia";
import CardActionArea from '@mui/material/CardActionArea';
import Skeleton from '@mui/material/Skeleton';

import Tooltip from '@mui/material/Tooltip';
import Image from '@jy95/material-ui-image';
// @ts-ignore
const CardDialog = React.lazy(() => import("./CardDialog.tsx"));

const PREFIX = 'CardEntry';

const classes = {
    gameRoot: `${PREFIX}-gameRoot`,
    gameCover: `${PREFIX}-gameCover`,
    MuiCardActionArea: `${PREFIX}-MuiCardActionArea`
};

const StyledCard = styled(Card)((
    {
        theme
    }
) => ({
    [`&.${classes.gameRoot}`]: {
        position: "relative",
        //height: "100%"
    },
    [`& .${classes.gameCover}`]: {
        zIndex: 1,
        //height: "inherit"
    },
    [`& .${classes.MuiCardActionArea}`]: {
        height: "inherit",
        zIndex: 1
    }
}));

// for responsive pictures
const PICTURE_SIZES = ["small", "medium", "big"];
const SIZES_WITDH = {
    "small": "150w",
    "medium": "200w",
    "big": "250w"
}
const SIZES_CONDITIONS = {
    "small": `(min-width: 0px) ${SIZES_WITDH["small"]}`,
    "medium": `(min-width: 900px) ${SIZES_WITDH["medium"]}`,
    "big": `(min-width: 1200px) ${SIZES_WITDH["big"]}`
};

function CardEntry(props) {

    // hooks
    const theme = useTheme();
    const { t } = useTranslation('common');
    const navigate = useNavigate();

    // props
    const {game} = props;

    const is_mobile_device = useMediaQuery(theme.breakpoints.down('md'));

    // state of context menu
    const [contextMenuOpen,setContextMenuOpen] = React.useState(false);
    
    // labels
    const LABEL_WATCH_ON_YT = "gamesLibrary.actionsButton.watchOnYt";
    const LABEL_WATCH_HERE = "gamesLibrary.actionsButton.watchHere";

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
            navigate(local_path);
        }
    }

    // image properties
    let imageProps : {
        src: string,
        alt: string,
        srcSet?: string,
        sizes?: string
    } = {
        src: game.imagePath,
        alt: gameTitle
    };

    // only 
    if (game?.hasResponsiveImages) {
        // TODO maybe in the future make that stuff more configurable
        imageProps.srcSet= PICTURE_SIZES
            .map(size=>`${game.imagesFolder}/cover@${size}.webp ${SIZES_WITDH[size]}`)
            .join(",");
        imageProps.sizes = PICTURE_SIZES.map(size => SIZES_CONDITIONS[size]).join(",");
    }

    return (
        <StyledCard className={classes.gameRoot}>

            <Tooltip title={t(label_for_game, { "gameName": gameTitle})} aria-label="WatchGame">
                <CardActionArea 
                    onClick={watchGame}
                    onContextMenu={(event) => {
                        event.preventDefault();
                        setContextMenuOpen(true);
                    }}
                    classes={{root: classes.MuiCardActionArea}}
                >
                    <CardMedia
                        className={classes.gameCover}
                        title={gameTitle}
                    >
                        <Image 
                            {...imageProps}
                            //disableSpinner={true} 
                            loading={<Skeleton variant="rectangular" />}
                        />
                    </CardMedia>

                </CardActionArea>
            </Tooltip>
            <Suspense fallback={null}>
                <CardDialog game={game} contextMenuState={[contextMenuOpen,setContextMenuOpen]} />
            </Suspense>
        </StyledCard>
    );
}

export default CardEntry;