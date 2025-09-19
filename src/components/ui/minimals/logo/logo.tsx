import { forwardRef } from 'react'
import { RouterLink } from '@/routes/components'

import Link from '@mui/material/Link'
import Box, { BoxProps } from '@mui/material/Box'

// ----------------------------------------------------------------------

export interface LogoProps extends BoxProps {
  disabledLink?: boolean,
  href?: string
}

const Logo = forwardRef<HTMLDivElement, LogoProps>(
  ({ disabledLink = false, sx, href = "/",  ...other }, ref) => {


    const logo = (
      <Box
        component="img"
        src="/logo/med_logo.png"
        sx={{ width: 40, height: 40, cursor: 'pointer', ...sx }}
      />
    )

    if (disabledLink) {
      return logo
    }

    return (
      <Link component={RouterLink} href={href} sx={{ display: 'contents' }}>
        {logo}
      </Link>
    )
  }
)

export default Logo
