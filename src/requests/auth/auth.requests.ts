import axiosInstance from '@/utils/axios'
import { ApiResponseType } from '@/types/types'
import { ApiResponse } from '@/utils/api.utils'

export const loginUserRequest = async (payload: {
  email: string
  password: string
}): Promise<ApiResponseType> => {
  try {
    const response = await axiosInstance.post('/Auth/login', {
      ...payload,
    })
    return ApiResponse.success(response.data)
  } catch (error) {
    return ApiResponse.error(error)
  }
}

export const logoutUserRequest = async (): Promise<ApiResponseType> => {
  try {
    // Check if user is header contains token
    const hasToken =
      axiosInstance?.defaults?.headers?.common &&
      axiosInstance?.defaults?.headers?.common.Authorization

    if (!hasToken) {
      return ApiResponse.success({
        error: false,
        message: 'User is not logged in',
      })
    }

    const response = await axiosInstance.post('/user/logout')

    return ApiResponse.success(response.data)
  } catch (error) {
    return ApiResponse.error(error)
  }
}

export const changePasswordRequest = async (payload: {
  email: string
  password: string
  code: string
}): Promise<ApiResponseType> => {
  try {
    const response = await axiosInstance.post('/user/changePassword', {
      ...payload,
    })

    return ApiResponse.success(response.data)
  } catch (error) {
    return ApiResponse.error(error)
  }
}

export const magicLoginRequest = async (payload: {
  code: string
}): Promise<ApiResponseType> => {
  try {
    const response = await axiosInstance.post('/user/magic-login', {
      ...payload,
    })

    return ApiResponse.success(response.data)
  } catch (error) {
    return ApiResponse.error(error)
  }
}

export const getCurrentUserRequest = async (): Promise<ApiResponseType> => {
  try {
    const response = await axiosInstance.post('/user/me')

    return ApiResponse.success(response.data)
  } catch (error) {
    return ApiResponse.error(error)
  }
}
