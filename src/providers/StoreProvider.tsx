'use client'
import { useEffect, useRef } from 'react'
import { connectSelectionStorage } from '@/features/selection/selectionPersistence'
import { Provider } from 'react-redux'
import { makeStore } from '../redux/Store'

import type { ReactNode } from "react";
import type { AppStore } from '../redux/Store'

export default function StoreProvider({
  children,
}: {
  children: ReactNode
}) {
  const storeRef = useRef<AppStore>(null)
  if (!storeRef.current) {
    // Create the store instance the first time this renders
    storeRef.current = makeStore()
  }

  // Keep the server snapshot stable while nested Suspense boundaries hydrate.
  const serverState = useRef(storeRef.current.getState())

  useEffect(() => connectSelectionStorage(storeRef.current!), [])

  return <Provider store={storeRef.current} serverState={serverState.current}>{children}</Provider>
}