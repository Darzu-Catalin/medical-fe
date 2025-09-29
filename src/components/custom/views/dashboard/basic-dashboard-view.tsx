'use client'

import { ReactNode } from 'react'
import { paths } from '@/routes/paths'
import { RouterLink } from '@/routes/components'
import Iconify from '@/components/ui/minimals/iconify'
import { useSettingsContext } from '@/components/ui/minimals/settings'
import CustomBreadcrumbs from '@/components/ui/minimals/custom-breadcrumbs'
import { useAppSelector } from '@/redux/store'
import { getPathAfterLogin } from '@/config-global'

import Button from '@mui/material/Button'
import Container from '@mui/material/Container'

type Props = {
  children: ReactNode
  heading: string
  links: {
    name: string
    href?: string
  }[]
  button?: {
    name: string
    href?: string
    onClick?: () => void
  }
}

export default function BasicDashboardView({ children, heading, links, button }: Props) {
  const settings = useSettingsContext()
  const userRole = useAppSelector((state) => state.auth.userRole)

  return (
    <Container maxWidth={settings.themeStretch ? 'xl' : 'lg'}>
      <CustomBreadcrumbs
        heading={heading}
        links={[{ name: 'Dashboard', href: getPathAfterLogin(userRole) }, ...links]}
        action={
          button && (
            <Button
              component={RouterLink}
              href={button.href || ''}
              onClick={button.onClick}
              variant="contained"
              color="primary"
              startIcon={<Iconify icon="mingcute:add-line" />}
            >
              {button.name}
            </Button>
          )
        }
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      {children}
    </Container>
  )
}
