import { useState } from 'react'
import Iconify from '@/components/ui/minimals/iconify'
import { useAppDispatch, useAppSelector } from '@/redux/store'
import { setSelectedContactPerson } from '@/redux/slices/general'
import { upsertContactPersons } from '@/requests/admin/contact-persons.requests'
import AddEditContactPersonModel from '@/views/models/contact-persons/upsert-contact-person'

import { Box, Dialog, IconButton } from '@mui/material'

const SelectOrCreateContactPersonForClient = () => {
  const [addNewModalVisible, setAddNewModalVisible] = useState(false)
  const dispatch = useAppDispatch()
  const selectedPartner = useAppSelector((state) => state.general.selectedPartner)
  const selectedWorkplace = useAppSelector((state) => state.general.selectedWorkplace)
  const renderCreateStep = (
    <Box>
      <AddEditContactPersonModel
        onSubmitSuccess={() => {
          setAddNewModalVisible(false)
        }}
        updater={(e: any) => upsertContactPersons({
            ...e,
            partner_id: selectedPartner?.id,
            workplace_id: selectedWorkplace?.id
          })
        }
      />
    </Box>
  )

  return (
    <Box>
      <IconButton
        onClick={() => {
          dispatch(setSelectedContactPerson(null))
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
          {renderCreateStep}
        </Box>
      </Dialog>
    </Box>
  )
}

export default SelectOrCreateContactPersonForClient
