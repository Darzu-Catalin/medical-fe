import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Tooltip from '@mui/material/Tooltip'
import { Theme, SxProps } from '@mui/material/styles'

// eslint-disable-next-line import/no-cycle
import { FileType } from '../upload'
import DownloadButton from './download-button'

// ----------------------------------------------------------------------

type FileIconProps = {
  file: FileType
  tooltip?: boolean
  imageView?: boolean
  onDownload?: VoidFunction
  sx?: SxProps<Theme>
  imgSx?: SxProps<Theme>
}

export default function FileThumbnail({
  file,
  tooltip,
  imageView,
  onDownload,
  sx,
  imgSx,
}: FileIconProps) {



  const renderContent =
    file.mime_type.includes("image") && imageView ? (
      <Box
        onClick={() => window.open(file.absolute_path)}
        component="img"
        src={file.absoute_path}
        sx={{
          cursor: 'pointer',
          width: 1,
          height: 1,
          flexShrink: 0,
          objectFit: 'cover',
          ...imgSx,
        }}
      />
    ) : (
      <Box
        onClick={() => window.open(file.absolute_path)}
        component="img"
        src={file.absolute_path}
        sx={{
          cursor: 'pointer',
          width: 32,
          height: 32,
          flexShrink: 0,
          ...sx,
        }}
      />
    )

  if (tooltip) {
    return (
      <Tooltip title={file.name}>
        <Stack
          flexShrink={0}
          component="span"
          alignItems="center"
          justifyContent="center"
          sx={{
            width: 'fit-content',
            height: 'inherit',
          }}
        >
          {renderContent}
          {onDownload && <DownloadButton onDownload={onDownload} />}
        </Stack>
      </Tooltip>
    )
  }

  return (
    <>
      {renderContent}
      {onDownload && <DownloadButton onDownload={onDownload} />}
    </>
  )
}
