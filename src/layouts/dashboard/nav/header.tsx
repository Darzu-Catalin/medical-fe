import { bgBlur } from '@/theme/css'
import { useResponsive } from '@/hooks/use-responsive'
import SvgColor from '@/components/ui/minimals/svg-color'
import { useSettingsContext } from '@/components/ui/minimals/settings'
import AccountPopover from '@/components/custom/popovers/account-popover'
import SettingsPopover from '@/components/custom/popovers/settings-popover/settings-popover'

import Stack from '@mui/material/Stack'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import { useTheme } from '@mui/material/styles'
import IconButton from '@mui/material/IconButton'

import { useOffSetTop } from '@/hooks/use-off-set-top'
import Logo from '@/components/ui/minimals/logo'
import { Container } from '@mui/material'
import { NAV, HEADER } from '../../config-layout'
import Searchbar from '../../../components/custom/searchbar'

// ----------------------------------------------------------------------

type Props = {
  onOpenNav?: VoidFunction
}

export default function Header({ onOpenNav }: Props) {
  const theme = useTheme()

  const settings = useSettingsContext()

  const isNavMini = settings.themeLayout === 'mini'
  const isNavHorizontal = settings.themeLayout === 'horizontal';

  const lgUp = useResponsive('up', 'lg');

  const offset = useOffSetTop(HEADER.H_DESKTOP);
  const offsetTop = offset && !isNavHorizontal;
  const renderContent = (
    <>
      {lgUp && isNavHorizontal && <Logo sx={{ mr: 2.5 }} />}

      {!lgUp && (
        <IconButton onClick={onOpenNav}>
          <SvgColor src="/assets/icons/navbar/ic_menu_item.svg" />
        </IconButton>
      )}

      <Searchbar />

      <Stack
        flexGrow={1}
        direction="row"
        alignItems="center"
        justifyContent="flex-end"
        spacing={{ xs: 0.5, sm: 1 }}
      >
        <SettingsPopover />
        <AccountPopover />
      </Stack>
    </>
  )

  return (
    <AppBar
      sx={{
        height: HEADER.H_MOBILE,
        zIndex: theme.zIndex.appBar + 1,
        ...bgBlur({
          color: theme.palette.background.default,
        }),
        transition: theme.transitions.create(['height'], {
          duration: theme.transitions.duration.shorter,
        }),
        ...(lgUp && {
          width: `calc(100% - ${NAV.W_VERTICAL + 1}px)`,
          height: HEADER.H_DESKTOP,
          ...(offsetTop && {
            height: HEADER.H_DESKTOP_OFFSET,
          }),
          ...(isNavHorizontal && {
            width: 1,
            bgcolor: 'background.default',
            height: HEADER.H_DESKTOP_OFFSET,
            borderBottom: `dashed 1px ${theme.palette.divider}`,
          }),
          ...(isNavMini && {
            width: `calc(100% - ${NAV.W_MINI + 1}px)`,
          }),
        }),
      }}
    >
      <Toolbar
        sx={{
          height: 1,
          px: { lg: 5 },
        }}
      >
        <Container 
        sx={{
          display: 'flex',
        }}
        maxWidth={settings.themeStretch ? 'xl' : 'lg'}>
          {renderContent}
        </Container>
      </Toolbar>
    </AppBar>
  )
}
