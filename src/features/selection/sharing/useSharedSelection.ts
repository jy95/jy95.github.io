'use client';

// Hooks
import { useState, useEffect } from 'react';

// Others
import { decodeSelection } from "./sharing";

// Types
import type { SelectionDocument } from '@/domain/selection/types';

type SharedState =
  | { status: 'none' | 'loading' | 'error' }
  | { status: 'ready'; document: SelectionDocument };

const NONE: SharedState = { status: 'none' };
const LOADING: SharedState = { status: 'loading' };
const ERROR: SharedState = { status: 'error' };

/** Decodes `?entries=`. A shared selection never touches personal storage. */
function useSharedSelection(param: string | null): SharedState {
  const [result, setResult] = useState<{ param: string; state: SharedState } | null>(null);

  useEffect(() => {
    if (param === null) return;
    let active = true;

    void decodeSelection(param).then(doc => {
      if (active) {
        setResult({ param, state: doc ? { status: 'ready', document: doc } : ERROR });
      }
    });

    return () => { active = false; };
  }, [param]);

  if (param === null) return NONE;
  return result?.param === param ? result.state : LOADING;
}