'use client'

//
import { useState, useEffect, useCallback } from 'react'
import { getCurrentUserRequest } from '@/requests/auth/auth.requests'

import { useAppDispatch } from 'src/redux/store'
import { setUser, setPermissions } from 'src/redux/slices/auth'

// components
import { SplashScreen } from 'src/components/ui/minimals/loading-screen'

import { getSession, setSession } from './utils'

// ----------------------------------------------------------------------

type Props = {
  children: React.ReactNode
}


export function AppFirstLogic({ children }: Props) {
  const dispatch = useAppDispatch()
  const [loading, setLoading] = useState(true)

  const initialize = useCallback(async () => {
    // set Main-Company header to axios instance
    try {
      setLoading(true)
      const accessToken = getSession()

      if (accessToken) {
        setSession(accessToken)

        const response = await getCurrentUserRequest()

        if (response.error) {
          throw new Error(response.message)
        }

        dispatch(setUser(response.user))
        dispatch(setPermissions(response.permissions))
        setLoading(false)
      } else {
        dispatch(setUser(null))
        dispatch(setPermissions([]))
        setLoading(false)
      }
    } catch (error) {
      dispatch(setUser(null))
      dispatch(setPermissions([]))
      setLoading(false)
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    initialize()
  }
    , [initialize]);



  if (loading) {
    return <SplashScreen />
  }

  return children
}
