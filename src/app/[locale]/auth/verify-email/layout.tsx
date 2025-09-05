'use client'

import { GuestGuard } from '@/auth/guard'
// auth
import AuthClassicLayout from '@/layouts/auth/layout'

// ----------------------------------------------------------------------

type Props = {
  children: React.ReactNode
}

export default function Layout({ children }: Props) {
  return <GuestGuard>
    <AuthClassicLayout>
      {children}
    </AuthClassicLayout>
  </GuestGuard>
}
