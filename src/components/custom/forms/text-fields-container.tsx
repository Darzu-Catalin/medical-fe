import { ReactNode } from 'react'

import { Box, BoxProps } from '@mui/material'

export default function TextFieldsContainer({
  children,
  ...other
}: { children: ReactNode } & Omit<BoxProps, 'component'>) {
  return (
    <Box
      rowGap={3}
      columnGap={3}
      display="grid"
      gridTemplateColumns={{
        xs: 'repeat(1, 1fr)',
        sm: 'repeat(2, 1fr)',
      }}
      {...other}
    >
      {children}
    </Box>
  )
}
