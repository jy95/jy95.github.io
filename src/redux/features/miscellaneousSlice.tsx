import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../Store"

export interface MiscellaneousState {
    /** @description Is Drawer open ? */
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

export const {
    drawerOpen
} = miscellaneousSlice.actions;
export default miscellaneousSlice.reducer;

// Selectors
export const selectOpenMenu = (state: RootState) => state.miscellaneous.drawerOpen;