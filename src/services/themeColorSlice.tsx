import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from "@reduxjs/toolkit";

type themeColorType = 'light' | 'dark';

export interface themeColorState {
    /** @description Current color for UI */
    currentColor: themeColorType;
    /** @description How color change was detected ? */
    mode: 'manual' | "auto";
    /** @description Browser preferred color */
    systemColor: themeColorType
}

const initialState : themeColorState = {
    currentColor: 'light',
    mode: 'manual',
    systemColor: 'light'
}

const themeColorSlice = createSlice({
    name: 'themeColor',
    initialState,
    reducers: {
        themeColor(state : themeColorState, action: PayloadAction<{
            color: themeColorType,
            mode: 'manual' | "auto"
        }>) {
            state.currentColor = action.payload.color;
            state.mode = action.payload.mode;
            state.systemColor = (action.payload.mode === "auto") ? action.payload.color : state.systemColor;
        }
    }
});

// Action creators are generated for each case reducer function
export const {
    themeColor
} = themeColorSlice.actions;
export default themeColorSlice.reducer;