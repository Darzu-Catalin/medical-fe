import { m } from 'framer-motion'
import { userCan } from '@/utils/permissions.utils'

import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
// @mui
import { Theme, SxProps } from '@mui/material/styles'

// assets
import { ForbiddenIllustration } from 'src/assets/illustrations'

// components
import { varBounce, MotionContainer } from 'src/components/ui/minimals/animate'

// ----------------------------------------------------------------------

type RoleBasedGuardProp = {
  hasContent?: boolean
  permissions?: string[]
  children: React.ReactNode
  sx?: SxProps<Theme>
}

export default function RoleBasedGuard({
  hasContent,
  permissions,
  children,
  sx,
}: RoleBasedGuardProp) {
  // Logic here to get current user.requests.ts role

  if (typeof permissions !== 'undefined' && !userCan(permissions)) {
    return hasContent ? (
      <Container component={MotionContainer} sx={{ textAlign: 'center', ...sx }}>
        <m.div variants={varBounce().in}>
          <Typography variant="h3" paragraph>
            Permission Denied
          </Typography>
        </m.div>

        <m.div variants={varBounce().in}>
          <Typography sx={{ color: 'text.secondary' }}>
            You do not have permission to access this page
          </Typography>
        </m.div>

        <m.div variants={varBounce().in}>
          <ForbiddenIllustration
            sx={{
              height: 260,
              my: { xs: 5, sm: 10 },
            }}
          />
        </m.div>
      </Container>
    ) : null
  }

  return <> {children} </>
}
