'use client'


import OrbitDataGrid from '@/components/custom/orbit-data-grid'
import { gridGetLogs } from '@/requests/admin/general.requests'

import { Card } from '@mui/material'

import { activityClientColumns } from './activity-columns'

export default function ActivityTable({
  model,
  id,
}: {
  model: any
  id: number
}) {

  return (
    <Card sx={{
    }} >
      <OrbitDataGrid
        hasExport
        fetcher={(e: any) => gridGetLogs({ ...e, id, model })}
        entityName={`${model}-logs`}
        columns={activityClientColumns}
        selectable={false}
      />
    </Card>
  )
}
