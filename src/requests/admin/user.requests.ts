import axiosInstance from '@/utils/axios'
import { ApiResponse } from '@/utils/api.utils'
import { ApiResponseType, GridSearchPayloadType } from '@/types/types'


// ######################################################### CRUD ######################################################

export const gridGetUsers = async (payload: GridSearchPayloadType): Promise<ApiResponseType> => {
  try {
    const response = await axiosInstance.post('/user/get-all', payload)
    return ApiResponse.success(response.data)
  } catch (error) {
    return ApiResponse.error(error)
  }
}


// getVerificationCode
export const getVerificationCodeRequest = async (payload: any): Promise<ApiResponseType> => {
  try {
    const response = await axiosInstance.post('/Auth/get-verification-code', payload)
    return ApiResponse.success(response.data)
  } catch (error) {
    return ApiResponse.error(error)
  }
}

// upsert
export const upsertUserRequest = async (payload: any): Promise<ApiResponseType> => {
  try {
    const response = await axiosInstance.post('/user/update', payload)
    return ApiResponse.success(response.data)
  } catch (error) {
    return ApiResponse.error(error)
  }
}

export const adminUpdateUserRequest = async (payload: any): Promise<ApiResponseType> => {
  try {
    const response = await axiosInstance.post('/user/admin-update-user', payload)
    return ApiResponse.success(response.data)
  } catch (error) {
    return ApiResponse.error(error)
  }
}