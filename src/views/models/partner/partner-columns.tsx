import { paths } from '@/routes/paths'
import { UserType } from '@/types/types'
import { deletePartnerRequest } from '@/requests/admin/partner.requests'
import {
  actionsColumn,
  ActionsStackCell,
} from '@/views/dashboard/utils/data-grid-columns/actions-column'
import {
  idColumn,
  dateColumn,
  stringColumn,
  nestedValueColumn
} from '@/views/dashboard/utils/data-grid-columns/common-columns'

import { GridColDef, GRID_CHECKBOX_SELECTION_COL_DEF } from '@mui/x-data-grid-pro'

export const partnerColumns: GridColDef[] = [
  GRID_CHECKBOX_SELECTION_COL_DEF,
  {
    field: 'actions',
    headerName: 'Acțiuni',
    ...actionsColumn,
    renderCell: (params) => {
      const model = params.row as UserType
      const isClient = window.location.pathname.includes('/client/');

      return (
        <ActionsStackCell
          title="Șterge companie"
          content={`ștergi compania ${model.name}`}
          // @ts-ignore
          deleteRequest={deletePartnerRequest}
          payload={{
            id: model.id as number,
          }}
          href={isClient ? paths.dashboard.client.edit(model.id as number) : paths.dashboard.provider.edit(model.id as number)}
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
    field: 'name',
    headerName: 'Nume',
    ...stringColumn,
  },
  {
    field: 'cif',
    headerName: 'CIF',
    ...stringColumn,
  },
  {
    field: 'county.name',
    headerName: 'Oraș',
    ...nestedValueColumn,
  },
  {
    field: 'city.name',
    headerName: 'Localitate',
    ...nestedValueColumn,
  },
  {
    field: 'administrator_name',
    headerName: 'Nume Administrator',
    ...stringColumn,
  },
  {
    field: 'administrator_phone',
    headerName: 'Telefon Administrator',
    ...stringColumn,
  },
  {
    field: 'administrator_email',
    headerName: 'Email Administrator',
    ...stringColumn,
  },
  {
    field: 'bank_name',
    headerName: 'Bancă',
    ...stringColumn,
  },
  {
    field: 'bank_account',
    headerName: 'IBAN',
    ...stringColumn,
  },
  {
    field: 'created_at',
    headerName: 'Creat la',
    ...dateColumn,
  },
  // is client
  {
    field: 'is_client',
    headerName: 'E client',
    type: 'boolean',
  },
  {
    field: 'is_provider',
    headerName: 'E furnizor',
    type: 'boolean',
  },
]
