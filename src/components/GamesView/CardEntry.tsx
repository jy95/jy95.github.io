import { Suspense, useState, lazy } from "react";
import { useLocale } from "@/hooks/useLocale";
import { useRouter } from 'next/navigation';

import useMediaQuery from '@mui/material/useMediaQuery';

import Card from "@mui/material/Card";
import CardMedia from "@mui/material/CardMedia";
import CardActionArea from '@mui/material/CardActionArea';

//import Image from '@jy95/material-ui-image';
import Image from 'next/image'
import type { CardGame } from "@/redux/services/sharedDefintion";
const CardDialog = lazy(() => import("./CardDialog"));

function CardEntry(props : {
    game: CardGame;
    [key: string | number | symbol] : any;
}) {

    // hooks
    const router = useRouter();
    const locale = useLocale();

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
            router.push(`${locale}/${local_path}`);
        }
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
                    sx={{ zIndex: 1, height: "inherit" }}
                    title={gameTitle}
                >
                    <Image 
                        src={game.imagePath}
                        alt={gameTitle}
                        fill={true}
                        layout="fill"
                        objectFit="cover"
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