'use client'

import { paths } from '@/routes/paths'
import { gridGetUsers } from '@/requests/admin/user.requests'
import OrbitDataGrid from '@/components/custom/orbit-data-grid'
import { userColumns } from '@/views/dashboard/user/list/grid-config'
import BasicDashboardView from '@/components/custom/views/dashboard/basic-dashboard-view'

// ----------------------------------------------------------------------

export default function CategoryListView() {
  return (
    <BasicDashboardView
      heading="Utilizatori"
      links={[{ name: 'Listă Utilizatori' }]}
      button={{
        name: 'Creează Utilizator',
        href: paths.dashboard.user.new,
      }}
    >
      <OrbitDataGrid
        hasExport
        fetcher={gridGetUsers}
        columns={userColumns}
        entityName="users"
        selectable={false}
      />
    </BasicDashboardView>
  )
}
