'use client'

import useSWR from 'swr'
import { useEffect } from 'react'
import { paths } from '@/routes/paths'
import { useDispatch } from 'react-redux'
import { useParams } from '@/routes/hooks'
import { useRouter } from 'next/navigation'
import { enqueueSnackbar } from 'notistack'
import { useAppSelector } from '@/redux/store'
import { ApiResponseType } from '@/types/types'
import { gridGetWorkplace } from '@/requests/admin/workplace.requests'
import { LoadingScreen } from '@/components/ui/minimals/loading-screen'
import { setSelectedPartner, setSelectedWorkplace } from '@/redux/slices/general'
import BasicDashboardView from '@/components/custom/views/dashboard/basic-dashboard-view'

import WorkplaceTabs from '../components/workplace-tabs'

// ----------------------------------------------------------------------

export default function WorkplaceEditView() {
  const { id }: { id: string } = useParams()
  const dispatch = useDispatch()
  const router = useRouter()
  const selectedWorkplace = useAppSelector((state) => state.general.selectedWorkplace)
  const { data, isLoading } = useSWR<ApiResponseType>(`workplace-${id}`, () =>
    gridGetWorkplace({
      id: Number(id),
    }), {
      revalidateOnFocus: false,
    }
  )

  useEffect(() => {
    if (!data) {
      return () => {}
    }
    if (data?.error) {
      enqueueSnackbar(data.message, { variant: 'error' })
      return router.push(paths.dashboard.workplace.list)
    }

    dispatch(setSelectedWorkplace(data.data))
    dispatch(setSelectedPartner(data.data.client))
    return () => {
      dispatch(setSelectedWorkplace(null))
      dispatch(setSelectedPartner(null))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data])

  if (isLoading || !selectedWorkplace) {
    return <LoadingScreen />
  }

  return (
    <BasicDashboardView
      heading="Editează punct de lucru"
      links={[
        { name: 'Listă puncte de lucru', href: paths.dashboard.workplace.list },
        { name: selectedWorkplace.name || 'Punct de lucru nou' },
      ]}
    >
      <WorkplaceTabs />
    </BasicDashboardView>
  )
}
