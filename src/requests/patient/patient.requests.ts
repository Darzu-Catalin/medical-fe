import axiosInstance from '@/utils/axios'
import { ApiResponse } from '@/utils/api.utils'
import { ApiResponseType } from '@/types/types'

// ######################################################### PATIENT REQUESTS ######################################################

export interface PatientProfile {
  id: string
  email: string
  firstName: string
  lastName: string
  phoneNumber?: string
  dateOfBirth?: string
  gender?: number
  address?: string
  bloodType?: string
  isActive: boolean
}

export interface MedicalRecord {
  id: string
  patientId: string
  doctorId: string
  diagnosis: string
  treatment?: string
  medications?: string
  notes?: string
  date: string
  recordDate: string
  recordType: string
  doctorName?: string
  createdAt: string
}

export interface MedicalHistory {
  records: MedicalRecord[]
  totalRecords: number
}

// Get patient profile
export const getPatientProfileRequest = async (patientId: string): Promise<ApiResponseType> => {
  try {
    const response = await axiosInstance.get(`/patient/${patientId}`)
    return ApiResponse.success(response.data)
  } catch (error) {
    return ApiResponse.error(error)
  }
}

// Update patient profile
export const updatePatientProfileRequest = async (patientId: string, payload: Partial<PatientProfile>): Promise<ApiResponseType> => {
  try {
    const response = await axiosInstance.put(`/patient/${patientId}`, payload)
    return ApiResponse.success(response.data)
  } catch (error) {
    return ApiResponse.error(error)
  }
}

// Get patient medical history
export const getPatientMedicalHistoryRequest = async (patientId: string): Promise<ApiResponseType> => {
  try {
    const response = await axiosInstance.get(`/patient/${patientId}/medical-history`)
    return ApiResponse.success(response.data)
  } catch (error) {
    return ApiResponse.error(error)
  }
}

// Add medical record to patient
export const addMedicalRecordRequest = async (patientId: string, payload: {
  diagnosis: string
  treatment: string
  notes?: string
}): Promise<ApiResponseType> => {
  try {
    const response = await axiosInstance.post(`/patient/${patientId}/medical-record`, payload)
    return ApiResponse.success(response.data)
  } catch (error) {
    return ApiResponse.error(error)
  }
}

// Get patient medical records
export const getPatientMedicalRecordsRequest = async (patientId: string): Promise<ApiResponseType> => {
  try {
    const response = await axiosInstance.get(`/patient/${patientId}/medical-records`)
    return ApiResponse.success(response.data)
  } catch (error) {
    return ApiResponse.error(error)
  }
}

// Create medical record
export const createMedicalRecordRequest = async (payload: {
  patientId: string
  diagnosis: string
  treatment?: string
  medications?: string
  notes?: string
  recordDate: string
  recordType: string
}): Promise<ApiResponseType> => {
  try {
    const response = await axiosInstance.post(`/medical-records`, payload)
    return ApiResponse.success(response.data)
  } catch (error) {
    return ApiResponse.error(error)
  }
}