import { bgBlur } from '@/theme/css'
import { useAppSelector } from '@/redux/store'
import { HEADER } from '@/layouts/config-layout'
import { useResponsive } from '@/hooks/use-responsive'
import LoginButton from '@/components/custom/login-button'
import ThemeModeButton from '@/components/custom/theme-mode-button'
import AccountPopover from '@/components/custom/popovers/account-popover'

import Stack from '@mui/material/Stack'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import { useTheme } from '@mui/material/styles'

export default function NavLandingPage() {
  const user = useAppSelector((state) => state.auth.user)

  const theme = useTheme()

  const lgUp = useResponsive('up', 'lg')

  const renderContent = (
    <Stack
      flexGrow={1}
      direction="row"
      alignItems="center"
      justifyContent="flex-end"
      spacing={{ xs: 0.5, sm: 1 }}
    >
      <ThemeModeButton />
      {user ? <AccountPopover /> : <LoginButton />}
    </Stack>
  )

  return (
    <AppBar
      sx={{
        width: 1,
        height: HEADER.H_MOBILE,
        zIndex: theme.zIndex.appBar + 1,
        ...bgBlur({
          color: theme.palette.background.default,
        }),
        transition: theme.transitions.create(['height'], {
          duration: theme.transitions.duration.shorter,
        }),
        bgcolor: 'background.default',
        borderBottom: `dashed 1px ${theme.palette.divider}`,
        ...(lgUp && {
          height: HEADER.H_DESKTOP,
        }),
      }}
    >
      <Toolbar
        sx={{
          height: 1,
          px: { lg: 5 },
        }}
      >
        {renderContent}
      </Toolbar>
    </AppBar>
  )
}
