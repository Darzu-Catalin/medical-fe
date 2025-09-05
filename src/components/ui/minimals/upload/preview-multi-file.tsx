/* eslint-disable import/no-cycle */
import { m, AnimatePresence } from 'framer-motion'

import Stack from '@mui/material/Stack'
import { alpha } from '@mui/material/styles'
import IconButton from '@mui/material/IconButton'
import ListItemText from '@mui/material/ListItemText'
import { Box, TextField, Autocomplete } from '@mui/material'

import { fData } from 'src/utils/format-number'

import Iconify from '../iconify'
import { varFade } from '../animate'
import { UploadProps } from './types'
import FileThumbnail from '../file-thumbnail'

// ----------------------------------------------------------------------

export default function MultiFilePreview({ setFiles, thumbnail, files, withLabels, onRemove, sx }: UploadProps) {
  return (
    <AnimatePresence initial={false}>
      {files?.map((file) => {

        if (thumbnail) {
          return (
            <Stack
              key={file.id}
              component={m.div}
              {...varFade().inUp}
              alignItems="center"
              display="inline-flex"
              justifyContent="center"
              sx={{
                m: 0.5,
                width: 80,
                height: 80,
                borderRadius: 1.25,
                overflow: 'hidden',
                position: 'relative',
                border: (theme) => `solid 1px ${alpha(theme.palette.grey[500], 0.16)}`,
                ...sx,
              }}
            >
              <FileThumbnail
                tooltip
                imageView
                file={file}
                sx={{ position: 'absolute' }}
                imgSx={{ position: 'absolute' }}
              />

              {onRemove && (
                <IconButton
                  size="small"
                  onClick={() => onRemove(file)}
                  sx={{
                    p: 0.5,
                    top: 4,
                    right: 4,
                    position: 'absolute',
                    color: 'common.white',
                    bgcolor: (theme) => alpha(theme.palette.grey[900], 0.48),
                    '&:hover': {
                      bgcolor: (theme) => alpha(theme.palette.grey[900], 0.72),
                    },
                  }}
                >
                  <Iconify icon="mingcute:close-line" width={14} />
                </IconButton>
              )}
            </Stack>
          )
        }

        return (
          <Stack
            key={file.id}
            component={m.div}
            {...varFade().inUp}
            spacing={2}
            direction="row"
            alignItems="center"
            sx={{
              my: 1,
              py: 1,
              px: 1.5,
              borderRadius: 1,
              border: (theme) => `solid 1px ${alpha(theme.palette.grey[500], 0.16)}`,
              ...sx,
            }}
          >
            <FileThumbnail file={file} />


            <Box sx={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <ListItemText
                primary={file.name}
                secondary={file.size ? fData(file.size) : ''}
                secondaryTypographyProps={{
                  component: 'span',
                  typography: 'caption',
                }}

              />

              {withLabels ? <Autocomplete
                sx={{
                  minWidth: 220,
                  maxWidth: 240,
                }}
                // @ts-ignore
                options={withLabels}
                getOptionLabel={(option) => option.label}
                defaultValue={withLabels?.find((l) => l.value === file.label) || null}
                renderInput={(params) => (
                  <TextField {...params} variant="outlined"
                    placeholder="Label"
                    size='small'
                    InputLabelProps={{ shrink: false }}
                  />
                )}
                onChange={(event, newValue) => {
                  if (!setFiles) return

                  const updatedFiles = files.map((f) => {
                    if (f.id === file.id) {
                      return { ...f, label: newValue?.value || "other" }
                    }
                    return f
                  })

                  setFiles(updatedFiles)

                }}
              /> : null}

            </Box>

            {onRemove && (
              <IconButton size="small" onClick={() => onRemove(file)}>
                <Iconify icon="mingcute:close-line" width={16} />
              </IconButton>
            )}
          </Stack>
        )
      })}
    </AnimatePresence>
  )
}
