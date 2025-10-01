import axiosInstance from '@/utils/axios'
import { ApiResponse } from '@/utils/api.utils'
import { ApiResponseType } from '@/types/types'

// ######################################################### DOCUMENT REQUESTS ######################################################

export interface DocumentData {
  id: string
  fileName: string
  originalName: string
  fileSize: number
  contentType: string
  uploadedBy: string
  patientId?: string
  uploadedAt: string
  url?: string
}

// Upload document
export const uploadDocumentRequest = async (formData: FormData): Promise<ApiResponseType> => {
  try {
    const response = await axiosInstance.post('/document/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return ApiResponse.success(response.data)
  } catch (error) {
    return ApiResponse.error(error)
  }
}

// Get document by ID
export const getDocumentRequest = async (documentId: string): Promise<ApiResponseType> => {
  try {
    const response = await axiosInstance.get(`/document/${documentId}`)
    return ApiResponse.success(response.data)
  } catch (error) {
    return ApiResponse.error(error)
  }
}

// Delete document
export const deleteDocumentRequest = async (documentId: string): Promise<ApiResponseType> => {
  try {
    const response = await axiosInstance.delete(`/document/${documentId}`)
    return ApiResponse.success(response.data)
  } catch (error) {
    return ApiResponse.error(error)
  }
}

// Get patient documents (Doctor/Admin only)
export const getPatientDocumentsRequest = async (patientId: string): Promise<ApiResponseType> => {
  try {
    const response = await axiosInstance.get(`/document/patient/${patientId}`)
    return ApiResponse.success(response.data)
  } catch (error) {
    return ApiResponse.error(error)
  }
}