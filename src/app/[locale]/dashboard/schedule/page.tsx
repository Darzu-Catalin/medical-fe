'use client'

import { redirect } from 'next/navigation'
import { useAppSelector } from '@/redux/store'
import ScheduleView from '@/views/dashboard/schedule/schedule-view'

export default function SchedulePage() {
  const { user, userRole } = useAppSelector((state) => state.auth)

  // Only doctors need schedule management
  if (!user || userRole !== 'doctor') {
    redirect('/unauthorized')
  }

  return <ScheduleView />
}