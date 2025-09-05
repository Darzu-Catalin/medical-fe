import { mutate } from 'swr'
import { useState } from 'react'
import { enqueueSnackbar } from 'notistack'
import { ApiResponseType } from '@/types/types'
import Iconify from '@/components/ui/minimals/iconify'
import { useGridContext } from '@/components/custom/grid-context'
import { ConfirmDialog } from '@/components/ui/minimals/custom-dialog'
import {
  disabledColumn,
  basicSettingsColumn,
} from '@/views/dashboard/utils/data-grid-columns/common-columns'

import Link from '@mui/material/Link'
import { LoadingButton } from '@mui/lab'
import { IconButton } from '@mui/material'
import { GridColTypeDef } from '@mui/x-data-grid-pro'

type PayloadType = {
  id: number | string,
  backend_model_name?: string
  [key: string]: any
}

type ActionsDeleteProps = {
  title: string
  content: string
  deleteRequest: (payload: PayloadType) => Promise<ApiResponseType>
  payload: PayloadType
  confirmTitle: string
}

type ActionsModifyProps = {
  href: string
}

type ActionsStackProps = ActionsModifyProps & ActionsDeleteProps

export const ActionsDeleteCell = ({
  title,
  content,
  deleteRequest,
  payload,
  confirmTitle,
}: ActionsDeleteProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { params, entity } = useGridContext()

  const handleCloseConfirm = () => {
    setIsOpen(false)
  }

  const handleClick = async () => {
    setIsLoading(true)
    const data = await deleteRequest(payload)
    await mutate(
      `${entity}-${JSON.stringify(params)}`
    )
    setIsLoading(false)

    if (data?.error) {
      enqueueSnackbar(data.message, { variant: 'error' })
    } else if (data?.error === false) {
      enqueueSnackbar('Succes', { variant: 'success' })
    }
  }

  return (
    <>
      <IconButton
        size="small"
        onClick={() => {
          setIsOpen(true)
        }}
      >
        <Iconify icon="eva:trash-2-outline" />
      </IconButton>
      <ConfirmDialog
        open={isOpen}
        onClose={() => setIsOpen(false)}
        title={title}
        content={
          <>
            Ești sigur că vrei să <strong>{content}</strong>?
          </>
        }
        action={
          <LoadingButton
            loading={isLoading}
            variant="contained"
            color="error"
            onClick={async () => {
              await handleClick()
              handleCloseConfirm()
            }}
          >
            {confirmTitle || "Șterge"}
          </LoadingButton>
        }
      />
    </>
  )
}

export const ActionsModifyCell = ({ href }: ActionsModifyProps) => (
  <Link href={href}>
    <IconButton size="small">
      <Iconify icon="eva:edit-outline" />
    </IconButton>
  </Link>
)

export const ActionsViewCell = ({ href }: ActionsModifyProps) => (
  <Link href={href}>
    <IconButton size="small">
      <Iconify icon="eva:eye-outline" />
    </IconButton>
  </Link>
)

export const actionsColumn: GridColTypeDef = {
  ...disabledColumn,
  ...basicSettingsColumn,
  width: 100,
}

export const ActionsStackCell = ({
  title,
  content,
  confirmTitle,
  deleteRequest,
  payload,
  href,
}: ActionsStackProps) => (
  <>
    {deleteRequest ? <ActionsDeleteCell
      title={title}
      content={content}
      payload={payload}
      confirmTitle={confirmTitle}
      deleteRequest={deleteRequest}
    /> : null}
    <ActionsModifyCell href={href} />
  </>
)
