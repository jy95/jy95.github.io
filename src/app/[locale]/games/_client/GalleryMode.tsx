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
import ExtensionIcon from '@mui/icons-material/Extension';

// Views
const MODES = ["GRID", "LIST", "DLC"] as const;
type ViewType = typeof MODES[number];

function ModeSelector() {

    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const t = useTranslations("gamesLibrary.tabs");
    const userMode = searchParams.get("mode");
    const viewMode : ViewType = MODES.includes(userMode as any) ? userMode as ViewType : "GRID";

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

    return (
        <div style={{display: "flex", justifyContent: "center"}}>
            <Tabs value={viewMode} onChange={handleChange} aria-label="icon label tabs" centered>
                <Tab role="tab" id="tab-GRID" aria-selected={viewMode === "GRID"} icon={<AppsIcon />} label={t("grid")} value="GRID" />
                <Tab role="tab" id="tab-LIST" aria-selected={viewMode === "LIST"} icon={<ListIcon />} label={t("list")} value="LIST" />
                <Tab role="tab" id="tab-LIST" aria-selected={viewMode === "LIST"} icon={<ExtensionIcon />} label={t("dlc")} value="DLC" />
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