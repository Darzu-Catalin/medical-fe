import { paths } from '@/routes/paths'
import { UserType } from '@/types/types'
import { getUserDisplayName } from '@/utils/user'
import Label from '@/components/ui/minimals/label'
import { AvatarCell, avatarColumn } from '@/views/dashboard/utils/data-grid-columns/avatar-column'
import {
  actionsColumn,
  ActionsStackCell,
} from '@/views/dashboard/utils/data-grid-columns/actions-column'
import {
  idColumn,
  dateColumn,
  stringColumn,
} from '@/views/dashboard/utils/data-grid-columns/common-columns'

import { GridColDef, GRID_CHECKBOX_SELECTION_COL_DEF } from '@mui/x-data-grid-pro'


export const userColumns: GridColDef[] = [
  GRID_CHECKBOX_SELECTION_COL_DEF,
  {
    field: 'actions',
    headerName: 'Acțiuni',
    ...actionsColumn,
    renderCell: (params) => {
      const user = params.row as UserType
      return (
        <ActionsStackCell
          title="Șterge Utilizator"
          content={`utilizatorul ${getUserDisplayName(user)}`}
          // @ts-ignore
          deleteRequest={null}
          payload={{ id: user.id! }}
          href={paths.dashboard.user.edit(user.id!)}
        />
      )
    },
  },
  {
    field: 'id',
    headerName: 'ID',
    ...idColumn,
  },
  {
    field: 'avatar',
    headerName: 'Avatar',
    ...avatarColumn,
    renderCell: (params) => {
      const user = params.row as UserType
      return (
        <AvatarCell
          href={paths.dashboard.user.edit(user.id!)}
          image={user?.file?.url}
          alt={getUserDisplayName(user)}
        />
      )
    },
  },
  {
    field: 'first_name',
    headerName: 'Prenume',
    ...stringColumn,
  },
  {
    field: 'last_name',
    headerName: 'Nume',
    ...stringColumn,
  },
  {
    field: 'email',
    headerName: 'Email',
    width: 300,
    renderCell: (params) => {
      const user = params.row as UserType

      return (
        <Label color={user.email_verified_at ? 'success' : 'error'} sx={{ textTransform: 'none' }}>
          {user.email}
        </Label>
      )
    },
  },
  {
    field: 'phone',
    headerName: 'Telefon',
    ...stringColumn,
    width: 200,
    renderCell: (params) => {
      const user = params.row as UserType

      if (!user.phone) return null

      return (
        <Label color={user.phone_verified_at ? 'success' : 'error'} sx={{ textTransform: 'none' }}>
          {user.phone}
        </Label>
      )
    },
  },
  {
    field: 'cnp',
    headerName: 'CNP',
    ...stringColumn,
  },
  {
    field: 'created_at',
    headerName: 'Creat la',
    ...dateColumn,
  },
]
