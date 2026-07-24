"use client";

import YouTubeVideoElement from 'youtube-video-element/react';

type Params = {type: "PLAYLIST" | "VIDEO", identifier : string}

export default function Player({type, identifier} : Params) {
    const url = (type === "PLAYLIST") 
        ? `https://www.youtube.com/playlist?list=${identifier}` 
        : `https://www.youtube.com/watch?v=${identifier}`;
    
    return (
        <YouTubeVideoElement 
            controls={true}
            src={url} 
            style={{
                display: "block",
                width: "100%",
                height: "75vh"
            }}
        />
    );
}
