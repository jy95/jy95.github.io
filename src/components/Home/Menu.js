
// the menues entries
import {ENTRIES} from "./MenuEntries";
import {Divider, Drawer, IconButton} from "@material-ui/core";
import clsx from "clsx";
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import React from "react";

export default function Menu(props) {

    const {container, setOpen, open, classes} = props;

    const handleDrawerClose = () => {
        setOpen(false);
    };

    return (
        <Drawer
            container={container}
            variant={"permanent"}
            className={clsx(classes.drawer, {
                [classes.drawerOpen]: open,
                [classes.drawerClose]: !open,
            })}
            classes={{
                paper: clsx({
                    [classes.drawerOpen]: open,
                    [classes.drawerClose]: !open,
                }),
            }}
            open={open}
        >
            <div className={classes.toolbar}>
                <IconButton onClick={handleDrawerClose}>
                    <ChevronLeftIcon />
                </IconButton>
            </div>
            <Divider />
            {ENTRIES}
        </Drawer>
    )
}