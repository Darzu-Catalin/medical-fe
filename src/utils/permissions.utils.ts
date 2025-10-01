// To update this file just call the endpoint

import { store } from "@/redux/store"

import { PermissionType } from "../types/types"

// {{baseUrl}}/api/general/get-permissions
export const PERMISSIONS = {
  ALL_PERMISSIONS: '*',
  
  // Role-based access permissions
  ROLES: {
    ADMIN: 'role.admin',
    DOCTOR: 'role.doctor', 
    PATIENT: 'role.patient',
  },
  
  // Feature-based permissions
  APPOINTMENTS: {
    VIEW: 'appointments.view',
    CREATE: 'appointments.create',
    UPDATE: 'appointments.update',
    DELETE: 'appointments.delete',
    UPDATE_STATUS: 'appointments.update_status', // Doctor only
  },
  
  MEDICAL_RECORDS: {
    VIEW: 'medical_records.view',
    CREATE: 'medical_records.create', // Doctor only
    UPDATE: 'medical_records.update', // Doctor only
  },
  
  DOCUMENTS: {
    VIEW: 'documents.view',
    UPLOAD: 'documents.upload',
    DELETE: 'documents.delete',
    VIEW_PATIENT_DOCS: 'documents.view_patient', // Doctor/Admin only
  },
  
  RATINGS: {
    VIEW: 'ratings.view',
    SUBMIT: 'ratings.submit', // Patient only
  },
  
  NOTIFICATIONS: {
    VIEW: 'notifications.view',
    CREATE: 'notifications.create', // Doctor/Admin only
  },
  
  CLIENT: {
    VIEW: 'client.view',
    UPSERT: 'client.upsert',
    DELETE: 'client.delete',
    LOGS: 'client.logs',
  },
  COMPANY: {
    VIEW: 'partner.view',
    UPSERT: 'partner.upsert',
    DELETE: 'partner.delete',
    LOGS: 'partner.logs',
  },
  USER: {
    VIEW: 'user.view',
    UPSERT: 'user.upsert',
    DELETE: 'user.delete',
    LOGS: 'user.logs',
  },
}

// You can create group of permissions like this
export const DEMO_GROUP = [
  PERMISSIONS.ALL_PERMISSIONS,
  PERMISSIONS.CLIENT.UPSERT,
  PERMISSIONS.USER.VIEW,
]

// check with
// userCan(DEMO_GROUP)
// userCan(PERMISSIONS.CLIENT.UPSERT)
export const userCan = (permission: PermissionType| PermissionType[]) => {
  // get store user and permissions
  const { user, permissions, userRole } = store.getState().auth

  if (!user) return false
  if (!permissions) return false

  // If user has ALL_PERMISSIONS (*), they can do anything (admin level)
  if (permissions.includes('*')) return true

  if (Array.isArray(permission)) {
    return permission.some((p) => {
      // Check if user has the specific permission
      if (permissions.includes(p)) return true
      
      // Check role-based access
      if (p === PERMISSIONS.ROLES.ADMIN && userRole === 'admin') return true
      if (p === PERMISSIONS.ROLES.DOCTOR && userRole === 'doctor') return true
      if (p === PERMISSIONS.ROLES.PATIENT && userRole === 'patient') return true
      
      // Check if permission is '*' and user has any permission (logged in)
      if (p === '*' && permissions.length > 0) return true
      
      return false
    })
  }

  // For single permission check
  if (permissions.includes(permission)) return true
  
  // Check role-based access for single permission
  if (permission === PERMISSIONS.ROLES.ADMIN && userRole === 'admin') return true
  if (permission === PERMISSIONS.ROLES.DOCTOR && userRole === 'doctor') return true  
  if (permission === PERMISSIONS.ROLES.PATIENT && userRole === 'patient') return true
  
  // If checking for ALL_PERMISSIONS (*), any logged in user with permissions can access
  if (permission === '*' && permissions.length > 0) return true

  return false
}

/**
 * Check if user has specific role
 */
export const userHasRole = (role: 'admin' | 'doctor' | 'patient'): boolean => {
  const { userRole } = store.getState().auth
  return userRole === role
}

/**
 * Check if user can access role-specific areas
 */
export const canAccessAdminArea = () => userHasRole('admin')
export const canAccessDoctorArea = () => userHasRole('doctor') || userHasRole('admin')
export const canAccessPatientArea = () => userHasRole('patient') || userHasRole('admin')