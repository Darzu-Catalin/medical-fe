import axiosInstance from '@/utils/axios'
import { ApiResponse } from '@/utils/api.utils'
import { ApiResponseType, GridSearchPayloadType } from '@/types/types'



export const gridGetProvider = async (payload: GridSearchPayloadType): Promise<ApiResponseType> => {
  try {
    const response = await axiosInstance.post('/provider/get-all', payload)

    return ApiResponse.success(response.data)
  } catch (error) {
    return ApiResponse.error(error)
  }
}
