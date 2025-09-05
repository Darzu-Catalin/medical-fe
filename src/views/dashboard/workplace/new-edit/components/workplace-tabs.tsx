import Iconify from '@/components/iconify'
import { useAppSelector } from '@/redux/store'
import React, { useState, useEffect } from 'react'
import { CalendarView } from '@/views/dashboard/calendar/view'
import OrbitDataGrid from '@/components/custom/orbit-data-grid'
import ActivityTable from '@/views/models/activity/activity-table'
import AddEditWorkplaceModel from '@/views/models/workplace/upsert-workplace'
import { gridGetContactPersons } from '@/requests/admin/contact-persons.requests'
import { contactPersonsColumns } from '@/views/models/contact-persons/contact-persons-columns'
import SelectOrCreateContactPersonForClient from '@/views/dashboard/partner/new-edit/components/select-or-create-contact-person'

import { Box, Tab, Card } from '@mui/material'
import { TabList, TabPanel, TabContext } from '@mui/lab'

export default function WorkplacesTabs() {
  const defaultTab = 'workplace'
  const [selectedTab, setSelectedTab] = useState('')
  const selectedWorkplace = useAppSelector((state) => state.general.selectedWorkplace)

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setSelectedTab(newValue)
  }
  // add selectedTab to url query
  useEffect(() => {
    if (!selectedTab) {
      setSelectedTab(defaultTab)
      return
    }
    const url = new URL(window.location.href)
    url.searchParams.set('tab', selectedTab)
    window.history.replaceState({}, '', url.toString())
  }, [selectedTab])

  // load selectedTab from url query
  useEffect(() => {
    const url = new URL(window.location.href)
    const tab = url.searchParams.get('tab')
    if (tab) {
      setSelectedTab(tab)
    }
  }, [])

  return (
    <TabContext value={selectedTab}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <TabList onChange={handleChange}>
          <Tab label="Punct de lucru"
            icon={<Iconify
              // company icon
              icon="mdi:business"
            />}
            value="workplace" />
          <Tab label="Calendar"
            icon={<Iconify
              icon="mdi:calendar"
            />}
            value="calendar" />
          <Tab label="Persoane de contact"
            icon={<Iconify
              icon="mdi:account-outline"
            />}
            value="contact-persons" />

        
          <Tab label="Logs"
            icon={<Iconify
              icon="mdi:format-list-bulleted"
            />}
            value="logs" />
        </TabList>
      </Box>
      <TabPanel
        value="workplace"
        sx={{
          padding: 0,
          paddingTop: 2,
        }}
      >

        <AddEditWorkplaceModel />
      </TabPanel>
      <TabPanel
        value="contact-persons"
        sx={{
          padding: 0,
          paddingTop: 2,
        }}
      >
        <Card sx={{}}>
          <OrbitDataGrid
            hardCodedFilters={[
              { field: 'workplace_id', operator: '=', value: selectedWorkplace?.id },
            ]}
            hasExport={false}
            fetcher={gridGetContactPersons}
            entityName={`workplace-${selectedWorkplace?.id}-contact-persons`}
            columns={contactPersonsColumns}
            rightComponent={<SelectOrCreateContactPersonForClient />}
            selectable={false}
          />
        </Card>
      </TabPanel>

      <TabPanel
        value="calendar"
        sx={{
          padding: 0,
          paddingTop: 2,
        }}
      >
        <CalendarView
          model="workplace"
          id={selectedWorkplace?.id || 0}
        />
      </TabPanel>

      <TabPanel
        value="logs"
        sx={{
          padding: 0,
          paddingTop: 2,
        }}
      >
        <ActivityTable
          model="workplace"
          id={selectedWorkplace?.id || 0}
        />
      </TabPanel>
    </TabContext>
  )
}
