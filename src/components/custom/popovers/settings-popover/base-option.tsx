import SvgColor from '@/components/ui/minimals/svg-color'

import Stack from '@mui/material/Stack'
import { Typography } from '@mui/material'
import { alpha } from '@mui/material/styles'
import ButtonBase from '@mui/material/ButtonBase'

// ----------------------------------------------------------------------

type Props = {
  icons?: string[]
  options: string[]
  value: string
  labels?: string[]
  onChange: (newValue: string) => void
}

export default function BaseOptions({ icons, options, value, onChange, labels }: Props) {
  return (
    <Stack direction="row" spacing={1.5}>
      {options.map((option, index) => {
        const selected = value === option

        return (
          <ButtonBase
            key={option}
            onClick={() => onChange(option)}
            sx={{
              width: 1,
              height: 45,
              borderRadius: 10,
              border: (theme) => `solid 1px ${alpha(theme.palette.grey[500], 0.08)}`,
              '& .svg-color': {
                background: (theme) =>
                  `linear-gradient(135deg, ${theme.palette.grey[500]} 0%, ${theme.palette.grey[600]} 100%)`,
                ...(selected &&
                  option === 'light' && {
                  background: (theme) =>
                    `linear-gradient(135deg, ${theme.palette.warning.light} 0%, ${theme.palette.warning.main} 100%)`,
                }),
                ...(selected &&
                  option === 'dark' && {
                  background: (theme) =>
                    `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                }),
              },
            }}
          >
            <>
              {icons ? <SvgColor src={`/assets/icons/setting/ic_${index === 0 ? icons[0] : icons[1]}.svg`} /> : null}
              {
                labels ? <Typography key={
                  `${option + index  }label`
                } variant="body2" sx={{
                  fontSize: 12,
                  color: selected ? 'primary.main' : 'text.secondary'
                }}>
                  {labels[index]}
                </Typography>
                  : null
              }
            </>
          </ButtonBase>
        )
      })}
    </Stack>
  )
}


