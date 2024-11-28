import { useParams } from 'next/navigation'
import YTPlayer from "@/components/YTPlayer/Player";
import RandomButton from '@/components/GamesView/RandomButton';

export default function PlaylistPage() {

    const { id } = useParams();
    const identifier = id as string;

    return (
        <>
            <YTPlayer type="VIDEO" identifier={identifier}/>
            <RandomButton />
        </>
    )
}