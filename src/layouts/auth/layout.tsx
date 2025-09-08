
import Stack from '@mui/material/Stack'
import { alpha, useTheme } from '@mui/material/styles'

import { useResponsive } from 'src/hooks/use-responsive'

import { bgGradient } from 'src/theme/css'

import Logo from 'src/components/ui/minimals/logo'

// ----------------------------------------------------------------------

type Props = {
  title?: string
  image?: string
  children: React.ReactNode
}

export default function AuthClassicLayout({ children, image, title }: Props) {
  const theme = useTheme()

  const mdUp = useResponsive('up', 'md')
  const renderLogo = (
    <Logo
      sx={{
        zIndex: 9,
        position: 'absolute',
        m: { xs: 2, md: 5 },
      }}
    />
  )

  const renderContent = (
    <Stack
      sx={{
        width: 1,
        mx: 'auto',
        maxWidth: 480,
        px: { xs: 2, md: 8 },
        pt: { xs: 15, md: 20 },
        pb: { xs: 15, md: 0 },
      }}
    >
      {children}
    </Stack>
  )

  const renderSection = (
    <Stack
      flexGrow={1}
      spacing={10}
      alignItems="center"
      justifyContent="center"
      sx={{
        ...bgGradient({
          color: alpha(
            theme.palette.background.default,
            theme.palette.mode === 'light' ? 0.0 : 0.0
          ),
          imgUrl: `/assets/background/medical_background.png`,
        }),
      }}
    />
  )

  return (
    <Stack
      component="main"
      direction="row"
      sx={{
        minHeight: '100vh',
      }}
    >
      {renderLogo}

      {mdUp && renderSection}

      {renderContent}
    </Stack>
  )
}
