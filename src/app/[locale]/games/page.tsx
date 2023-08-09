"use client";

// Hooks
import { useSearchParams } from 'next/navigation'
import dynamic from 'next/dynamic'

// Client components
import GalleryMode from './_client/GalleryMode';
const GamesGalleryGrid = dynamic(() => import('./_client/GamesGalleryGrid'))
const GamesGalleryList = dynamic(() => import('./_client/GamesGalleryList'))

type ViewType = "GRID" | "LIST";

// The gallery component
export default function GamesPage() {

    const searchParams = useSearchParams()
    const viewMode : ViewType = searchParams.get("mode") === "LIST" ? "LIST" : "GRID";

    return (
        <>
            <GalleryMode />
            <div role="tabpanel" aria-label={"games"} style={{paddingTop: "5px"}}>
                { (viewMode === "GRID") ? <GamesGalleryGrid /> : <GamesGalleryList /> }
            </div>
        </>
    )
}