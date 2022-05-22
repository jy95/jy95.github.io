import React from 'react'
import ReactPlayer from 'react-player/youtube'
import { useParams, useLocation } from 'react-router-dom'

export default function Player(props) {
    const { id } = useParams();
    const location = useLocation();
    const YOUTUBE_BASE_PLAYLIST_LINK = "https://www.youtube.com/playlist?list=";
    const YOUTUBE_BASE_VIDEO_LINK = "https://www.youtube.com/watch?v=";
    const type = (location.pathname.includes("/playlist/")) ? "PLAYLIST" : "VIDEO";
    const url = (type === "PLAYLIST" ? YOUTUBE_BASE_PLAYLIST_LINK : YOUTUBE_BASE_VIDEO_LINK) + id;

    return (
        <ReactPlayer
            controls={true}
            url={url}
            playing={true}
            width='100%'
            height='90vh'
        />
    )
}