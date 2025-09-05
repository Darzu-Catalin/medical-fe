import { useAppDispatch, useAppSelector } from '@/redux/store'
import { getUserAvatar, getUserDisplayName } from '@/utils/user'

import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Avatar from '@mui/material/Avatar'
import Typography from '@mui/material/Typography'

import Label from 'src/components/ui/minimals/label'
import Iconify from 'src/components/ui/minimals/iconify'

// ----------------------------------------------------------------------

export default function NavUpgrade() {
  const user = useAppSelector((state) => state.auth.user)
  const dispatch = useAppDispatch()
  return (
    <Stack
      sx={{
        px: 2,
        py: 5,
        textAlign: 'center',
      }}
    >
      <Stack alignItems="center">
        <Box sx={{ position: 'relative' }}>
          <Avatar
            src={getUserAvatar(user)}
            alt={getUserDisplayName(user)}
            sx={{ width: 48, height: 48 }}
          />
          <Label
            color="primary"
            variant="filled"
            sx={{
              top: -6,
              px: 0.5,
              left: 40,
              height: 20,
              position: 'absolute',
              borderBottomLeftRadius: 2,
            }}
          >
            <Iconify icon="bx:happy-beaming" width={15} height={15} />
          </Label>
        </Box>

        <Stack spacing={0.5} sx={{ mt: 1.5, mb: 2 }}>
          <Typography variant="subtitle2" noWrap>
            {getUserDisplayName(user)}
          </Typography>

          <Typography variant="body2" noWrap sx={{ color: 'text.disabled' }}>
            {user?.email}
          </Typography>

          <Typography
            variant="subtitle2" style={{
              opacity: 0.3
            }} noWrap>
            {/* TODO UPDATE WITH REAL ROLE */}
            1.65.2
          </Typography>


         
        </Stack>
      </Stack>
    </Stack>
  )
}
