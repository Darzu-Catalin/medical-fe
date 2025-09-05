import { useState } from 'react'
import { useAppSelector } from '@/redux/store'
import Iconify from '@/components/ui/minimals/iconify'
import { upsertWorkplace } from '@/requests/admin/workplace.requests'
import AddEditWorkplaceModel from '@/views/models/workplace/upsert-workplace'

import { Box, Dialog, IconButton } from '@mui/material'

const SelectOrCreateWorkplaceForClient = () => {
  const selectedPartner = useAppSelector((state) => state.general.selectedPartner)
  const [addNewModalVisible, setAddNewModalVisible] = useState(false)
  const [step, setStep] = useState<'pick' | 'select' | 'create'>('pick')

  const renderCreateStep = (
    <Box>
      <AddEditWorkplaceModel
        onSubmitSuccess={() => {}}
        updater={(e: any) => upsertWorkplace({
            ...e,
            partner_id: selectedPartner?.id
          })
        }
      />
    </Box>
  )

  return (
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
            width: '100%',
          },
        }}
        fullScreen
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
          {step !== 'pick' ? (
            <IconButton
              onClick={() => {
                setStep('pick')
              }}
            >
              <Iconify icon="mdi:arrow-left" />
            </IconButton>
          ) : (
            <Box />
          )}
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

export default SelectOrCreateWorkplaceForClient
