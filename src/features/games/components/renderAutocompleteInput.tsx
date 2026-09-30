"use client";

import TextField from '@mui/material/TextField';
import type { AutocompleteRenderInputParams } from '@mui/material/Autocomplete';

/**
 * Shared `renderInput` factory for MUI Autocomplete instances (MUI v9).
 */
export function renderAutocompleteInput(label: string) {
  return function renderInput(params: AutocompleteRenderInputParams) {
    return <TextField {...params} label={label} />;
  };
}
