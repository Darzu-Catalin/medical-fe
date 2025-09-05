import { useBoolean } from '@/hooks/use-boolean'
import Logo from '@/components/ui/minimals/logo'
import { useResponsive } from '@/hooks/use-responsive'
import { useSettingsContext } from '@/components/ui/minimals/settings'
import LanguagePopover from '@/components/language-popover/language-popover'

import Box from '@mui/material/Box'



// ----------------------------------------------------------------------

type Props = {
  children: React.ReactNode
}

const SPACING = 8

export default function FormLayout({ children }: Props) {
  const settings = useSettingsContext()
  const lgUp = useResponsive('up', 'lg')
  const nav = useBoolean()

  return (
    <Box sx={{
      backgroundImage: "radial-gradient(#eee 1px, transparent 0)",
      backgroundSize: "20px 20px",
      backgroundPosition: "-19px -19px"
    }}>
      {/* <Header onOpenNav={nav.onTrue} /> */}
      <Box
        sx={{
          minHeight: 1,
          display: 'flex',
          p: 3,
          maxWidth: 600,
          margin: 'auto',
          flexDirection: 'column',

        }}
      >
        <Box sx={{
          mb: 3,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}><Logo
            href='#'
          />
          <LanguagePopover />
        </Box>

        {children}
      </Box>
    </Box>
  )
}
