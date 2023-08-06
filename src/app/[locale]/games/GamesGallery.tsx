"use client";

// Hooks
import { Suspense, useState, useTransition, lazy } from "react";

// Mui components
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import LinearProgress from '@mui/material/LinearProgress';

// Icons
import AppsIcon from '@mui/icons-material/Apps';
import ListIcon from '@mui/icons-material/List';

// Custom
const GamesGalleryGrid = lazy(() => import("@/components/GamesView/GamesGalleryGrid"));
const GamesGalleryList = lazy(() => import("@/components/GamesView/GamesGalleryList"));

type Props = {
    // label for Grid view
    gridView: string,
    // label for List view
    listView: string
}

// Views
type ViewType = "GRID" | "LIST";

// The gallery component
export default function GamesGallery({gridView, listView} : Props) {

    const [value, setValue] = useState<ViewType>('GRID');
    const [isPending, startTransition] = useTransition();

    const handleChange = (_event : any, newValue : ViewType) => {
        startTransition(() => {
            setValue(newValue);
        });
    };

    const labelGenerator = (value : 'GRID' | 'LIST') => value === "GRID" ? gridView : listView;

    return (
        <>
            <div aria-label="icon label tabs" role="tablist" aria-owns="tab-GRID tab-LIST" style={{display: "flex", justifyContent: "center"}}>
                <Tabs value={value} onChange={handleChange} aria-label="icon label tabs" centered>
                    <Tab role="tab" id="tab-GRID" aria-selected={value === "GRID"} icon={<AppsIcon />} label={labelGenerator("GRID")} value="GRID" />
                    <Tab role="tab" id="tab-LIST" aria-selected={value === "LIST"} icon={<ListIcon />} label={labelGenerator("LIST")} value="LIST" />
                </Tabs>            
            </div>
            <div role="tabpanel" aria-label={labelGenerator(value)} style={{paddingTop: "5px"}}>
                {isPending && <LinearProgress />}
                <Suspense fallback={null}>
                    { (value === "GRID") ? <GamesGalleryGrid /> : <GamesGalleryList /> }
                </Suspense>
            </div>
        </>
    )

}