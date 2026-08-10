"use client";

import TextField from '@mui/material/TextField';
import type { AutocompleteRenderInputParams } from '@mui/material/Autocomplete';

/**
 * Shared `renderInput` factory for MUI Autocomplete instances in this app.
 *
 * MUI's `Autocomplete<T, Multiple, DisableClearable, FreeSolo>` generic
 * signature doesn't always let TypeScript recognize
 * `AutocompleteRenderInputParams` as directly spreadable onto
 * `TextFieldProps` for every generic instantiation. Centralizing the
 * workaround here means the suppression is written, reviewed, and
 * documented exactly once instead of copy-pasted at every Autocomplete
 * call site — and using `@ts-expect-error` (not `@ts-ignore`) means this
 * line fails the build the moment MUI's types no longer need it, instead
 * of silently rotting forever.
 */
export function renderAutocompleteInput(label: string) {
    return function renderInput(params: AutocompleteRenderInputParams) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error -- see JSDoc above.
        return <TextField {...params} label={label} />;
    };
}