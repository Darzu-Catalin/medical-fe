import axiosInstance from '@/utils/axios'
import { ApiResponse } from '@/utils/api.utils'
import { ApiResponseType } from '@/types/types'

// ######################################################### RATING REQUESTS ######################################################

export interface RatingData {
  id: string
  rating: number // 1-5 stars
  comment?: string
  patientId: string
  patientName?: string
  doctorId: string
  appointmentId: string
  createdAt: string
}

export interface DoctorRatingsSummary {
  doctorId: string
  averageRating: number
  totalRatings: number
  ratings: RatingData[]
}

// Submit rating for appointment (Patient only)
export const submitRatingRequest = async (payload: {
  rating: number
  comment?: string
  doctorId: string
  appointmentId: string
}): Promise<ApiResponseType> => {
  try {
    const response = await axiosInstance.post('/rating', payload)
    return ApiResponse.success(response.data)
  } catch (error) {
    return ApiResponse.error(error)
  }
}

// Add rating (alias for submitRatingRequest)
export const addRatingRequest = async (payload: {
  rating: number
  comment?: string
  doctorId: string
  appointmentId?: string
}): Promise<ApiResponseType> => {
  try {
    const response = await axiosInstance.post('/rating', payload)
    return ApiResponse.success(response.data)
  } catch (error) {
    return ApiResponse.error(error)
  }
}

// Get doctor ratings
export const getDoctorRatingsRequest = async (doctorId: string): Promise<ApiResponseType> => {
  try {
    const response = await axiosInstance.get(`/rating/doctor/${doctorId}`)
    return ApiResponse.success(response.data)
  } catch (error) {
    return ApiResponse.error(error)
  }
}

// Get appointment rating
export const getAppointmentRatingRequest = async (appointmentId: string): Promise<ApiResponseType> => {
  try {
    const response = await axiosInstance.get(`/rating/appointment/${appointmentId}`)
    return ApiResponse.success(response.data)
  } catch (error) {
    return ApiResponse.error(error)
  }
}