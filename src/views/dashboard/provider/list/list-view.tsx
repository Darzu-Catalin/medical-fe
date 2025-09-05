'use client'

import { paths } from '@/routes/paths'
import OrbitDataGrid from '@/components/custom/orbit-data-grid'
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
      <OrbitDataGrid
        hardCodedFilters={[
          { field: 'is_person', operator: '=', value: false },
          { field: 'is_provider', operator: '=', value: true },
        ]}
        hasExport
        fetcher={gridGetPartners}
        entityName="providers"
        columns={partnerColumns}
        selectable={false}
      />
    </BasicDashboardView>
  )
}
