'use client'

import { PERMISSIONS } from '@/utils/permissions.utils'
import { AuthGuard, RoleBasedGuard } from '@/auth/guard'
import DashboardLayout from '@/layouts/dashboard/layout'

import { LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'

// ----------------------------------------------------------------------

type Props = {
  children: React.ReactNode
}

export default function Layout({ children }: Props) {
  return (
    <AuthGuard>
      <RoleBasedGuard permissions={[PERMISSIONS.ALL_PERMISSIONS]} hasContent>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DashboardLayout>{children}</DashboardLayout>
        </LocalizationProvider>
      </RoleBasedGuard>
    </AuthGuard>
  )
}
