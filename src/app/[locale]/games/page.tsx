"use client";

// Hooks
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import dynamic from 'next/dynamic'

// Client components
import GalleryMode from './_client/GalleryMode';
const GamesGalleryGrid = dynamic(() => import('./_client/GamesGalleryGrid'), { ssr: false })
const GamesGalleryList = dynamic(() => import('./_client/GamesGalleryList'), { ssr: false })

type ViewType = "GRID" | "LIST";

// The gallery component
function GamesView() {

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

// The gallery component
export default function GamesPage() {
    return (
        // You could have a loading skeleton as the `fallback` too
        <Suspense>
          <GamesView />
        </Suspense>
    )
}