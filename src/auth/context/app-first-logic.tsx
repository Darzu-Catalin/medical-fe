'use client'

//
import { useState, useEffect, useCallback } from 'react'
import { getCurrentUserRequest } from '@/requests/auth/auth.requests'

import { useAppDispatch } from 'src/redux/store'
import { setUser, setPermissions, setToken } from 'src/redux/slices/auth'

// components
import { SplashScreen } from 'src/components/ui/minimals/loading-screen'

import { getSession, setSession } from './utils'
import { DISABLE_AUTH } from '@/config-global'

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
      if (DISABLE_AUTH) {
        // Bypass fetching user; mark as unauthenticated but loaded
        dispatch(setUser({} as any))
        dispatch(setPermissions(['*']))
        setLoading(false)
        return
      }
  const accessToken = getSession()

      if (accessToken) {
        setSession(accessToken)

        const response = await getCurrentUserRequest()
        if ((response as any)?.error) {
          throw new Error((response as any)?.message)
        }
        const data = (response as any)?.data ?? response
        const user = (data as any)?.user ?? data
        const perms = Array.isArray((data as any)?.permissions) && (data as any)?.permissions.length > 0
          ? (data as any)?.permissions
          : ['*']

        dispatch(setUser(user))
        dispatch(setPermissions(perms))
        dispatch(setToken(accessToken))
        setLoading(false)
      } else {
  dispatch(setUser(null))
  dispatch(setPermissions([]))
  dispatch(setToken(''))
        setLoading(false)
      }
    } catch (error) {
  dispatch(setUser(null))
  dispatch(setPermissions([]))
  dispatch(setToken(''))
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
