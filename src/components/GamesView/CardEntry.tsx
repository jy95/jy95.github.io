"use client";

import { Suspense, useState, lazy } from "react";
import { useRouter } from '@/i18n/routing';

import Card from "@mui/material/Card";
import CardMedia from "@mui/material/CardMedia";
import CardActionArea from '@mui/material/CardActionArea';

import Image from 'next/image'
import type { CardGame } from "@/redux/sharedDefintion";
const CardDialog = lazy(() => import("./CardDialog"));

function CardEntry(props : {
    game: CardGame;
    [key: string | number | symbol] : any;
}) {

    // hooks
    const router = useRouter();

    // props
    const {game} = props;

    // state of context menu
    const [contextMenuOpen,setContextMenuOpen] = useState(false);
    
    // consts
    const {
        title: gameTitle,
        url_type,
        id: gameId
    } = game;

    function watchGame() {
        router.push({
            pathname: url_type === "PLAYLIST" ? "/playlist/[id]" : "/video/[id]",
            params: { id: gameId }
        });
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
                    <div style={{
                        paddingTop: "100%",
                        position: "relative",
                    }}>
                        <Image 
                            fill
                            src={game.imagePath}
                            alt={gameTitle}
                            objectFit="fill"
                            sizes="(max-width: 600px) 45vw, (max-width: 960px) 30vw, 15vw"
                        />
                    </div>
                </CardMedia>

            </CardActionArea>
            <Suspense fallback={null}>
                <CardDialog game={game} contextMenuState={[contextMenuOpen,setContextMenuOpen]} />
            </Suspense>
        </Card>
    );
}

export default CardEntry;