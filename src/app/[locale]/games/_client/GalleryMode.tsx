"use client";

// Hooks
import { useSearchParams } from 'next/navigation'
import { useCallback, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { usePathname } from "next/navigation"
import {useTranslations} from 'next-intl';

// Mui components
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';

// Icons
import AppsIcon from '@mui/icons-material/Apps';
import ListIcon from '@mui/icons-material/List';

// Views
type ViewType = "GRID" | "LIST";

function ModeSelector() {

    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const t = useTranslations("gamesLibrary.tabs");
    const viewMode : ViewType = searchParams.get("mode") === "LIST" ? "LIST" : "GRID";

    // Get a new searchParams string by merging the current
    // searchParams with a provided key/value pair
    // https://nextjs.org/docs/app/api-reference/functions/use-search-params
    const createQueryString = useCallback(
        (name: string, value: string) => {
            const params = new URLSearchParams(searchParams as any)
            params.set(name, value)
            return params.toString()
        },
        [searchParams]
    )

    const handleChange = (_event : any, newValue : ViewType) => {
        router.push(pathname + '?' + createQueryString('mode', newValue))
    };

    const labelGenerator = (value : 'GRID' | 'LIST') => value === "GRID" ? t("grid") : t("list");

    return (
        <div style={{display: "flex", justifyContent: "center"}}>
            <Tabs value={viewMode} onChange={handleChange} aria-label="icon label tabs" centered>
                <Tab role="tab" id="tab-GRID" aria-selected={viewMode === "GRID"} icon={<AppsIcon />} label={labelGenerator("GRID")} value="GRID" />
                <Tab role="tab" id="tab-LIST" aria-selected={viewMode === "LIST"} icon={<ListIcon />} label={labelGenerator("LIST")} value="LIST" />
            </Tabs>
        </div>
    )
}

export default function GalleryMode() {
    return (
        // You could have a loading skeleton as the `fallback` too
        <Suspense>
            <ModeSelector />
        </Suspense>
    )
}