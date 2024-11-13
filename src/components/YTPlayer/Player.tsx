"use client";

import { lazy } from 'react'
const ReactPlayer = lazy(() => import("react-player/youtube"));

type Params = {type: "PLAYLIST" | "VIDEO", identifier : string}

export default function Player({type, identifier} : Params) {
    const url = (type === "PLAYLIST") 
        ? `https://www.youtube.com/playlist?list=${identifier}` 
        : `https://www.youtube.com/watch?v=${identifier}`;
    
    return (
        <ReactPlayer
            controls={true}
            url={url}
            playing={true}
            width='100%'
            height='80vh'
        />
    );
}
