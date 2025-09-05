import { useState } from 'react';
import { UserType, ContactPersonType } from '@/types/types';
import { useAppDispatch, useAppSelector } from '@/redux/store';
import Iconify from '@/components/ui/minimals/iconify/iconify';
import { setSelectedContactPerson } from '@/redux/slices/general';
import { deleteContactPersons, upsertContactPersons } from '@/requests/admin/contact-persons.requests';
import { actionsColumn, ActionsDeleteCell } from '@/views/dashboard/utils/data-grid-columns/actions-column';
import {
  idColumn,
  dateColumn,
  stringColumn,
  nestedValueColumn
} from '@/views/dashboard/utils/data-grid-columns/common-columns';

import { GridColDef } from '@mui/x-data-grid-pro'
import { Box, Dialog, IconButton } from '@mui/material';

import AddEditContactPersonModel from './upsert-contact-person';

const EditButton = ({ model }: { model: any }) => {
  const [addNewModalVisible, setAddNewModalVisible] = useState(false)
  const dispatch = useAppDispatch()
  const selectedPartner = useAppSelector((state) => state.general.selectedPartner)
  const selectedWorkplace = useAppSelector((state) => state.general.selectedWorkplace)
  return (
    <>
      <IconButton onClick={() => {
        dispatch(setSelectedContactPerson(model))
        setAddNewModalVisible(true)
      }} size="small">
        <Iconify icon="eva:edit-outline" />
      </IconButton>

      <Box>
        <IconButton
          onClick={() => {
            setAddNewModalVisible(true)
          }}
        >
          <Iconify icon="mdi:plus" />
        </IconButton>

        <Dialog
          open={addNewModalVisible}
          sx={{
            '& .MuiDialog-paper': {
              maxWidth: 400,
              width: '100%',
            },
          }}
        >
          <Box
            sx={{
              position: 'relative',
              display: 'flex',
              padding: 2,
              paddingBottom: 0,
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Box />
            <IconButton
              onClick={() => {
                setAddNewModalVisible(false)
              }}
            >
              <Iconify icon="mdi:close" />
            </IconButton>
          </Box>
          <Box
            sx={{
              padding: 3,
              paddingTop: 1,
              paddingBottom: 3,
            }}
          >
            <AddEditContactPersonModel
              onSubmitSuccess={() => {
                setAddNewModalVisible(false)
              }}
              updater={(e: ContactPersonType) => upsertContactPersons({
                ...e,
                partner_id: selectedPartner?.id,
                workplace_id: selectedWorkplace?.id || null
              })}
            />
          </Box>
        </Dialog>
      </Box>
    </>
  )
}

export const contactPersonsColumns: GridColDef[] = [
  {
    field: 'actions',
    headerName: 'Acțiuni',
    ...actionsColumn,
    renderCell: (params) => {
      const model = params.row as UserType
      return (
        <>
          <ActionsDeleteCell
            title="Șterge persoana de contact"
            content={`ștergi persoana de contact ${model.first_name} ${model.last_name}`}
            payload={{
              id: model.id
            }}
            confirmTitle="Da, șterge"
            deleteRequest={deleteContactPersons as any}
          />
          <EditButton model={model} />
        </>
      )
    },
  },
  {
    field: 'id',
    headerName: 'ID',
    ...idColumn,
  },
  {
    field: "first_name",
    headerName: "Nume",
    ...stringColumn,
  },
  {
    field: "last_name",
    headerName: "Nume",
    ...stringColumn,
  },
  {
    field: "phone",
    headerName: "Număr telefon",
    ...stringColumn,
  },
  {
    field: "email",
    headerName: "Email",
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
    field: "position",
    headerName: "Poziție",
    ...stringColumn,
  },
  {
    field: "status",
    headerName: "Status",
    ...stringColumn,
  },
  {
    field: "notes",
    headerName: "Note",
    ...stringColumn,
  },
  {
    field: "partner.name",
    headerName: "Partener",
    ...nestedValueColumn,
  },
  {
    field: 'created_at',
    headerName: 'Creat la',
    ...dateColumn,
  }
]
