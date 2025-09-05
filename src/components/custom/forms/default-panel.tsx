import { ReactNode } from 'react'
import Iconify from '@/components/ui/minimals/iconify'
import { formPadding } from '@/components/custom/forms/constants'

import Box from '@mui/material/Box'
import { Card } from '@mui/material'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'

export default function DefaultPanel({
  title,
  tooltipTitle,
  children,
}: {
  title: string
  tooltipTitle?: string
  children: ReactNode
}) {
  return (
    <Card sx={{ p: formPadding }} title={title}>
      {/* Optimize DOM tree */}
      {tooltipTitle ? (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h6">{title}</Typography>
          <Tooltip title={tooltipTitle}>
            <Iconify icon="eva:info-outline" width={22} sx={{ color: 'text.disabled' }} />
          </Tooltip>
        </Box>
      ) : (
        <Typography variant="h6" sx={{ mb: 3 }}>
          {title}
        </Typography>
      )}
      {children}
    </Card>
  )
}
