import { m } from 'framer-motion'
import Iconify from '@/components/ui/minimals/iconify'
import { varHover } from '@/components/ui/minimals/animate'
import { useAppDispatch } from '@/redux/store'
import { useSettingsContext } from '@/components/ui/minimals/settings'
import BaseOptions from '@/components/custom/popovers/settings-popover/base-option'
import CustomPopover, { usePopover } from '@/components/ui/minimals/custom-popover'
import StretchOptions from '@/components/custom/popovers/settings-popover/stretch-options'

import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import Tooltip from '@mui/material/Tooltip'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import LayoutOptions from './layout-options'

// ----------------------------------------------------------------------

export default function SettingsPopover() {
  const popover = usePopover()
  const settings = useSettingsContext()
  const dispatch = useAppDispatch()
  const labelStyles = {
    mb: 1,
    color: 'text.disabled',
    fontWeight: 'fontWeightSemiBold',
  }

  const renderMode = (
    <div>
      <Typography variant="caption" component="div" sx={{ ...labelStyles }}>
        Mode
      </Typography>

      <BaseOptions
        value={settings.themeMode}
        onChange={(newValue: string) => settings.onUpdate('themeMode', newValue)}
        options={['light', 'dark']}
        icons={['sun', 'moon']}
      />
    </div>
  )

  const renderLayout = (
    <div>
      <Typography variant="caption" component="div" sx={{ ...labelStyles }}>
        Layout
      </Typography>

      <LayoutOptions
        value={settings.themeLayout}
        onChange={(newValue: string) => settings.onUpdate('themeLayout', newValue)}
        options={['vertical', 'horizontal']}
      />
    </div>
  );


  const renderStretch = (
    <div>
      <Typography
        variant="caption"
        component="div"
        sx={{
          ...labelStyles,
          display: 'inline-flex',
          alignItems: 'center',
        }}
      >
        Stretch
        <Tooltip title="Only available at large resolutions > 1600px (xl)">
          <Iconify icon="eva:info-outline" width={16} sx={{ ml: 0.5 }} />
        </Tooltip>
      </Typography>

      <StretchOptions
        value={settings.themeStretch}
        onChange={() => settings.onUpdate('themeStretch', !settings.themeStretch)}
      />
    </div>
  )

  return (
    <>
      <Box
        component={m.div}
        animate={{
          rotate: [0, popover.open ? 0 : 360],
        }}
        transition={{
          duration: 12,
          ease: 'linear',
          repeat: Infinity,
        }}
      >
        <IconButton
          component={m.button}
          whileTap="tap"
          whileHover="hover"
          variants={varHover(1.05)}
          onClick={popover.onOpen}
          sx={{
            width: 40,
            height: 40,
          }}
        >
          <Iconify icon="solar:settings-bold-duotone" width={36} height={36} />
        </IconButton>
      </Box>

      <CustomPopover open={popover.open} onClose={popover.onClose} sx={{ width: 200, p: 0 }}>
        <Box sx={{ p: 2, pb: 1.5 }}>
          <Typography variant="subtitle2" noWrap>
            Settings
          </Typography>
        </Box>

        <Divider sx={{ borderStyle: 'dashed' }} />

        <Box sx={{ px: 2, pt: 1.5, pb: 2.5 }}>{renderMode}</Box>
        <Box sx={{ px: 2, pt: 1.5, pb: 2.5 }}>{renderLayout}</Box>
        <Divider sx={{ borderStyle: 'dashed' }} />


        <Box sx={{ px: 2, pt: 1.5, pb: 2.5 }}>{renderStretch}</Box>
      </CustomPopover>
    </>
  )
}
