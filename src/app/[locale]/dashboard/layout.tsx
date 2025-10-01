'use client'

import React from 'react'
import { AuthGuard } from '@/auth/guard'
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
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <DashboardLayout>
          {children}
        </DashboardLayout>
      </LocalizationProvider>
    </AuthGuard>
  )
}
