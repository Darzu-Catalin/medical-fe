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
import { getUserDisplayName } from '@/utils/user'
import { setSelectedUser } from '@/redux/slices/users'
import AddEditUserModel from '@/views/models/user/add-edit-user'
import { LoadingScreen } from '@/components/ui/minimals/loading-screen'
import { gridGetUsers, adminUpdateUserRequest } from '@/requests/admin/user.requests'
import BasicDashboardView from '@/components/custom/views/dashboard/basic-dashboard-view'

// ----------------------------------------------------------------------

export default function UserEditView() {
  const { id }: { id: string } = useParams()
  const dispatch = useDispatch()
  const router = useRouter()
  const selectedUser = useAppSelector((state) => state.users.selectedUser)
  const { data, isLoading } = useSWR<ApiResponseType>(`user-${id}`, () =>
    gridGetUsers({ id: Number(id) })
  )

  useEffect(() => {
    if (!data) {
      return () => {}
    }
    if (data?.error) {
      enqueueSnackbar(data.message, { variant: 'error' })
      return router.push(paths.dashboard.user.list)
    }

    dispatch(setSelectedUser(data.data))
    return () => {
      dispatch(setSelectedUser(null))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data])

  if (isLoading || !selectedUser) {
    return <LoadingScreen />
  }

  return (
    <BasicDashboardView
      heading="Editează Utilizatorul"
      links={[
        { name: 'Listă Utilizatori', href: paths.dashboard.user.list },
        { name: getUserDisplayName(data!.user) },
      ]}
    >
      <AddEditUserModel updater={adminUpdateUserRequest} />
    </BasicDashboardView>
  )
}
