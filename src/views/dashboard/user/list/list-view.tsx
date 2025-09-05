'use client'

import { paths } from '@/routes/paths'
import { gridGetUsers } from '@/requests/admin/user.requests'
import OrbitDataGrid from '@/components/custom/orbit-data-grid'
import { userColumns } from '@/views/dashboard/user/list/grid-config'
import BasicDashboardView from '@/components/custom/views/dashboard/basic-dashboard-view'
import { Box } from '@mui/system'
import { Typography } from '@mui/material'

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
      <Box sx={{ height: "100vh", width: '100%' }}>
        <Typography variant="h6" gutterBottom>
          TEST VIEW
        </Typography>
      </Box>
    </BasicDashboardView>
  )
}
