import axiosInstance from '@/utils/axios';
import { ApiResponse } from '@/utils/api.utils';
import { ApiResponseType } from '@/types/types';
import { getSession } from '@/auth/context/utils';

// Doctor Profile Interface
export interface DoctorProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  idnp: string;
  phoneNumber: string;
  dateOfBirth: string;
  gender: number;
  address: string;
  isActive: boolean;
  bloodType: number;
  roles: string[];
  clinicId: string;
  specialty: string;
  experience: string;
  totalPatients: number;
  lastActivity: string;
}

// Update Doctor Profile Interface
export interface UpdateDoctorProfilePayload {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  address?: string;
  bloodType?: number;
  clinicId?: string;
  specialty?: string;
  experience?: string;
}

// Blood Type Mapping
export const BLOOD_TYPES = {
  1: 'O-',
  2: 'O+',
  3: 'A-',
  4: 'A+',
  5: 'B-',
  6: 'B+',
  7: 'AB-',
  8: 'AB+'
} as const;

// Gender Mapping
export const GENDER_TYPES = {
  1: 'Male',
  2: 'Female',
  3: 'Other'
} as const;

/**
 * Get doctor profile information
 */
export const getDoctorProfile = async (): Promise<ApiResponseType> => {
  try {
    const token = getSession() || localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await axiosInstance.get('/Doctor', {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    // The API returns an array, we need the first doctor (current user)
    const doctorData = Array.isArray(response.data) ? response.data[0] : response.data;

    return ApiResponse.success(doctorData);
  } catch (error: any) {
    console.error('Error fetching doctor profile:', error);
    return ApiResponse.error(error);
  }
};

/**
 * Update doctor profile information
 */
export const updateDoctorProfile = async (payload: UpdateDoctorProfilePayload): Promise<ApiResponseType> => {
  try {
    const token = getSession() || localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await axiosInstance.put('/Doctor/profile', payload, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    return ApiResponse.success(response.data);
  } catch (error: any) {
    console.error('Error updating doctor profile:', error);
    return ApiResponse.error(error);
  }
};

/**
 * Get available clinics for selection
 */
export const getClinics = async (): Promise<ApiResponseType> => {
  try {
    const token = getSession() || localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await axiosInstance.get('/Clinic', {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    return ApiResponse.success(response.data);
  } catch (error: any) {
    console.error('Error fetching clinics:', error);
    return ApiResponse.error(error);
  }
};

/**
 * Get blood type display name
 */
export const getBloodTypeDisplay = (bloodType: number): string => {
  return BLOOD_TYPES[bloodType as keyof typeof BLOOD_TYPES] || 'Unknown';
};

/**
 * Get gender display name
 */
export const getGenderDisplay = (gender: number): string => {
  return GENDER_TYPES[gender as keyof typeof GENDER_TYPES] || 'Unknown';
};

/**
 * Get doctor's medical records
 */
export const getDoctorMedicalRecords = async (page: number = 1, pageSize: number = 50): Promise<ApiResponseType> => {
  try {
    const token = getSession() || localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await axiosInstance.get(`/Doctor/medical-records?page=${page}&pageSize=${pageSize}`, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    return ApiResponse.success(response.data);
  } catch (error: any) {
    console.error('Error fetching doctor medical records:', error);
    return ApiResponse.error(error);
  }
};

/**
 * Get doctor's medical records for a specific patient
 */
export const getDoctorPatientMedicalRecords = async (patientId: string): Promise<ApiResponseType> => {
  try {
    const token = getSession() || localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await axiosInstance.get(`/Doctor/medical-records/patient/${patientId}`, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    return ApiResponse.success(response.data);
  } catch (error: any) {
    console.error('Error fetching patient medical records:', error);
    return ApiResponse.error(error);
  }
};

/**
 * Link patient to doctor
 */
export interface LinkPatientPayload {
  email?: string;
  idnp?: string;
  notes?: string;
}

export const linkPatient = async (payload: LinkPatientPayload): Promise<ApiResponseType> => {
  try {
    const token = getSession() || localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await axiosInstance.post('/Doctor/link-patient', payload, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    return ApiResponse.success(response.data);
  } catch (error: any) {
    console.error('Error linking patient:', error);
    return ApiResponse.error(error);
  }
};

/**
 * Unlink patient from doctor
 */
export const unlinkPatient = async (patientId: string, reason?: string): Promise<ApiResponseType> => {
  try {
    const token = getSession() || localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    // Backend expects [FromBody] string? reason, so send just the string or null
    const response = await axiosInstance.post(
      `/Doctor/unlink-patient/${patientId}`, 
      reason || null,
      {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return ApiResponse.success(response.data);
  } catch (error: any) {
    console.error('Error unlinking patient:', error);
    return ApiResponse.error(error);
  }
};