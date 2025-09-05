import axiosInstance from '@/utils/axios'
import { ApiResponseType } from '@/types/types'

export const uploadFile = async ({
  file,
  type,
}: {
  type: string
  file: any
}): Promise<ApiResponseType> => {

  if (!file) {
    return {
      error: true,
      message: 'No file provided',
    }
  }

  const formData = new FormData()
  formData.append('file', file)
  formData.append('type', type);

  // transform the file to a FormData object
  const response = await axiosInstance.post('/file/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })

  return response.data
}
