import React from 'react'
import ReactPlayer from 'react-player/youtube'
import { useParams } from 'react-router-dom'

export default function Player(props) {
    const { playlistId } = useParams();
    const YOUTUBE_BASE_PLAYLIST_LINK = "https://www.youtube.com/playlist?list=";

    return (
        <div className='player-wrapper'>
            <ReactPlayer
                controls={true}
                url={YOUTUBE_BASE_PLAYLIST_LINK + playlistId}
                playing={true}
                width='100%'
                height='80vh'
                className='react-player'
            />
        </div>
    )
}