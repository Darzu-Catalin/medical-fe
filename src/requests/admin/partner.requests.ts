import axiosInstance from '@/utils/axios'
import { ApiResponse } from '@/utils/api.utils'
import { ApiResponseType, GridSearchPayloadType } from '@/types/types'



export const gridGetPartners = async (payload: GridSearchPayloadType): Promise<ApiResponseType> => {
  try {
    const response = await axiosInstance.post('/partner/get-all', payload)

    return ApiResponse.success(response.data)
  } catch (error) {
    return ApiResponse.error(error)
  }
}

// upsertPartnerServices
export const upsertPartnerServices = async (payload: any): Promise<ApiResponseType> => {
  try {
    const response = await axiosInstance.post('/partner/upsert-partner-service', payload)

    return ApiResponse.success(response.data)
  } catch (error) {
    return ApiResponse.error(error)
  }
}

export const upsertPartner = async (payload: any): Promise<ApiResponseType> => {
  try {
    const response = await axiosInstance.post('/partner/upsert', payload)

    return ApiResponse.success(response.data)
  } catch (error) {
    return ApiResponse.error(error)
  }
}

export const deletePartnerRequest = async (payload: { id: number }): Promise<ApiResponseType> => {
  try {
    const response = await axiosInstance.post('/partner/delete', payload)

    return ApiResponse.success(response.data)
  } catch (error) {
    return ApiResponse.error(error)
  }
}
