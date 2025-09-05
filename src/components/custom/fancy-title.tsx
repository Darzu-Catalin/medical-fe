// @mui
import { Typography } from '@mui/material'
import { TypographyProps } from '@mui/system'
import Box, { BoxProps } from '@mui/material/Box'

// ----------------------------------------------------------------------

export interface FancyTitleProps {
  title: string
  subtitle: string
  titleSx?: TypographyProps
  subtitleSx?: TypographyProps
  sx?: BoxProps
  textAling?: 'left' | 'center' | 'right'
}
export default function FancyTitle({
  sx,
  title,
  subtitle,
  titleSx,
  subtitleSx,
  textAling = 'left',
}: FancyTitleProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'flex-start',
        ...sx,
      }}
    >
      <Typography
        sx={{
          fontWeight: 'bold',
          textAlign: textAling,
          fontSize: 38,
          color: 'text.primary',
          ...titleSx,
        }}
      >
        {title}
      </Typography>
      <Typography
        sx={{
          mt: -1,
          fontWeight: '300',
          textAlign: textAling,

          fontSize: 18,
          color: 'text.secondary',
          ...subtitleSx,
        }}
      >
        {subtitle}
      </Typography>
    </Box>
  )
}
