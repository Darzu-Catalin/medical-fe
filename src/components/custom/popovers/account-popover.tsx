'use client'

import { m } from 'framer-motion'
import { paths } from '@/routes/paths'
import { useSnackbar } from 'notistack'
import { useRouter } from '@/routes/hooks'
import { logoutAsync } from '@/redux/slices/auth'
import { varHover } from '@/components/ui/minimals/animate'
import { useAppDispatch, useAppSelector } from '@/redux/store'
import { userCan, PERMISSIONS } from '@/utils/permissions.utils'
import { getUserAvatar, getUserDisplayName } from '@/utils/user'
import CustomPopover, { usePopover } from '@/components/ui/minimals/custom-popover'

import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Avatar from '@mui/material/Avatar'
import Divider from '@mui/material/Divider'
import { alpha } from '@mui/material/styles'
import MenuItem from '@mui/material/MenuItem'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'

// ----------------------------------------------------------------------

const OPTIONS = [
  {
    label: 'Home',
    linkTo: paths.app.root,
  },
]

// ----------------------------------------------------------------------

export default function AccountPopover() {
  const router = useRouter()

  const user = useAppSelector((state) => state.auth.user)

  const { enqueueSnackbar } = useSnackbar()

  const dispatch = useAppDispatch()
  const popover = usePopover()

  const handleLogout = async () => {
    try {
      dispatch(logoutAsync())
      popover.onClose()
      router.replace('/')
    } catch (error) {
      enqueueSnackbar('Unable to logout!', { variant: 'error' })
    }
  }

  const handleClickItem = (path: string) => {
    popover.onClose()
    router.push(path)
  }

  return (
    <>
      <IconButton
        component={m.button}
        whileTap="tap"
        whileHover="hover"
        variants={varHover(1.05)}
        onClick={popover.onOpen}
        sx={{
          width: 40,
          height: 40,
          background: (theme) => alpha(theme.palette.grey[500], 0.08),
          ...(popover.open && {
            background: (theme) =>
              `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`,
          }),
        }}
      >
        <Avatar
          src={getUserAvatar(user)}
          alt={getUserDisplayName(user)}
          sx={{
            width: 36,
            height: 36,
            border: (theme) => `solid 2px ${theme.palette.background.default}`,
          }}
        >
          {getUserDisplayName(user).charAt(0).toUpperCase()}
        </Avatar>
      </IconButton>

      <CustomPopover open={popover.open} onClose={popover.onClose} sx={{ width: 200, p: 0 }}>
        <Box sx={{ p: 2, pb: 1.5 }}>
          <Typography variant="subtitle2" noWrap>
            {getUserDisplayName(user)}
          </Typography>

          <Typography variant="body2" sx={{ color: 'text.secondary' }} noWrap>
            {user?.email}
          </Typography>
        </Box>

        <Divider sx={{ borderStyle: 'dashed' }} />

        <Stack sx={{ p: 1 }}>
          {userCan(PERMISSIONS.ALL_PERMISSIONS) ? (
            <MenuItem onClick={() => handleClickItem(paths.dashboard.root)}>Dashboard</MenuItem>
          ) : null}
          {OPTIONS.map((option) => (
            <MenuItem key={option.label} onClick={() => handleClickItem(option.linkTo)}>
              {option.label}
            </MenuItem>
          ))}
        </Stack>

        <Divider sx={{ borderStyle: 'dashed' }} />

        <MenuItem
          onClick={handleLogout}
          sx={{ m: 1, fontWeight: 'fontWeightBold', color: 'error.main' }}
        >
          Logout
        </MenuItem>
      </CustomPopover>
    </>
  )
}
