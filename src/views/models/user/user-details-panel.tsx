import { useAppSelector } from '@/redux/store'
import { fDateTime } from '@/utils/format-time'
import DetailsPanel from '@/components/custom/forms/details-panel'

import TextField from '@mui/material/TextField'

export default function UserDetailsPanel() {
  const user = useAppSelector((state) => state.users.selectedUser)

  return (
    <DetailsPanel title="Detalii Utilizator">
      <TextField
        disabled
        label="Creat la"
        value={user?.created_at ? fDateTime(user?.created_at) : '-'}
      />
      <TextField
        disabled
        label="Actualizat la"
        value={user?.updated_at ? fDateTime(user?.updated_at) : '-'}
      />
      <TextField
        disabled
        label="Șters la"
        value={user?.deleted_at ? fDateTime(user?.deleted_at) : '-'}
      />
      <TextField disabled label="A evaluat aplicația" value={user?.has_rated_app ? 'Da' : 'Nu'} />
    </DetailsPanel>
  )
}
