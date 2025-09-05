import Iconify from '@/components/iconify'
import { usePathname } from '@/routes/hooks'
import { useAppSelector } from '@/redux/store'
import React, { useState, useEffect } from 'react'
import { CalendarView } from '@/views/dashboard/calendar/view'
import OrbitDataGrid from '@/components/custom/orbit-data-grid'
import ActivityTable from '@/views/models/activity/activity-table'
import { gridGetWorkplace } from '@/requests/admin/workplace.requests'
import AddEditPartnerModel from '@/views/models/partner/upsert-partner'
import { workplaceColumns } from '@/views/models/workplace/workplace-columns'
import { gridGetContactPersons } from '@/requests/admin/contact-persons.requests'
import ComingSoonIllustration from '@/assets/illustrations/coming-soon-illustration'
import { contactPersonsColumns } from '@/views/models/contact-persons/contact-persons-columns'

import { Box, Tab, Card } from '@mui/material'
import { TabList, TabPanel, TabContext } from '@mui/lab'

import SelectOrCreateWorkplaceForClient from './select-or-create-workplace'
import SelectOrCreateContactPersonForClient from './select-or-create-contact-person'

export default function PartnerTabs() {
  const isClient = usePathname().includes('/client/')

  const defaultTab = isClient ? 'client' : 'partner'
  const [selectedTab, setSelectedTab] = useState('')
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
    // eslint-disable-next-line
  }, [selectedTab])

  // load selectedTab from url query
  useEffect(() => {
    const url = new URL(window.location.href)
    const tab = url.searchParams.get('tab')
    if (tab) {
      setSelectedTab(tab)
    }
  }, [])

  const selectedPartner = useAppSelector((state) => state.general.selectedPartner)

  return (
    <TabContext value={selectedTab}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <TabList onChange={handleChange}>
          <Tab
            label={isClient ? 'Client' : 'Furnizor'}
            value={isClient ? 'client' : 'partner'}
            icon={
              <Iconify
                // company icon
                icon="mdi:company"
              />
            }
          />

          {/* <Tab label="Operațiuni" disabled={!selectedPartner} value="operations" /> */}

          {selectedPartner && (
            <Tab
              icon={<Iconify icon="mdi:account-outline" />}
              label="Persoane de contact"
              value="contact-persons"
            />
          )}



          {
            selectedPartner?.is_provider && (
              <Tab
                label="Puncte de lucru"
                icon={
                  <Iconify
                    // company icon
                    icon="mdi:business"
                  />
                }
                disabled={false}
                value="workplaces"
              />
            )
          }

          {
            selectedPartner && <Tab
              icon={<Iconify
                // services icon
                icon="mdi:tire"
              />}
              label="Servicii"
              value="services" />
          }


          {
            selectedPartner && (
              <Tab
                label="Calendar"
                icon={<Iconify icon="mdi:calendar" />}
                disabled={!selectedPartner}
                value="calendar"
              />
            )
          }

          {
            selectedPartner && (
              <Tab label="Logs" icon={<Iconify icon="mdi:format-list-bulleted" />} value="logs" />
            )
          }
        </TabList >
      </Box >

      <TabPanel
        value={isClient ? 'client' : 'partner'}
        sx={{
          padding: 0,
          paddingTop: 2,
        }}
      >
        <Card
          sx={{
            padding: 3,
          }}
        >
          <AddEditPartnerModel />
        </Card>
      </TabPanel>
 
      {/* Operatiuni */}
      <TabPanel
        value="operations"
        sx={{
          padding: 0,
          paddingTop: 2,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: 10,
          }}
        >
          <ComingSoonIllustration
            sx={{
              maxWidth: 480,
              margin: 'auto',
            }}
          />
        </Box>
      </TabPanel>

      <TabPanel
        value="calendar"
        sx={{
          padding: 0,
          paddingTop: 2,
        }}
      >
        <CalendarView
          model="partner"
          id={selectedPartner?.id || 0}
        />
      </TabPanel>

      <TabPanel
        value="logs"
        sx={{
          padding: 0,
          paddingTop: 2,
        }}
      >
        <ActivityTable model="partner" id={selectedPartner?.id || 0} />
      </TabPanel>

      {/* contact-persons  */}
      <TabPanel
        value="contact-persons"
        sx={{
          padding: 0,
          paddingTop: 2,
        }}
      >
        <Card sx={{}}>
          <OrbitDataGrid
            hardCodedFilters={[{ field: 'partner_id', operator: '=', value: selectedPartner?.id }]}
            hasExport={false}
            fetcher={gridGetContactPersons}
            entityName={`client-${selectedPartner?.id}-contact-persons`}
            columns={contactPersonsColumns}
            rightComponent={<SelectOrCreateContactPersonForClient />}
            selectable={false}
          />
        </Card>
      </TabPanel>

      {/* workplaces  */}
      {
        selectedPartner?.is_provider && (
          <TabPanel
            value="workplaces"
            sx={{
              padding: 0,
              paddingTop: 2,
            }}
          >
            <Card sx={{}}>
              <OrbitDataGrid
                hardCodedFilters={[
                  { field: 'partner_id', operator: '=', value: selectedPartner?.id },
                ]}
                hasExport={false}
                fetcher={gridGetWorkplace}
                entityName={`client-${selectedPartner?.id}-workplace`}
                columns={workplaceColumns}
                rightComponent={<SelectOrCreateWorkplaceForClient />}
                selectable={false}
              />
            </Card>
          </TabPanel>
        )
      }
    </TabContext >
  )
}
