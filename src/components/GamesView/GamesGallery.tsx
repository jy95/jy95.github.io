import React from "react";

import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import TabContext from '@mui/lab/TabContext';
import TabPanel from '@mui/lab/TabPanel';

import AppsIcon from '@mui/icons-material/Apps';
import ListIcon from '@mui/icons-material/List';
import {useTranslation} from "react-i18next";

// Custom
// @ts-ignore
import GamesGalleryGrid from "./GamesGalleryGrid.tsx";
// @ts-ignore
import GamesGalleryList from "./GamesGalleryList.tsx";

// The gallery component
function GamesGallery(props) {

    const [value, setValue] = React.useState('GRID');
    const { t } = useTranslation('common');

    const handleChange = (_event, newValue) => {
      setValue(newValue);
    };

    return (
        <TabContext value={value}>
            <Tabs value={value} onChange={handleChange} aria-label="icon label tabs" centered>
                <Tab icon={<AppsIcon />} label={t("gamesLibrary.tabs.grid")} value="GRID" />
                <Tab icon={<ListIcon />} label={t("gamesLibrary.tabs.list")} value="LIST" />
            </Tabs>
            <TabPanel value="GRID">
                <GamesGalleryGrid />
            </TabPanel>
            <TabPanel value="LIST">
                <GamesGalleryList />
            </TabPanel>
        </TabContext>
    )
}

export default GamesGallery;