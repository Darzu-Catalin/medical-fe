import { useMemo, useState } from 'react'
import { enqueueSnackbar } from 'notistack'
import Iconify from '@/components/ui/minimals/iconify'
import DefaultPanel from '@/components/custom/forms/default-panel'
import { formMargin, formSpacing } from '@/components/custom/forms/constants'

import { LoadingButton } from '@mui/lab'
import { Stack, TextField } from '@mui/material'

import { useAppSelector } from 'src/redux/store'

// ----------------------------------------------------------------------

export default function UserNotificationsPanel() {
  const [isSending, setIsSending] = useState(false)

  const selectedUserTokens = useAppSelector((state) => state.users.selectedUserTokens)

  const selectedUser = useAppSelector((state) => state.users.selectedUser)

  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')

  const canSendNotification = useMemo(
    () => selectedUserTokens.some((token) => token.notificationToken),
    [selectedUserTokens]
  )

  if (!selectedUser?.id) {
    return null
  }

  const onSendNotification = async () => {
    if (!selectedUser?.id) {
      enqueueSnackbar('Utilizatorul nu a fost găsit', { variant: 'error' })
      return
    }

    setIsSending(true)
    // const res = await sendExpoPushNotificationRequest({
    //   title,
    //   body,
    //   userId: selectedUser?.id,
    // })

    // setIsSending(false)
    // if (res.error) {
    //   enqueueSnackbar(res.error, { variant: 'error' })
    //   return
    // }

    enqueueSnackbar('Notificare trimisă', { variant: 'success' })
    setTitle('')
    setBody('')
  }

  return (
    <DefaultPanel title="Notifică Utilizatorul">
      <Stack spacing={formSpacing}>
        <TextField
          fullWidth
          label="Titlu"
          variant="outlined"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <TextField
          fullWidth
          label="Mesaj"
          variant="outlined"
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />
      </Stack>

      <Stack alignItems="flex-end" sx={{ mt: formMargin }}>
        <LoadingButton
          color="primary"
          onClick={onSendNotification}
          variant="contained"
          disabled={!canSendNotification}
          loading={isSending}
        >
          Trimite
          <Iconify icon="eva:paper-plane-outline" width={18} ml={0.5} />
        </LoadingButton>
      </Stack>
    </DefaultPanel>
  )
}
