import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type themeColorType = 'light' | 'dark';

export interface themeColorState {
    // Current color for UI
    currentColor: themeColorType;
    mode: 'manual' | "auto";
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