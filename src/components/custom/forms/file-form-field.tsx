/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from 'react'
import { enqueueSnackbar } from 'notistack'
import useFileUploader from '@/hooks/admin/use-file-upload'
import Upload from '@/components/ui/minimals/upload/upload'
import { Controller, useFormContext } from 'react-hook-form'
import { formMargin } from '@/components/custom/forms/constants'
import { UploadBox, UploadProps } from '@/components/ui/minimals/upload'

import FormHelperText from '@mui/material/FormHelperText'

interface Props extends Omit<UploadProps, 'file'> {
  name?: string // name for controller
  type: string  // name for backend image type (needs to be created in db)
  multiple?: boolean
  withLabels?: { label: string, value: string }[]
}

export default function FileFormField({ name = 'file', type, multiple, withLabels, ...other }: Props) {
  const { control, setValue, getValues } = useFormContext()
  const { isError, errorMessage, upload, file, files, setFiles, setFile } = useFileUploader()
  const currentValue = getValues(name)
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    if (file && !multiple) {
      setValue(name, file, { shouldValidate: true, shouldDirty: true })
    }

    if (files && multiple) {
      setValue(name, [
        ...files
      ], { shouldValidate: true, shouldDirty: true })
    }

  }, [file, files, name, setValue])


  useEffect(() => {

    if (!checked) {
      if (currentValue) {
        setChecked(true)
        if (Array.isArray(currentValue)) {
          setFiles(currentValue)
        } else {
          setFile(currentValue)
        }
      }
    }

    if (isError) {
      enqueueSnackbar(errorMessage, { variant: 'error' })
    }
  }, [isError, errorMessage, currentValue])

  const handleDrop = async (acceptedFiles: File[]) => {
    await upload(acceptedFiles, type, multiple);
  }

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
          <div>
            {multiple ?
              <Upload
                multiple
                onDrop={handleDrop}
                onRemove={(eFile: any) => {
                  const newFiles = files.filter((paramFile) => paramFile.id !== eFile.id)
                  setFiles(newFiles)
                }}
                setFiles={setFiles}
                withLabels={withLabels}
                files={field.value}
                error={!!error}
                helperText={
                  (!!error) && (
                    <FormHelperText error={!!error} sx={{ px: 2 }}>
                      {error ? error?.message : errorMessage}
                    </FormHelperText>
                  )
                }
                {...other}
              />
              :
              <UploadBox
                onDelete={() => setValue(name, null, { shouldValidate: true, shouldDirty: true })}
                error={Boolean(errorMessage)}
                file={field?.value ? field.value : undefined}
                onDrop={handleDrop}
                {...other}
                sx={{
                  mb: formMargin,
                  ...other.sx
                }}
              />}

            {!!error && (
              <FormHelperText error sx={{ px: 2, textAlign: 'center' }}>
                {error.message}
              </FormHelperText>
            )}
          </div>
        )}
    />
  )
}
