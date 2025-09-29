import { store } from '@/redux/store'
import { paths } from '@/routes/paths'
import { UserType } from '@/types/types'
import Label from '@/components/ui/minimals/label'
import { deleteWorkplace } from '@/requests/admin/workplace.requests'
import {
  actionsColumn,
  ActionsStackCell,
} from '@/views/dashboard/utils/data-grid-columns/actions-column'
import {
  idColumn,
  dateColumn,
  stringColumn,
} from '@/views/dashboard/utils/data-grid-columns/common-columns'

import { GridColDef,GRID_CHECKBOX_SELECTION_COL_DEF } from '@mui/x-data-grid-pro'

export const workplaceColumns: GridColDef[] = [
  {
    ...GRID_CHECKBOX_SELECTION_COL_DEF,
    width: 100,
  },
  {
    field: 'actions',
    headerName: 'Acțiuni',
    ...actionsColumn,
    renderCell: (params) => {
      const model = params.row as UserType
      const selectedPartner = store?.getState().general?.selectedPartner
      return (
        <ActionsStackCell
          confirmTitle={
            selectedPartner ? 'Dezasociază punctul de lucru' : 'Șterge punctul de lucru'
          }
          title={selectedPartner ? 'Dezasociază punctul de lucru' : 'Șterge punctul de lucru'}
          content={
            selectedPartner
              ? `dezasociezi punctul de lucru ${model.name}`
              : `ștergi punctul de lucru ${model.name}`
          }
          // @ts-ignore
          deleteRequest={deleteWorkplace}
          payload={{
            id: model.id as number,
            partner_id: selectedPartner?.id || undefined,
          }}
          href={paths.dashboard.workplace.edit(model.id as number)}
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
    field: 'tariff_plan',
    headerName: 'Plan tarifar',
    ...stringColumn,
    renderCell: (params) => {
      const model = params.row as UserType

      const plan = model.tariff_plan;

      if (plan === 'bronze') {
        return <Label sx={{
          backgroundColor: '#CD7F32',
          color: 'white',
          borderRadius: '4px',
          padding: '4px',
        }}>{model.tariff_plan}</Label>
      }

      if (plan === 'silver') {
        return <Label sx={{
          backgroundColor: '#C0C0C0',
          color: 'black',
          borderRadius: '4px',
          padding: '4px',
        }}>{model.tariff_plan}</Label>
      }

      return <Label sx={{
        backgroundColor: '#FFD700',
        color: 'black',
        borderRadius: '4px',
        padding: '4px',
      }}>{model.tariff_plan}</Label>

    }
  },
  {
    field: 'appointment_contact_type',
    headerName: 'Tip contact',
    ...stringColumn,
  },
  {
    field: 'accepted_brands',
    headerName: 'Tipuri acceptate',
    ...stringColumn,
  },
  {
    field: 'street',
    headerName: 'Strada',
    ...stringColumn,
  },
  {
    field: 'status',
    headerName: 'Status',
    ...stringColumn,
  },
  {
    field: 'created_at',
    headerName: 'Creat la',
    ...dateColumn,
  },
]
