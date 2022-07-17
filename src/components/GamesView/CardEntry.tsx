import { Suspense, useState, lazy } from "react";
import { useNavigate } from "react-router-dom";

import { styled } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

import Card from "@mui/material/Card";
import CardMedia from "@mui/material/CardMedia";
import CardActionArea from '@mui/material/CardActionArea';

import Image from '@jy95/material-ui-image';
import type { CardGame } from "../../services/sharedDefintion";
const CardDialog = lazy(() => import("./CardDialog"));

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
const SIZES_WITDH = {
    "small": "150w",
    "medium": "200w",
    "big": "250w"
}

function CardEntry(props : {
    game: CardGame;
    [key: string | number | symbol] : any;
}) {

    // hooks
    const navigate = useNavigate();

    // props
    const {game} = props;
    const is_mobile_device = useMediaQuery( (theme : any) => theme.breakpoints.down('md'));

    // state of context menu
    const [contextMenuOpen,setContextMenuOpen] = useState(false);
    
    // consts
    const {
        title: gameTitle,
        url: gameURL
    } = game;
    const local_path = game.url_type === "PLAYLIST" ? "/playlist/" + game.id : "/video/" + game.id;

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
        loading: 'lazy' | 'eager'
    } = {
        src: game.imagePath,
        alt: gameTitle,
        loading: "lazy"
    };

    // only 
    if (game?.hasResponsiveImages) {
        // TODO maybe in the future make that stuff more configurable
        imageProps.srcSet = Object
            .entries(SIZES_WITDH)
            .map( ([size, param]) =>`${game.imagesFolder}/cover@${size}.webp ${param}`)
            .join(",");
    }

    return (
        <StyledCard className={classes.gameRoot}>

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
                        disableSpinner={true}
                    />
                </CardMedia>

            </CardActionArea>
            <Suspense fallback={null}>
                <CardDialog game={game} contextMenuState={[contextMenuOpen,setContextMenuOpen]} />
            </Suspense>
        </StyledCard>
    );
}

export default CardEntry;