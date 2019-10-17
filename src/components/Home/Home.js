import React from 'react';

import Header from "./Header"
import Menu from "./Menu";

export default function Home(props) {

    // Later in Redux way if simple
    const {classes} = props;

    const [open, setOpen] = React.useState(false);

    return (
        <React.Fragment>
            <Header open={open} setOpen={setOpen} classes={classes}/>
            <Menu open={open} setOpen={setOpen} classes={classes}/>
        </React.Fragment>
    )
}