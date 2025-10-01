'use client'

import { DISABLE_AUTH } from '@/config-global'
import { useState, useEffect, useCallback } from 'react'
import { useAppSelector } from '@/redux/store'

// routes
import { paths } from 'src/routes/paths'
import { useRouter, usePathname } from 'src/routes/hooks'

//

// ----------------------------------------------------------------------

type AuthGuardProps = {
  children: React.ReactNode
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter()
  const pathname = usePathname()
  const user = useAppSelector((state) => state.auth.user)

  const [checked, setChecked] = useState(false)

  const check = useCallback(() => {
    if (DISABLE_AUTH) {
      setChecked(true)
      return
    }
    if (!user) {
      const searchParams = new URLSearchParams({ returnTo: window.location.href }).toString()

      const loginPath = paths.auth.login

      const href = `${loginPath}?${searchParams}`
      console.log('Unauthenticated, redirecting to login: ', href)
      router.replace(href)
    } else {
      setChecked(true)
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, pathname, user])

  useEffect(() => {
    check()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [check])

  if (!checked) {
    return null
  }

  return <>{children}</>
}
