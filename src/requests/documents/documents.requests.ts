import axiosInstance from '@/utils/axios'
import { ApiResponse } from '@/utils/api.utils'
import { ApiResponseType } from '@/types/types'

// ######################################################### DOCUMENT REQUESTS ######################################################

export interface DocumentData {
  id: string
  patientId: string
  visitRecordId?: string
  fileName: string
  fileType: string
  filePath: string
  fileSizeBytes: number
  description?: string
  documentType: string
  uploadedById: string
  mimeType: string
  createdAt: string
  updatedAt?: string
  uploadedByName: string
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

// Download document
export const downloadDocumentRequest = async (documentId: string): Promise<Blob | null> => {
  try {
    const response = await axiosInstance.get(`/document/${documentId}/download`, {
      responseType: 'blob',
      headers: {
        'Accept': 'application/octet-stream, */*',
      },
    })
    
    console.log('Download response:', response) // Debug log
    console.log('Response data type:', typeof response.data) // Debug log
    console.log('Response data:', response.data) // Debug log
    
    // Ensure we have a valid blob
    if (response.data && response.data instanceof Blob) {
      return response.data
    } else {
      console.error('Invalid response data type:', typeof response.data)
      return null
    }
  } catch (error) {
    console.error('Error downloading document:', error)
    throw error // Throw the error instead of returning null to get better error messages
  }
}

// View document (get document URL for preview)
export const viewDocumentRequest = async (documentId: string): Promise<string | null> => {
  try {
    const response = await axiosInstance.get(`/document/${documentId}/view`)
    return response.data.url || null
  } catch (error) {
    console.error('Error getting document view URL:', error)
    return null
  }
}