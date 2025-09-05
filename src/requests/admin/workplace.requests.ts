import axiosInstance from '@/utils/axios'
import { ApiResponse } from '@/utils/api.utils'
import { ApiResponseType, GridSearchPayloadType } from '@/types/types'

export const gridGetWorkplace = async (payload: GridSearchPayloadType): Promise<ApiResponseType> => {
  try {
    const response = await axiosInstance.post('/workplace/get-all', payload)

    return ApiResponse.success(response.data)
  } catch (error) {
    return ApiResponse.error(error)
  }
}

// gridGetPartnerServices
export const gridGetPartnerServices = async (payload: GridSearchPayloadType): Promise<ApiResponseType> => {
  try {
    const response = await axiosInstance.post('/partner/get-all-partner-services', payload)

    return ApiResponse.success(response.data)
  } catch (error) {
    return ApiResponse.error(error)
  }
}

export const gridGetWorkplaceMap = async (payload: any): Promise<ApiResponseType> => {
  try {
    const response = await axiosInstance.post('/workplace/map', payload)

    return ApiResponse.success(response.data)
  } catch (error) {
    return ApiResponse.error(error)
  }
}
export const upsertWorkplace = async (payload: any): Promise<ApiResponseType> => {
  try {
    const response = await axiosInstance.post('/workplace/upsert', payload)

    return ApiResponse.success(response.data)
  } catch (error) {
    return ApiResponse.error(error)
  }
}

export const deleteWorkplace = async (payload: {
  id: number
  client_id: number | undefined
}): Promise<ApiResponseType> => {
  try {
    const response = await axiosInstance.post('/workplace/delete', payload)

    return ApiResponse.success(response.data)
  } catch (error) {
    return ApiResponse.error(error)
  }
}


// bulk import
export const bulkImportWorkplaceRequest = async (payload: any): Promise<ApiResponseType> => {
  try {
    const response = await axiosInstance.post('/workplace/bulk-import', payload)

    return ApiResponse.success(response.data)
  } catch (error) {
    return ApiResponse.error(error)
  }
}