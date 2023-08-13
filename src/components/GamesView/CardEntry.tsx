"use client";

import { Suspense, useState, lazy } from "react";
import { useRouter } from 'next/navigation';

import useMediaQuery from '@mui/material/useMediaQuery';

import Card from "@mui/material/Card";
import CardMedia from "@mui/material/CardMedia";
import CardActionArea from '@mui/material/CardActionArea';

import Image from 'next/image'
import type { CardGame } from "@/redux/sharedDefintion";
const CardDialog = lazy(() => import("./CardDialog"));

const shimmer = (w: number, h: number) => `
<svg width="${w}" height="${h}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <linearGradient id="g">
      <stop stop-color="#333" offset="20%" />
      <stop stop-color="#222" offset="50%" />
      <stop stop-color="#333" offset="70%" />
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="#333" />
  <rect id="r" width="${w}" height="${h}" fill="url(#g)" />
  <animate xlink:href="#r" attributeName="x" from="-${w}" to="${w}" dur="1s" repeatCount="indefinite"  />
</svg>`

const toBase64 = (str: string) =>
  typeof window === 'undefined'
    ? Buffer.from(str).toString('base64')
    : window.btoa(str)

function CardEntry(props : {
    game: CardGame;
    [key: string | number | symbol] : any;
}) {

    // hooks
    const router = useRouter();

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
            router.push(`${local_path}`);
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
                    <div style={{
                        paddingTop: "100%",
                        position: "relative",
                    }}>
                        <Image 
                            fill
                            src={game.imagePath}
                            sizes={game.sizes ? game.sizes : "100vw"}
                            // only "placeholder" = "data:image/*" in the future
                            //placeholder="blur"
                            //blurDataURL={`data:image/svg+xml;base64,${toBase64(shimmer(169, 169))}`}
                            alt={gameTitle}
                            style={{
                                objectFit: "fill"
                            }}
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