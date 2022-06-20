import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface MiscellaneousState {
    // Is Drawer open ?
    drawerOpen: boolean
}

const initialState : MiscellaneousState = {
    drawerOpen: false
}

const miscellaneousSlice = createSlice({
    name: 'miscellaneous',
    initialState,
    reducers: {
        drawerOpen(state : MiscellaneousState, action: PayloadAction<boolean>) {
            state.drawerOpen = action.payload;
        }
    }
});

// Action creators are generated for each case reducer function
export const {
    drawerOpen
} = miscellaneousSlice.actions;
export default miscellaneousSlice.reducer;