import { FormType } from '@/types/types'
import Iconify from '@/components/ui/minimals/iconify'

import Box from '@mui/material/Box'
import LoadingButton from '@mui/lab/LoadingButton'

export default function SubmitButtonForm({
  mode,
  isSubmitting,
  newLabel,
  editLabel,
  isDisabled = false,
}: {
  mode: FormType
  isSubmitting: boolean
  newLabel: string
  editLabel: string
  isDisabled?: boolean
}) {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        mt: 3,
      }}
    >
      <LoadingButton
        type="submit"
        variant="contained"
        color="primary"
        loading={isSubmitting}
        disabled={isDisabled}
      >
        {mode === 'new' ? newLabel : editLabel}
        {mode === 'new' ? (
          <Iconify icon="eva:plus-outline" ml={0.5} mt={0.1} width={18} />
        ) : (
          <Iconify icon="material-symbols:update" ml={0.5} mt={0.1} width={18} />
        )}
      </LoadingButton>
    </Box>
  )
}
