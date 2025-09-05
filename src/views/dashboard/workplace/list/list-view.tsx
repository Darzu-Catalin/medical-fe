'use client'

import useSWR from 'swr'
import { useState } from 'react'
import Iconify from '@/components/iconify'
import { WorkplaceType } from '@/types/types'
import MapComponentMemo from '@/components/custom/map/map'
import OrbitDataGrid from '@/components/custom/orbit-data-grid'
import { workplaceColumns } from '@/views/models/workplace/workplace-columns'
import BasicDashboardView from '@/components/custom/views/dashboard/basic-dashboard-view'
import { gridGetWorkplace, gridGetWorkplaceMap } from '@/requests/admin/workplace.requests'

import { Box, Divider, IconButton, Typography } from '@mui/material'

import { DEFAULT_MAP_LAT, DEFAULT_MAP_LNG, DEFAULT_MAP_ZOOM } from '@/components/custom/map/map.style'

// ----------------------------------------------------------------------

export default function WorkplaceListView() {

  const [viewState, setViewState] = useState({
    longitude: DEFAULT_MAP_LNG,
    latitude: DEFAULT_MAP_LAT,
    zoom: DEFAULT_MAP_ZOOM,
    pitch: 0,
    bearing: 0,
  })

  const [dataGridParams, setDataGridParams] = useState({})

  const { data } = useSWR(
    `workplace-map-${JSON.stringify(viewState)}-${JSON.stringify(dataGridParams)}`,
    () =>
      gridGetWorkplaceMap({
        viewState,
        dataGridParams,
      }) as any,
    {
      keepPreviousData: true,
    }
  )

  return (
    <BasicDashboardView heading="Puncte de lucru" links={[{ name: 'Listă puncte de lucru' }]}>

      <MapComponentMemo
        markers={data?.data as WorkplaceType[] || []}
        onViewStateChange={(e: any) => {
          setViewState(e)
        }}
        renderPopup={(marker: WorkplaceType) => <Box sx={{
          p: 2,
          minWidth: "200px",
        }}>
          <Typography variant="body1" sx={{
            color: "primary.main",
          }}>{marker.name}</Typography>
          <Typography variant="caption" sx={{
            mb: 2,
            display: "block"
          }}>{marker.contact_notes}</Typography>

          <Divider sx={{
            mb: 1,
            mt: 1
          }} />
          <Box sx={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 1
          }}>
            {marker.contact_phone ? <IconButton size="small" href={`tel:${marker.contact_phone}`}>
              <Iconify icon="bi:telephone-fill" />
            </IconButton> : null}

            {marker.contact_email ? <IconButton size="small" href={`mailto:${marker.contact_email}`}>
              <Iconify icon="bi:envelope-fill" />
            </IconButton> : null}

            {marker.contact_url ? <IconButton size="small" href={marker.contact_url}>
              <Iconify icon="bi:link-45deg" />
            </IconButton> : null}

          </Box>
        </Box>
        }
      />
      <OrbitDataGrid
        onChangeParams={(params: any) => {
          setDataGridParams(params)
        }}
        fetcher={gridGetWorkplace}
        entityName="workplace"
        hasExport
        columns={workplaceColumns}
      />
    </BasicDashboardView>
  )
}
