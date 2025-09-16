
import Stack from '@mui/material/Stack'
import Box from '@mui/material/Box'
import { alpha, useTheme } from '@mui/material/styles'

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
        maxWidth: 400,
        px: { xs: 4, md: 4 },
        py: { xs: 4, md: 4 },
        justifyContent: 'center',
        borderRadius: 4,
        // iOS-like fluid glass effect
        background:
          'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.04) 100%)',
        backdropFilter: 'blur(18px) saturate(140%)',
        WebkitBackdropFilter: 'blur(18px) saturate(140%)',
        border: `1px solid ${alpha(theme.palette.common.white, theme.palette.mode === 'light' ? 0.18 : 0.12)}`,
        boxShadow:
          theme.palette.mode === 'light'
            ? '0 10px 30px rgba(0,0,0,0.12)'
            : '0 10px 30px rgba(0,0,0,0.32)',
        // Subtle inner highlight at the top
        position: 'relative',
        '&:before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 1,
          backgroundColor: alpha(theme.palette.common.black, 0.2),
          borderRadius: 4,
          pointerEvents: 'none',
        },
      }}
    >
      {children}
    </Stack>
  )

  return (
    <Stack
      component="main"
      direction="row"
      sx={{
        minHeight: '100vh',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Full-bleed background layer */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          width: 1,
          height: 1,
          ...bgGradient({
            color: alpha(
              theme.palette.background.default,
              theme.palette.mode === 'light' ? 0.0 : 0.0
            ),
            imgUrl: `/assets/background/medical_background.png`,
          }),
        }}
      />
      {renderLogo}

      <Box
        sx={{
          flexGrow: 1,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'transparent',
          position: 'relative',
          zIndex: 2,
          px: { xs: 2, md: 3 },
        }}
      >
        {renderContent}
      </Box>
    </Stack>
  )
}
