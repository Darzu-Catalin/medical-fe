'use client'

import { useEffect } from 'react'
import { paths } from '@/routes/paths'
import { useDispatch } from 'react-redux'
import { setSelectedUser } from '@/redux/slices/users'
import AddEditUserModel from '@/views/models/user/add-edit-user'
import { adminUpdateUserRequest } from '@/requests/admin/user.requests'
import BasicDashboardView from '@/components/custom/views/dashboard/basic-dashboard-view'

// ----------------------------------------------------------------------

export default function UserNewView() {
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(setSelectedUser(null))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <BasicDashboardView
      heading="Creează Utilizator"
      links={[
        { name: 'Listă Utilizatori', href: paths.dashboard.user.list },
        { name: 'Utilizator Nou' },
      ]}
    >
      <AddEditUserModel updater={adminUpdateUserRequest} />
    </BasicDashboardView>
  )
}
