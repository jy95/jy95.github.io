import { Suspense, useState, useTransition, lazy } from "react";

import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import LinearProgress from '@mui/material/LinearProgress';

import AppsIcon from '@mui/icons-material/Apps';
import ListIcon from '@mui/icons-material/List';
import { useTranslation } from "react-i18next";

// Custom
const GamesGalleryGrid = lazy(() => import("./GamesGalleryGrid"));
const GamesGalleryList = lazy(() => import("./GamesGalleryList"));

// The gallery component
function GamesGallery(_props : {[key: string | number | symbol] : any}) {

    const [value, setValue] = useState('GRID');
    const [isPending, startTransition] = useTransition();
    const { t } = useTranslation('common');

    const handleChange = (_event : any, newValue : string) => {
        startTransition(() => {
            setValue(newValue);
        });
    };

    return (
        <>
            <div aria-label="icon label tabs" role="tablist" aria-owns="tab-GRID tab-LIST" style={{display: "flex", justifyContent: "center"}}>
                <Tabs value={value} onChange={handleChange} aria-label="icon label tabs" centered>
                    <Tab role="tab" id="tab-GRID" aria-selected={value === "GRID"} icon={<AppsIcon />} label={t("gamesLibrary.tabs.grid")} value="GRID" />
                    <Tab role="tab" id="tab-LIST" aria-selected={value === "LIST"} icon={<ListIcon />} label={t("gamesLibrary.tabs.list")} value="LIST" />
                </Tabs>            
            </div>
            <div role="tabpanel" aria-label={t(`gamesLibrary.tabs.${value.toLowerCase() as 'grid' | 'list'}` as const)} style={{paddingTop: "5px"}}>
                {isPending && <LinearProgress />}
                <Suspense fallback={null}>
                    { (value === "GRID") ? <GamesGalleryGrid /> : <GamesGalleryList /> }
                </Suspense>
            </div>
        </>
    )
}

export default GamesGallery;