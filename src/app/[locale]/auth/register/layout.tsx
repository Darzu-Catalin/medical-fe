'use client';

// components
import AuthClassicLayout from '@/layouts/auth/layout'

// auth
import { GuestGuard } from 'src/auth/guard'

// date pickers
import { LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'

// ----------------------------------------------------------------------

type Props = {
  children: React.ReactNode
}

export default function Layout({ children }: Props) {
  return (
    <GuestGuard>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <AuthClassicLayout>{children}</AuthClassicLayout>
      </LocalizationProvider>
    </GuestGuard>
  )
}
