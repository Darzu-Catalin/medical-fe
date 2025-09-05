// @mui
// routes
import { paths } from '@/routes/paths'
import { RouterLink } from '@/routes/components'

import Button from '@mui/material/Button'
import { Theme, SxProps } from '@mui/material/styles'
// ----------------------------------------------------------------------

type Props = {
  sx?: SxProps<Theme>
}

export default function LoginButton({ sx }: Props) {
  const loginPath = paths.auth.login

  return (
    <Button component={RouterLink} href={loginPath} variant="outlined" sx={{ mr: 1, ...sx }}>
      Login
    </Button>
  )
}
