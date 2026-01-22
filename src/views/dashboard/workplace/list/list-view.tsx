'use client'

import MedicalClinicsMap from '@/components/custom/medical-clinics-map'
import BasicDashboardView from '@/components/custom/views/dashboard/basic-dashboard-view'

// ----------------------------------------------------------------------

export default function WorkplaceListView() {

  return (
    <BasicDashboardView heading="Medical Clinics" links={[{ name: 'Clinics in Your Zone' }]}>
      <MedicalClinicsMap />
    </BasicDashboardView>
  )
}
