import React from 'react'
import ReactPlayer from 'react-player'
import { useParams } from 'react-router-dom'

export default function Player(props) {
    const { playlistId } = useParams();
    const YOUTUBE_BASE_PLAYLIST_LINK = "https://www.youtube.com/playlist?list=";

    // how to get them ?
    const heigt = "320px";
    const width = "640px";

    return (
        <ReactPlayer
            controls={true}
            url={YOUTUBE_BASE_PLAYLIST_LINK + playlistId}
            playing={true}
            width={width}
            height={heigt}
        />
    )
}