import Image from 'next/image'
import { useDropzone } from 'react-dropzone'

import Box from '@mui/material/Box'
import { IconButton } from '@mui/material'
import { alpha } from '@mui/material/styles'

import Iconify from '../iconify'
import { UploadProps } from './types'

// ----------------------------------------------------------------------

export default function UploadBox({ placeholder, error, disabled, file, onDelete, sx, ...other }: UploadProps) {
  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    disabled: disabled || Boolean(file),
    ...other,
  })

  const hasError = isDragReject || error

  return <Box
    {...getRootProps()}
    sx={{
      m: 0.5,
      width: 84,
      height: 84,
      flexShrink: 0,
      display: 'flex',
      borderRadius: 1,
      cursor: 'pointer',
      alignItems: 'center',
      color: 'text.disabled',
      justifyContent: 'center',
      bgcolor: (theme) => alpha(theme.palette.grey[500], 0.08),
      border: (theme) => `dashed 1px ${alpha(theme.palette.grey[500], 0.16)}`,
      ...(isDragActive && {
        opacity: 0.72,
      }),
      ...(disabled && {
        opacity: 0.48,
        pointerEvents: 'none',
      }),
      ...(hasError && {
        color: 'error.main',
        borderColor: 'error.main',
        bgcolor: (theme) => alpha(theme.palette.error.main, 0.08),
      }),
      '&:hover': {
        opacity: 0.72,
      },
      ...sx,
    }}
  >
    <input {...getInputProps()} />
    {
      file ? (
        <FilePreview file={file} onDelete={onDelete} sx={sx} />
      ) : (
        placeholder || <Iconify icon="eva:cloud-upload-fill" width={28} />
      )
    }
  </Box>
}


const FilePreview = ({ file, onDelete, sx, ...other }: UploadProps) => {

  const renderImage = () => (
    <Image
      onClick={() => { }}
      src={file?.absolute_path || ""}
      alt="file"
      // @ts-ignore
      width={sx?.width || 84}
      // @ts-ignore
      height={sx?.height || 84}
      style={{
        objectFit: 'cover',
      }}
    />
  )


  return <Box
    sx={{
      position: 'relative',
      width: '100%',
      height: '100%',
    }}>

    <Box
      onClick={(event) => {
        window.open(file?.absolute_path || "", "_blank")
      }}
      sx={{
        position: 'relative',
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {file?.mime_type?.includes('image') ? renderImage() : <Iconify icon="eva:file-fill" width={28} />}
    </Box>

    <IconButton
      size='small'
      onClick={onDelete}
      sx={{
        width: 24,
        height: 24,
        position: 'absolute',
        top: -8,
        right: -8,
        color: 'white',
        bgcolor: 'common.black',
        // on hover make it red
        '&:hover': {
          bgcolor: 'error.main',
        },
      }}
    >
      <Iconify icon="eva:close-fill" width={20} />
    </IconButton>

  </Box>
}