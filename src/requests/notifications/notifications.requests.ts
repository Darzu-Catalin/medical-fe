import axiosInstance from '@/utils/axios'
import { ApiResponse } from '@/utils/api.utils'
import { ApiResponseType } from '@/types/types'

// ######################################################### NOTIFICATION REQUESTS ######################################################

export interface NotificationData {
  id: number
  title: string
  body: string
  type: string
  toEmail: string
  status: string
  createdAt: string
  updatedAt: string
  scheduledAt: string | null
  campaign: any | null
  campaignId: number | null
  data: any | null
  mainCompanyId: number | null
}

// Get user notifications
export const getNotificationsRequest = async (): Promise<ApiResponseType> => {
  try {
    const response = await axiosInstance.get('/singlenotification')
    return ApiResponse.success(response.data)
  } catch (error) {
    return ApiResponse.error(error)
  }
}

// Get notification by ID
export const getNotificationByIdRequest = async (notificationId: string): Promise<ApiResponseType> => {
  try {
    const response = await axiosInstance.get(`/singlenotification/${notificationId}`)
    return ApiResponse.success(response.data)
  } catch (error) {
    return ApiResponse.error(error)
  }
}

// Create appointment notification (Doctor/Admin only)
export const createAppointmentNotificationRequest = async (payload: {
  userId: string
  appointmentId: string
  message: string
}): Promise<ApiResponseType> => {
  try {
    const response = await axiosInstance.post('/singlenotification/appointment', payload)
    return ApiResponse.success(response.data)
  } catch (error) {
    return ApiResponse.error(error)
  }
}

// Create visit record notification (Doctor only)
export const createVisitNotificationRequest = async (payload: {
  userId: string
  visitRecordId: string
  message: string
}): Promise<ApiResponseType> => {
  try {
    const response = await axiosInstance.post('/singlenotification/visit-record', payload)
    return ApiResponse.success(response.data)
  } catch (error) {
    return ApiResponse.error(error)
  }
}

// Create registration notification (Admin only)
export const createRegistrationNotificationRequest = async (payload: {
  userId: string
  message: string
}): Promise<ApiResponseType> => {
  try {
    const response = await axiosInstance.post('/singlenotification/registration', payload)
    return ApiResponse.success(response.data)
  } catch (error) {
    return ApiResponse.error(error)
  }
}