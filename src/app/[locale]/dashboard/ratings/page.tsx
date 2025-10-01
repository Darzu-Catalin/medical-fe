'use client'

import { redirect } from 'next/navigation'
import { useAppSelector } from '@/redux/store'
import { userCan } from '@/utils/permissions.utils'
import RatingsView from '@/views/dashboard/ratings/ratings-view'

export default function RatingsPage() {
  const { user, userRole } = useAppSelector((state) => state.auth)

  // Check if user has permission to access ratings (all roles can view ratings)
  if (!user) {
    redirect('/auth/login')
  }

  return <RatingsView />
}