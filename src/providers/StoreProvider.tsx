'use client'
import { useRef } from 'react'
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

  return <Provider store={storeRef.current}>{children}</Provider>
}