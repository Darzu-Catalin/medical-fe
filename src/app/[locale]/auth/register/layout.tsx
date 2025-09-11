'use client';

// components
import AuthClassicLayout from '@/layouts/auth/layout'

// auth
import { GuestGuard } from 'src/auth/guard'

// ----------------------------------------------------------------------

type Props = {
  children: React.ReactNode
}

export default function Layout({ children }: Props) {
  return (
    <GuestGuard>
      <AuthClassicLayout>{children}</AuthClassicLayout>
    </GuestGuard>
  )
}
