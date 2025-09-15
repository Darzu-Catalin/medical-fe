'use client'

import { paths } from '@/routes/paths'
import { gridGetPartners } from '@/requests/admin/partner.requests'
import { partnerColumns } from '@/views/models/partner/partner-columns'
import BasicDashboardView from '@/components/custom/views/dashboard/basic-dashboard-view'

// ----------------------------------------------------------------------

export default function ProviderListView() {

  return (
    <BasicDashboardView
      heading="Furnizori"
      links={[{ name: 'Listă furnizori' }]}
      button={{ name: 'Adaugă furnizor', href: paths.dashboard.provider.new }}
    >
      Furnizori
      
    </BasicDashboardView>
  )
}
