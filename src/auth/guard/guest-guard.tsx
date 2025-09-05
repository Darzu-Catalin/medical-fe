'use client'

/* eslint-disable no-debugger */
import { useEffect, useCallback } from 'react'

// routes
import { paths } from 'src/routes/paths'
import { useRouter } from 'src/routes/hooks'
import { DISABLE_AUTH } from '@/config-global'

//
import { useAppSelector } from 'src/redux/store'

// ----------------------------------------------------------------------

type GuestGuardProps = {
  children: React.ReactNode
}

export default function GuestGuard({ children }: GuestGuardProps) {
  const router = useRouter()

  const user = useAppSelector((state) => state.auth.user)

  const check = useCallback(() => {
  if (DISABLE_AUTH) return
    if (user) {
      router.replace(paths.app.root)
    }
  }, [user, router])

  useEffect(() => {
    check()
  }, [check])

  return <>{children}</>
}
