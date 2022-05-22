import React from "react";
//import {useTranslation} from "react-i18next";

import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';

export default function CommonBackdrop() {

    // In case I need a text in the future
    //const { t } = useTranslation('common');
    // {t("common.loading")}

    return <Backdrop
        sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={true}
    >
        <CircularProgress color="inherit" />
    </Backdrop>
}