"use client";

// Hooks
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import dynamic from 'next/dynamic'

// Client components
import GalleryMode from './_client/GalleryMode';
const GamesGalleryGrid = dynamic(() => import('./_client/GamesGalleryGrid'), { ssr: false })
const GamesGalleryList = dynamic(() => import('./_client/GamesGalleryList'), { ssr: false })
const GamesGalleryDlc = dynamic(() => import('./_client/GamesGalleryDLC'), { ssr: false })

const MODES = ["GRID", "LIST", "DLC"] as const;
type ViewType = typeof MODES[number];

// The gallery component
function GamesView() {

    const searchParams = useSearchParams()
    const userMode = searchParams.get("mode");
    const viewMode : ViewType = MODES.includes(userMode as any) ? userMode as ViewType : "GRID";

    return (
        <>
            <GalleryMode />
            <div role="tabpanel" aria-label={"games"} style={{paddingTop: "5px"}}>
                {(() => {
                        switch (viewMode) {
                            case "GRID":
                                return <GamesGalleryGrid />;
                            case "LIST":
                                return <GamesGalleryList />;
                            case "DLC":
                                return <GamesGalleryDlc />;
                        }
                })()}
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