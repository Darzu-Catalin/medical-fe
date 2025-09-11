'use client'

import { useState } from 'react'
import { paths } from '@/routes/paths'
import OrbitDataGrid from '@/components/custom/orbit-data-grid'
import { gridGetPartners } from '@/requests/admin/partner.requests'
import { partnerColumns } from '@/views/models/partner/partner-columns'
import BasicDashboardView from '@/components/custom/views/dashboard/basic-dashboard-view'

import { Box, Tab } from '@mui/material'
import { TabList, TabPanel, TabContext } from '@mui/lab'

// ----------------------------------------------------------------------

export default function ClientListView() {
  const [value, setValue] = useState('partners')

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setValue(newValue)
  }

  return (
    <BasicDashboardView
      heading="Clienți"
      links={[{ name: 'Listă clienți' }]}
      button={{ name: 'Adaugă client', href: paths.dashboard.client.new }}
    >
      <TabContext value={value}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <TabList onChange={handleChange}>
            <Tab disabled label="Persoane fizice" value="users" />
            <Tab label="Persoane juridice" value="partners" />
          </TabList>
        </Box>

        <TabPanel
          value="users"
          sx={{
            padding: 0,
            paddingTop: 2,
          }}
        />

        <TabPanel
          value="partners"
          sx={{
            padding: 0,
            paddingTop: 2,
          }}
        >
          
        </TabPanel>
      </TabContext>
    </BasicDashboardView>
  )
}
