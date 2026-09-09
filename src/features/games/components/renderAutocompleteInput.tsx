"use client";

import TextField from '@mui/material/TextField';
import type { AutocompleteProps } from '@mui/material/Autocomplete';

// Extract the exact renderInput type directly from MUI v9's AutocompleteProps
type AutocompleteRenderInput = AutocompleteProps<
  any,
  boolean,
  boolean,
  boolean
>['renderInput'];

/**
 * Shared `renderInput` factory for MUI Autocomplete instances (MUI v9).
 */
export function renderAutocompleteInput(label: string): AutocompleteRenderInput {
  return function renderInput(params) {
    return <TextField {...params} label={label} />;
  };
}