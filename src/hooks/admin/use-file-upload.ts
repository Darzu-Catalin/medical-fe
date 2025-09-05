/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
/* eslint-disable @typescript-eslint/no-shadow */
import { useState } from 'react'
import uuidv4 from '@/utils/uuidv4'
import { enqueueSnackbar } from 'notistack'
import { FileType } from '@/components/ui/minimals/upload'
import { uploadFile as uploadFileRequest } from '@/requests/files.requests'

export default function useFileUploader() {
  const [file, setFile] = useState<FileType | null>(null)
  const [files, setFiles] = useState<FileType[]>([])
  const [isError, setIsError] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string>('')

  const uploadSingleFile = async (acceptedFiles: File[], type: string) => {
    try {
      const fisier = acceptedFiles[0]

      const newFile = Object.assign(fisier, {
        preview: URL.createObjectURL(fisier),
      })

      const futureName = `${uuidv4()}_${fisier.name}`
      const newFileCloned = new File([newFile], futureName, { type: 'public' })

      const imageUploadRes = await uploadFileRequest({
        file: newFileCloned,
        type,
      })

      if (imageUploadRes.error) {
        setFile(null)
        setIsError(true)
        setErrorMessage(imageUploadRes.message)
        return
      }

      setFile(imageUploadRes.file as FileType)
      setIsError(false)
      setErrorMessage('')
    } catch (err) {
      setFile(null)
      setIsError(err)
      setErrorMessage('File upload failed!')
    }
  }

  const uploadFile = async (acceptedFiles: File[], type: string, multiple = false) => {
    if (multiple) {
      for (const file of acceptedFiles) {
        const newFile = Object.assign(file, {
          preview: URL.createObjectURL(file),
        })

        const newFileCloned = new File([newFile], newFile.name, { type: newFile.type })

        if (file) {
          const uploadResponse = await uploadFileRequest({
            file: newFileCloned,
            type,
          })

          if (uploadResponse.error) {
            enqueueSnackbar('Eroare la încărcarea fișierului', { variant: 'error' })
            return
          }

          setFiles((prevFiles) => [...prevFiles, uploadResponse.file])
        }
      }

      // eslint-disable-next-line react-hooks/exhaustive-deps
    } else {
      uploadSingleFile(acceptedFiles, type)
    }
  }
  return { file, files, upload: uploadFile, isError, errorMessage, setFiles, setFile }
}
