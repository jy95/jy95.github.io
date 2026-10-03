'use client'
import { useState } from 'react'
import { Provider } from 'react-redux'
import { makeStore } from '../redux/Store'

import type { ReactNode } from "react";

export default function StoreProvider({
  children,
}: {
  children: ReactNode
}) {
  // Capture the store and server snapshot once, including during Suspense hydration.
  const [{ store, serverState }] = useState(() => {
    const store = makeStore()
    return { store, serverState: store.getState() }
  })

  return <Provider store={store} serverState={serverState}>{children}</Provider>
}
