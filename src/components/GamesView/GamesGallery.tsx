import React, {Suspense} from "react";

import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import LinearProgress from '@mui/material/LinearProgress';

import AppsIcon from '@mui/icons-material/Apps';
import ListIcon from '@mui/icons-material/List';
import {useTranslation} from "react-i18next";

// Custom
// @ts-ignore
const GamesGalleryGrid = React.lazy(() => import("./GamesGalleryGrid.tsx"));
// @ts-ignore
const GamesGalleryList = React.lazy(() => import("./GamesGalleryList.tsx"));

// The gallery component
function GamesGallery(props) {

    const [value, setValue] = React.useState('GRID');
    const [isPending, startTransition] = React.useTransition();
    const { t } = useTranslation('common');

    const handleChange = (_event, newValue) => {
        startTransition(() => {
            setValue(newValue);
        });
    };

    return (
        <>
            <div aria-label="icon label tabs" role="tablist" style={{display: "flex", justifyContent: "center"}}>
                <Tabs value={value} onChange={handleChange} aria-label="icon label tabs" centered>
                    <Tab icon={<AppsIcon />} label={t("gamesLibrary.tabs.grid")} value="GRID" />
                    <Tab icon={<ListIcon />} label={t("gamesLibrary.tabs.list")} value="LIST" />
                </Tabs>            
            </div>
            <div role="tabpanel" aria-label={t("gamesLibrary.tabs." + value.toLowerCase())} style={{paddingTop: "5px"}}>
                {isPending && <LinearProgress />}
                <Suspense fallback={null}>
                    { (value === "GRID") ? <GamesGalleryGrid /> : <GamesGalleryList /> }
                </Suspense>
            </div>
        </>
    )
}

export default GamesGallery;