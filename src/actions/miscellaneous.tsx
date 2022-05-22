export const SET_DRAWER_OPEN = "SET_DRAWER_OPEN";

export const setDrawerOpen = (drawerOpen) => {
    return (dispatch, _) => {
        dispatch(setDrawer(drawerOpen));
    }
};

const setDrawer = (drawerOpen) => ({
    type: SET_DRAWER_OPEN,
    drawerOpen
});