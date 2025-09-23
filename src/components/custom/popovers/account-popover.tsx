'use client'

import { m } from 'framer-motion'
import { paths } from '@/routes/paths'
import { useSnackbar } from 'notistack'
import { useRouter } from '@/routes/hooks'
import { logoutAsync, recalculateUserRole } from '@/redux/slices/auth'
import { varHover } from '@/components/ui/minimals/animate'
import { useAppDispatch, useAppSelector } from '@/redux/store'
import { userCan, PERMISSIONS } from '@/utils/permissions.utils'
import { getUserAvatar, getUserDisplayName } from '@/utils/user'
import { getRoleColor, getRoleDisplayName } from '@/utils/role.utils'
import CustomPopover, { usePopover } from '@/components/ui/minimals/custom-popover'
import { useEffect } from 'react'

import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import Avatar from '@mui/material/Avatar'
import Divider from '@mui/material/Divider'
import { alpha } from '@mui/material/styles'
import MenuItem from '@mui/material/MenuItem'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'

// Material Icons
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings'
import LocalHospitalIcon from '@mui/icons-material/LocalHospital'
import PersonIcon from '@mui/icons-material/Person'

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
  const userRole = useAppSelector((state) => state.auth.userRole)

  const { enqueueSnackbar } = useSnackbar()

  const dispatch = useAppDispatch()
  const popover = usePopover()

  // Recalculate user role on component mount if user exists but role is patient
  useEffect(() => {
    if (user && userRole === 'patient') {
      // Check if user actually has a different role in their data
      const roles = user.roles
      if (roles && Array.isArray(roles) && roles.length > 0) {
        const firstRole = roles[0].toLowerCase()
        if (firstRole.includes('doctor') || firstRole.includes('admin')) {
          dispatch(recalculateUserRole())
        }
      }
    }
  }, [user, userRole, dispatch])

  const roleColor = getRoleColor(userRole)
  const roleDisplayName = getRoleDisplayName(userRole)

  // Get appropriate icon for role
  const getRoleIconComponent = () => {
    switch (userRole) {
      case 'admin':
        return <AdminPanelSettingsIcon sx={{ fontSize: 16 }} />
      case 'doctor':
        return <LocalHospitalIcon sx={{ fontSize: 16 }} />
      case 'patient':
        return <PersonIcon sx={{ fontSize: 16 }} />
      default:
        return <PersonIcon sx={{ fontSize: 16 }} />
    }
  }

  const handleLogout = async () => {
    try {
      const action = await dispatch(logoutAsync())
      popover.onClose()
      if (logoutAsync.rejected.match(action)) {
        // Even on API failure, we cleared local auth – navigate to login
        router.replace(paths.auth.login)
        return
      }
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

      <CustomPopover open={popover.open} onClose={popover.onClose} sx={{ width: 220, p: 0 }}>
        <Box sx={{ p: 2, pb: 1.5 }}>
          <Typography variant="subtitle2" noWrap>
            {getUserDisplayName(user)}
          </Typography>

          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }} noWrap>
            {user?.email}
          </Typography>

          {/* Professional Role Badge */}
          <Chip
            icon={getRoleIconComponent()}
            label={roleDisplayName}
            size="small"
            variant="outlined"
            sx={{
              height: 24,
              fontSize: '0.75rem',
              fontWeight: 600,
              borderColor: alpha(roleColor, 0.24),
              color: roleColor,
              backgroundColor: alpha(roleColor, 0.08),
              '& .MuiChip-icon': {
                color: roleColor,
              },
              '& .MuiChip-label': {
                px: 1,
              },
            }}
          />
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
