'use client'

import { redirect } from 'next/navigation'
import { useAppSelector } from '@/redux/store'
import MedicalRecordsView from '@/views/dashboard/medical-records/medical-records-view'

export default function MedicalRecordsPage() {
  const { user, userRole } = useAppSelector((state) => state.auth)

  // Only doctors and patients can access medical records
  if (!user || !['doctor', 'patient'].includes(userRole)) {
    redirect('/unauthorized')
  }

  return <MedicalRecordsView />
}