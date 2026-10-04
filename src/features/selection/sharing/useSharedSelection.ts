'use client';

import { useState, useEffect } from 'react';
import { decodeSelection } from "./sharing";
import type { SelectionDocument } from '@/domain/selection/types';

type SharedState =
  | { status: 'none' | 'loading' | 'error' }
  | { status: 'ready'; document: SelectionDocument };

const NONE: SharedState = { status: 'none' };
const LOADING: SharedState = { status: 'loading' };
const ERROR: SharedState = { status: 'error' };

/** Decodes `?entries=`. A shared selection never touches personal storage. */
export function useSharedSelection(param: string | null): SharedState {
  const [state, setState] = useState<{ param: string; data: SharedState } | null>(null);

  useEffect(() => {
    if (!param) return;
    let active = true;

    decodeSelection(param).then(doc => {
      if (!active) return;
      setState({
        param,
        data: doc ? { status: 'ready', document: doc } : ERROR,
      });
    });
    return () => { active = false; };
  }, [param]);

  if (!param) return NONE;
  return state?.param === param ? state.data : LOADING;
}