import axiosInstance from '@/utils/axios'
import { ApiResponse } from '@/utils/api.utils'
import { ApiResponseType } from '@/types/types'


// ######################################################### CRUD ######################################################

export const loginExternalRequest = async (payload: {number: string, vin: string}): Promise<ApiResponseType> => {
  try {
    const response = await axiosInstance.post('/external/login', payload)
    return ApiResponse.success(response.data)
  } catch (error) {
    return ApiResponse.error(error)
  }
}

export const uploadFilesExternalRequest = async (payload: {files: any, number: string, vin: string}): Promise<ApiResponseType> => {
    try {
      const response = await axiosInstance.post('/external/upload-files', payload)
      return ApiResponse.success(response.data)
    } catch (error) {
      return ApiResponse.error(error)
    }
  }
  

  