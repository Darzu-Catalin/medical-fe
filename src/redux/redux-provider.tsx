'use client'

import { useState } from 'react'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/lib/integration/react'

import { store, persistor } from './store'

// ----------------------------------------------------------------------

type Props = {
  children: React.ReactNode
}

export default function ReduxProvider({ children }: Props) {
  const [persistorIsReady, setPersistorIsReady] = useState(false)
  return (
    <Provider store={store}>
      <PersistGate
        onBeforeLift={() => {
          setPersistorIsReady(true)
        }}
        persistor={persistor}
      >
        {persistorIsReady ? children : null}
      </PersistGate>
    </Provider>
  )
}
