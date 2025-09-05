import axiosInstance from '@/utils/axios'
import { ApiResponse } from '@/utils/api.utils'
import { ApiResponseType, GridSearchPayloadType } from '@/types/types'

export const gridGetContactPersons = async (payload: GridSearchPayloadType): Promise<ApiResponseType> => {
  try {
    const response = await axiosInstance.post('/contact-person/get-all', payload)

    return ApiResponse.success(response.data)
  } catch (error) {
    return ApiResponse.error(error)
  }
}
export const upsertContactPersons = async (payload: any): Promise<ApiResponseType> => {
  try {
    const response = await axiosInstance.post('/contact-person/upsert', payload)

    return ApiResponse.success(response.data)
  } catch (error) {
    return ApiResponse.error(error)
  }
}

export const deleteContactPersons = async (payload: {
  id: number
}): Promise<ApiResponseType> => {
  try {
    const response = await axiosInstance.post('/contact-person/delete', payload)

    return ApiResponse.success(response.data)
  } catch (error) {
    return ApiResponse.error(error)
  }
}
