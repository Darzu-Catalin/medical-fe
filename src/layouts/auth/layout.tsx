
import Stack from '@mui/material/Stack'
import Box from '@mui/material/Box'
import { alpha, useTheme } from '@mui/material/styles'

import { bgGradient } from 'src/theme/css'
import dynamic from 'next/dynamic'
import { Outfit } from 'next/font/google'

import Logo from 'src/components/ui/minimals/logo'

// ----------------------------------------------------------------------

type Props = {
  title?: string
  image?: string
  children: React.ReactNode
}

// Logo-like display font (Google Fonts)
const outfit = Outfit({ subsets: ['latin'], weight: ['600', '700', '800'], display: 'swap' })

export default function AuthClassicLayout({ children, image, title }: Props) {
  const theme = useTheme()

  // Avoid SSR for WebGL canvas
  const DarkVeil = dynamic(() => import('src/components/ui/backgrounds/DarkVeil'), {
    ssr: false,
  })

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
        maxWidth: 400,
        ml: { xs: 0, md: 'auto' },
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
      {/* Full-bleed animated background layer (DarkVeil) */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          width: 1,
          height: 1,
          overflow: 'hidden',
          // Fallback gradient while dynamic loads
          backgroundImage: `radial-gradient(1200px 800px at 10% -10%, ${alpha(
            theme.palette.primary.dark,
            0.25
          )} 0%, transparent 60%), radial-gradient(1200px 800px at 110% 110%, ${alpha(
            theme.palette.secondary.dark,
            0.25
          )} 0%, transparent 60%)`,
        }}
      >
        <DarkVeil
          className="darkveil-canvas"
          hueShift={0}
          noiseIntensity={0}
          scanlineIntensity={0.06}
          scanlineFrequency={2.0}
          speed={0.35}
          warpAmount={0.02}
          resolutionScale={1}
        />
      </Box>
      {renderLogo}

      {/* Left decorative panel with centered brand text */}
      <Box
        sx={{
          display: { xs: 'none', md: 'flex' },
          alignItems: 'center',
          justifyContent: 'center',
          flex: '1 1 auto',
          minHeight: '100vh',
          backgroundColor: 'transparent',
          position: 'relative',
          zIndex: 2,
          pr: 2,
          pointerEvents: 'none',
        }}
        aria-hidden
      >
        <Box sx={{ textAlign: 'center' }}>
          <Box
            component="span"
            sx={(theme) => ({
              display: 'inline-block',
              fontWeight: 700,
              letterSpacing: 2,
              fontFamily: outfit.style.fontFamily,
              // responsive size with clamp
              fontSize: 'clamp(36px, 7vw, 96px)',
              lineHeight: 1,
              backgroundImage: `linear-gradient(135deg, ${alpha(theme.palette.common.white, 0.95)} 0%, ${alpha(
                theme.palette.primary.light,
                0.9
              )} 45%, ${alpha(theme.palette.secondary.light, 0.9)} 100%)`,
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent',
              textShadow:
                theme.palette.mode === 'light'
                  ? '0 8px 24px rgba(0,0,0,0.18)'
                  : '0 8px 24px rgba(0,0,0,0.45)',
              filter: 'drop-shadow(0 2px 10px rgba(0,0,0,0.15))',
            })}
          >
            MedTrack
          </Box>
        </Box>
      </Box>

      <Box
        sx={{
          flexGrow: 1,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          // Center on xs, push to  right on md+
          justifyContent: { xs: 'center', md: 'flex-end' },
          backgroundColor: 'transparent',
          position: 'relative',
          zIndex: 2,
          // Provide a comfortable right gutter so the card doesn't hug the edge
          pr: { xs: 3, sm: 4, md: 8 },
          pl: { xs: 2, md: 3 },
        }}
      >
        {renderContent}
      </Box>
    </Stack>
  )
}
