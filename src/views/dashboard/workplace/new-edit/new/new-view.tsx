'use client'

import { useEffect } from 'react'
import { paths } from '@/routes/paths'
import { useDispatch } from 'react-redux'
import { setSelectedWorkplace } from '@/redux/slices/general'
import BasicDashboardView from '@/components/custom/views/dashboard/basic-dashboard-view'

import WorkplaceTabs from '../components/workplace-tabs'

// ----------------------------------------------------------------------

export default function WorkplaceNewView() {
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(setSelectedWorkplace(null))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <BasicDashboardView
      heading="Creează punct de lucru"
      links={[
        { name: 'Listă puncte de lucru', href: paths.dashboard.client.list },
        { name: 'Punct de lucru nou' },
      ]}
    >
      <WorkplaceTabs />
    </BasicDashboardView>
  )
}
