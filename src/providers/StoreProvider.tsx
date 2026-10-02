'use client'
import { useEffect, useRef } from 'react'
import { connectSelectionStorage } from '@/features/selection/selectionPersistence'
import { setSelectionCategories } from '@/features/selection/selectionSlice'
import type { SelectionCategories } from '@/features/selection/schema'
import { Provider } from 'react-redux'
import { makeStore } from '../redux/Store'

import type { ReactNode } from "react";
import type { AppStore } from '../redux/Store'

export default function StoreProvider({
  children,
  categories = {},
}: {
  children: ReactNode
  categories?: SelectionCategories
}) {
  const storeRef = useRef<AppStore>(null)
  if (!storeRef.current) {
    // Create the store instance the first time this renders
    storeRef.current = makeStore()
    storeRef.current.dispatch(setSelectionCategories(categories))
  }

  // Keep the server snapshot stable while nested Suspense boundaries hydrate.
  const serverState = useRef(storeRef.current.getState())

  useEffect(() => {
    const store = storeRef.current;
    if (!store) return;
    return connectSelectionStorage(store);
  }, [])

  return <Provider store={storeRef.current} serverState={serverState.current}>{children}</Provider>
}
