"use client";

// Parameters explained on https://developers.google.com/youtube/player_parameters#Parameters
import YouTubeVideoElement from 'youtube-video-element/react';
import { buildPlaylistUrl, buildVideoUrl } from '@/domain/games/youtube';
import type { YTUrlType } from '@/domain/games';

type Params = {type: YTUrlType, identifier : string}

export default function Player({type, identifier} : Params) {
    const url = (type === "PLAYLIST") 
        ? buildPlaylistUrl(identifier)
        : buildVideoUrl(identifier);
    
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
