import React from 'react';
import clsx from 'clsx';

import {
    Drawer,
    AppBar,
    Toolbar,
    IconButton,
    Grid,
    Container,
    Divider,
    CssBaseline
} from '@material-ui/core';

import {makeStyles} from '@material-ui/core/styles';

import MenuIcon from '@material-ui/icons/Menu';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';

// the menues entries
import {ENTRIES} from "../MenuEntries/MenuEntries";

// A style sheet
const drawerWidth = 150;
const useStyles = makeStyles(theme => ({
    root: {
        display: 'flex',
    },
    appBar: {
        zIndex: theme.zIndex.drawer + 1,
        transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
    },
    appBarShift: {
        marginLeft: drawerWidth,
        width: `calc(100% - ${drawerWidth}px)`,
        transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
    },
    menuButton: {
        marginRight: 36,
    },
    hide: {
        display: 'none',
    },
    drawer: {
        width: drawerWidth,
        flexShrink: 0,
        whiteSpace: 'nowrap',
    },
    drawerOpen: {
        width: drawerWidth,
        transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
    },
    drawerClose: {
        transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
        overflowX: 'hidden',
        width: theme.spacing(7) + 1,
        [theme.breakpoints.up('sm')]: {
            width: theme.spacing(9) + 1,
        },
    },
    toolbar: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        padding: theme.spacing(0, 1),
        ...theme.mixins.toolbar,
    },
    content: {
        flexGrow: 1,
        padding: theme.spacing(3),
    },
}));

export default function HomePage(props) {

    const {container} = props;
    const classes = useStyles();
    const [open, setOpen] = React.useState(false);

    const handleDrawerOpen = () => {
        setOpen(true);
    };

    const handleDrawerClose = () => {
        setOpen(false);
    };

    return (
        <React.Fragment>
            <CssBaseline />
            <AppBar
                position="fixed"
                className={clsx(classes.appBar, {
                    [classes.appBarShift]: open,
                })}
            >
                <Toolbar>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        onClick={handleDrawerOpen}
                        edge="start"
                        className={clsx(classes.menuButton, {
                            [classes.hide]: open,
                        })}
                    >
                        <MenuIcon/>
                    </IconButton>
                </Toolbar>
            </AppBar>
            <nav aria-label="menus folders" className={classes.drawer}>
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
            </nav>
            <main className={classes.content}>
                <div className={classes.toolbar} />
                <Container>
                    <Grid container spacing={1}>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum magna lorem, rutrum ut mi
                        ut, convallis tincidunt orci. Sed tempor placerat tincidunt. Maecenas sodales nulla suscipit
                        mauris aliquet molestie id vel ex. Phasellus non rhoncus leo. Mauris ultricies efficitur diam ac
                        condimentum. Vestibulum dictum tempor rhoncus. Suspendisse pharetra, tellus sed vulputate
                        rhoncus, ligula tellus lobortis lectus, vel consequat mi magna vel mi. Suspendisse erat eros,
                        ullamcorper vel diam et, aliquam venenatis elit. Interdum et malesuada fames ac ante ipsum
                        primis in faucibus. Sed ullamcorper urna sed nisi pellentesque, eu tristique nisi dictum. Nunc
                        fringilla risus felis. Suspendisse lacinia nulla massa, eget dictum nibh scelerisque sit amet.
                        Nam nec libero a massa blandit egestas. Nulla facilisi. Nulla lacinia, arcu vitae posuere
                        tristique, metus nisl maximus massa, non rutrum mi ante ut ante. Etiam auctor, purus in sodales
                        efficitur, eros quam tincidunt enim, quis scelerisque leo massa non elit.

                        Donec nec nunc commodo, iaculis magna sit amet, auctor risus. Suspendisse maximus lectus augue,
                        ut fringilla arcu molestie sit amet. Ut pulvinar tellus tincidunt, commodo mauris feugiat,
                        aliquet quam. Morbi a suscipit metus. In purus est, convallis at est ut, finibus tempor ligula.
                        Donec id bibendum diam, eget posuere nisi. Proin aliquet consectetur nulla sed euismod. Ut
                        eleifend turpis ut tellus fringilla, vitae feugiat orci commodo. Maecenas sed viverra elit.
                        Aenean a sapien in dolor posuere efficitur a in dolor. Integer gravida sit amet ipsum at semper.
                        Quisque vel lacus eget ligula varius placerat. Cras vel est diam.

                        Aenean eget enim consectetur, lacinia risus et, pellentesque nisi. Sed at ultrices dolor, at
                        efficitur erat. Curabitur maximus massa nec rhoncus egestas. Phasellus pharetra lorem metus, vel
                        dapibus urna suscipit non. Morbi ultricies ex nec justo interdum semper. Etiam quis ornare enim,
                        eu maximus lectus. Interdum et malesuada fames ac ante ipsum primis in faucibus. Nulla id sapien
                        est. Integer malesuada eleifend sem, at pharetra ante cursus quis.

                    </Grid>
                </Container>
            </main>
        </React.Fragment>
    )

}