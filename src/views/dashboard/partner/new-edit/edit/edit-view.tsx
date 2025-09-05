'use client'

import useSWR from 'swr'
import { useEffect } from 'react'
import { paths } from '@/routes/paths'
import { useDispatch } from 'react-redux'
import { useRouter } from 'next/navigation'
import { enqueueSnackbar } from 'notistack'
import { useAppSelector } from '@/redux/store'
import { ApiResponseType } from '@/types/types'
import { useParams, usePathname } from '@/routes/hooks'
import { setSelectedPartner } from '@/redux/slices/general'
import { gridGetPartners } from '@/requests/admin/partner.requests'
import { LoadingScreen } from '@/components/ui/minimals/loading-screen'
import BasicDashboardView from '@/components/custom/views/dashboard/basic-dashboard-view'

import PartnerTabs from '../components/partner-tabs'

// ----------------------------------------------------------------------

export default function PartnerEditView() {
  const { id }: { id: string } = useParams()
  const dispatch = useDispatch()
  const router = useRouter()
  const pathname = usePathname();
  // is "client" in url query
  const isClient = pathname.includes('/client/')

  const selectedPartner = useAppSelector((state) => state.general.selectedPartner)
  const { data, isLoading } = useSWR<ApiResponseType>(`client-${id}`, () =>
    gridGetPartners({
      id: Number(id),
    })
  )


  useEffect(() => {
    if (!data) {
      return () => { }
    }
    if (data?.error) {
      enqueueSnackbar(data.message, { variant: 'error' })
      return router.push(paths.dashboard.client.list)
    }
    dispatch(setSelectedPartner(data.data))
    return () => {
      dispatch(setSelectedPartner(null))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data])

  if (isLoading || !selectedPartner) {
    return <LoadingScreen />
  }

  return (
    <BasicDashboardView
      heading={isClient ? "Editează client" : "Editează furnizor"}
      links={[
        { name: 'Listă furnizori', href: paths.dashboard.client.list },
        { name: data?.data?.name || 'Partener nou' },
      ]}
    >
      <PartnerTabs
      />
    </BasicDashboardView>
  )
}
