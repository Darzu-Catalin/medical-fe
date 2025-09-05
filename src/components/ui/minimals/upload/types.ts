import { DropzoneOptions } from 'react-dropzone'

import { Theme, SxProps } from '@mui/material/styles'

// ----------------------------------------------------------------------

export interface FileType extends File {
  [key: string]: any
  absolute_path: string
  blurhash: string
  created_at: string
  extension: string
  id: number
  mime_type: string
  model_id: number
  model_type: string
  name: string
  path: string
  size: number
  type_id: number
  updated_by: number
  created_by: number
}

export interface UploadProps extends DropzoneOptions {
  error?: boolean
  sx?: SxProps<Theme>
  thumbnail?: boolean
  placeholder?: React.ReactNode
  helperText?: React.ReactNode
  disableMultiple?: boolean
  //
  file?: FileType | null
  setFile?: (file: FileType | null) => void
  onDelete?: VoidFunction
  //
  files?: FileType[]
  loading?: boolean
  setLoading?: (loading: boolean) => void
  onUpload?: VoidFunction
  onRemove?: (file: FileType) => void
  onRemoveAll?: VoidFunction
  withLabels?: {
    label: string
    value: string
  }[]
  setFiles?: (files: FileType[]) => void
}
