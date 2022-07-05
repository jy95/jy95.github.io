import { lazy } from 'react'
import { useParams, useLocation } from 'react-router-dom'

const ReactPlayer = lazy(() => import("react-player/youtube"));

export default function Player(props) {
    const { id } = useParams();
    const location = useLocation();
    const type = (location.pathname.includes("/playlist/")) ? "PLAYLIST" : "VIDEO";
    const url = (type === "PLAYLIST" 
        ? "https://www.youtube.com/playlist?list=" 
        : "https://www.youtube.com/watch?v="
    ) + id;

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