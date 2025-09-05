'use client'

import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { usePathname } from '@/routes/hooks'
import { setSelectedPartner } from '@/redux/slices/general'
import BasicDashboardView from '@/components/custom/views/dashboard/basic-dashboard-view'

import PartnerTabs from '../components/partner-tabs'

// ----------------------------------------------------------------------

export default function PartnerNewView() {
  const dispatch = useDispatch()
  const isClient = usePathname().includes('/client/')
  useEffect(() => {
    dispatch(setSelectedPartner(null))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <BasicDashboardView
      heading={`Creează ${isClient ? 'client' : 'furnizor'}`}
      links={[{ name: `${isClient ? "Client nou" : "Furnizor nou"}` }]}
    >
      <PartnerTabs />
    </BasicDashboardView>
  )
}
