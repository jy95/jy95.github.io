import { Suspense, useState, lazy } from "react";
import { useNavigate } from "react-router-dom";

import useMediaQuery from '@mui/material/useMediaQuery';

import Card from "@mui/material/Card";
import CardMedia from "@mui/material/CardMedia";
import CardActionArea from '@mui/material/CardActionArea';

import Image from '@jy95/material-ui-image';
import type { CardGame } from "../../services/sharedDefintion";
const CardDialog = lazy(() => import("./CardDialog"));

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
        <Card sx={{ position: "relative" }}>

            <CardActionArea 
                onClick={watchGame}
                onContextMenu={(event) => {
                    event.preventDefault();
                    setContextMenuOpen(true);
                }}
                sx={{ height: "inherit", zIndex: 1 }}
            >
                <CardMedia
                    sx={{ zIndex: 1 }}
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
        </Card>
    );
}

export default CardEntry;