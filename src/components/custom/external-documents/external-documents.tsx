'use client'

import * as Yup from 'yup'
import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import Iconify from '@/components/iconify'
import { ExternalDocumentType } from '@/types/types'
import { yupResolver } from '@hookform/resolvers/yup'
import Label from '@/components/ui/minimals/label/label'
import Scrollbar from '@/components/ui/minimals/scrollbar'
import { ConfirmDialog } from '@/components/ui/minimals/custom-dialog'
import FormProvider from '@/components/ui/minimals/hook-form/form-provider'
import { RHFTextField, RHFAutocomplete } from '@/components/ui/minimals/hook-form'

// eslint-disable-next-line import/no-extraneous-dependencies
import { Portal } from '@mui/base'
import { LoadingButton } from '@mui/lab'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { Box, Dialog, IconButton, Typography, DialogActions } from '@mui/material'

import { fDate } from '@/utils/format-time'
import EmptyContent from '@/components/ui/minimals/empty-content/empty-content'
import FileFormField from '../forms/file-form-field'
import TextFieldsContainer from '../forms/text-fields-container'

const ExternalDocuments = ({
  value,
  onChange,
  rightAction,
  documentTypes,
  multiple = true,
  withExpirationDate = true
}: {
  value: ExternalDocumentType[]
  onChange: (e: ExternalDocumentType[]) => void
  documentTypes: string[]
  multiple?: boolean
  withExpirationDate?: boolean
  rightAction?: (e: ExternalDocumentType) => React.ReactNode
}) => {
  const [modalVisible, setModalVisible] = useState(false)

  return (
    <Box sx={{
      border: (theme) => `solid 1px ${theme.palette.divider}`,
    }}>

      <Box sx={{
        display: 'flex',
        gap: 1,
        p: 2,
        borderBottom: (theme) => `solid 1px ${theme.palette.divider}`,
      }}>
        {
          ['Nume', 'Tip', 'Notițe', 'Creat la', 'Creat de', 'Acțiuni'].map((label) =>
            <Box sx={{
              flex: 1,
            }}>
              <Typography variant="body1">
                {label}
              </Typography>
            </Box>
          )
        }
      </Box>

      {value.length === 0 ? <Box>
        <Box  sx={{ p: 2 }}>
          <EmptyContent />
        </Box>
      </Box> : null}

      {value.map((document, i) => (
        <ExternalDocument
          withExpirationDate={withExpirationDate}
          key={i}
          rightAction={rightAction}
          multiple={multiple}
          documentTypes={documentTypes}
          document={document}
          onChange={(e, type) => {
            if (type === 'delete') {
              onChange(value.filter((v, j) => i !== j))
              return
            }

            onChange(value.map((v, j) => (i === j ? e : v)))
          }}
        />
      ))}

      <Box
        onClick={() => {
          setModalVisible(true)
        }}
        sx={{
          border: (theme) => `dashed 1px ${theme.palette.primary.main}`,
          p: 2,
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          bgcolor: "#2065d10f",
        }}
      >
        <Typography variant="body1" color="primary">
          Adaugă document
        </Typography>
      </Box>

      {modalVisible ? (
        <ExternalDocumentModal
          onClose={() => {
            setModalVisible(false)
          }}
          multiple={multiple}
          withExpirationDate={withExpirationDate}
          documentTypes={documentTypes}
          onChange={(document) => {

            if (!multiple) {
              return onChange([document])
            }

            return onChange([...value, document])
          }}
        />
      ) : null}
    </Box>
  )
}

const ExternalDocumentModal = ({
  document,
  onChange,
  onClose,
  documentTypes,
  multiple,
  withExpirationDate,
}: {
  document?: ExternalDocumentType | null
  onChange: (e: ExternalDocumentType) => void
  onClose: () => void
  withExpirationDate?: boolean
  multiple?: boolean
  documentTypes: string[]
}) => {
  // @ts-ignore
  const defaultValues: ExternalDocumentType = useMemo(
    () => ({
      id: document?.id || null,
      name: document?.name || '',
      type: document?.type || '',
      notes: document?.notes || '',
      document_files: document?.document_files || [],
      release_date: document?.release_date || '',
      expiration_date: document?.expiration_date || '',
    }),

    // eslint-disable-next-line react-hooks/exhaustive-deps
    [document]
  )
  const schema = Yup.object().shape({
    name: Yup.string().required('Name is required'),
  })

  const methods = useForm({
    defaultValues,
    resolver: yupResolver(schema),
  })

  const {
    watch,
    setValue,
    formState: { isSubmitting, isDirty },
  } = methods

  const values = watch()

  const onSubmit = async () => {
    // @ts-ignore
    onChange(values)
    onClose()
  }

  return (
    <Portal>
      <FormProvider methods={methods}>
        <Dialog
          fullWidth
          maxWidth="sm"
          open
          onClose={onClose}
          PaperProps={{
            sx: {
              overflow: 'unset',
            },
          }}
        >

          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              p: 3,
              borderBottom: (theme) => `solid 1px ${theme.palette.divider}`,
            }}
          >
            <Typography variant="h6">Document</Typography>

            <IconButton onClick={onClose}>
              <Iconify icon="mdi:close" />
            </IconButton>
          </Box>

          <Scrollbar
            sx={{
              maxHeight: 'calc(100vh - 200px)',
            }}
          >
            <Box
              sx={{
                p: 3,
              }}
            >
              <TextFieldsContainer
                sx={{
                  mb: 2,
                }}
              >
                <RHFTextField name="name" label="Name" />
                <RHFAutocomplete
                  name="type"
                  label="Type"
                  freeSolo
                  options={documentTypes || []}
                />
              </TextFieldsContainer>
              <RHFTextField name="notes" multiline minRows={3} label="Notițe" />

              {withExpirationDate ? <TextFieldsContainer
                sx={{
                  mb: 2,
                  mt: 2,
                }}
              >
                <DatePicker
                  label="Data emiterii"
                  defaultValue={document?.release_date ? new Date(document.release_date) : null}
                  format="dd/MM/yyyy"
                  onChange={(date) => {
                    setValue('release_date' as any, date, { shouldDirty: true })
                  }}
                />

                <DatePicker
                  label="Data expirării"
                  defaultValue={
                    document?.expiration_date ? new Date(document.expiration_date) : null
                  }
                  format="dd/MM/yyyy"
                  onChange={(date) => {
                    setValue('expiration_date' as any, date, { shouldDirty: true })
                  }}
                />
              </TextFieldsContainer> : null}

              <FileFormField multiple={multiple} name="document_files" type="document_files" />
            </Box>
          </Scrollbar>
          <DialogActions
            sx={{
              borderTop: (theme) => `solid 1px ${theme.palette.divider}`,
            }}
          >
            <IconButton onClick={onClose}>
              <Iconify icon="mdi:close" />
            </IconButton>

            <IconButton onClick={onSubmit} disabled={isSubmitting || !isDirty}>
              <Iconify icon="mdi:check" />
            </IconButton>
          </DialogActions>
        </Dialog>
      </FormProvider>
    </Portal>
  )
}

const ExternalDocument = ({
  document,
  documentTypes,
  onChange,
  rightAction,
  withExpirationDate,
  multiple
}: {
  document: ExternalDocumentType
  documentTypes: string[]
  rightAction?: (e: ExternalDocumentType) => React.ReactNode
  withExpirationDate?: boolean
  multiple?: boolean
  onChange: (e: ExternalDocumentType, type?: 'delete' | 'upsert') => void
}) => {
  const [visible, setVisible] = useState(false)
  const [deletedVisible, setDeletedVisible] = useState(false)

  const toggleVisible = () => {
    setVisible(!visible)
  }

  const creatorName = useMemo(() => document.creator ? `${document.creator.first_name} ${document.creator.last_name}` : '-', [document.creator])

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: (theme) => `solid 1px ${theme.palette.divider}`,
          p: 2
        }}
      >
        <Box
          sx={{
            flex: 1,
            cursor: 'pointer',
          }}
          onClick={() => {
            toggleVisible()
          }}
        >
          <Typography variant="body1">{document.name}</Typography>

        </Box>

        <Box
          sx={{
            flex: 1,
          }}>
          <Label>{document.type}</Label>
        </Box>

        <Box
          sx={{
            flex: 1,
          }}>
          <Typography variant="body1">{document.notes}</Typography>
        </Box>
        <Box
          sx={{
            flex: 1,
          }}>
          <Typography variant="body1">{fDate(document.created_at, 'dd/MM/yy hh:mm')}</Typography>
        </Box>
        <Box
          sx={{
            flex: 1,
          }}>
          <Typography variant="body1">{creatorName}</Typography>
        </Box>

        <Box
          sx={{
            flex: 1,
          }}
        >
          <IconButton onClick={toggleVisible}>
            <Iconify icon="mdi:eye" />
          </IconButton>

          <IconButton
            onClick={() => {
              setDeletedVisible(true)
            }}
          >
            <Iconify icon="mdi:trash-can" />
          </IconButton>

          {rightAction ? rightAction(document) : null}
        </Box>
      </Box>

      {visible ? (
        <ExternalDocumentModal
          document={document}
          documentTypes={documentTypes}
          onChange={onChange}
          multiple={multiple}
          onClose={() => {
            setVisible(false)
          }}
        />
      ) : null}

      <ConfirmDialog
        open={deletedVisible}
        onClose={() => {
          setDeletedVisible(false)
        }}
        title="Șterge document"
        content="Ești sigur că vrei să ștergi acest document?"
        action={
          <LoadingButton
            variant="contained"
            color="error"
            onClick={async () => {
              onChange(document, 'delete')
              setDeletedVisible(false)
            }}
          >
            Șterge
          </LoadingButton>
        }
      />
    </>
  )
}

export default ExternalDocuments
