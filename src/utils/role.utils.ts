import { UserType, UserRole } from '@/types/types'
import { store } from '@/redux/store'

/**
 * Get the user role from the user object
 * Checks multiple possible fields where role might be stored
 */
export const getUserRole = (user?: UserType | null): UserRole => {
  if (!user) {
    return 'patient' // Default role for non-authenticated users
  }

  // Check different possible fields where role might be stored
  let role = user.role || user.userType || user.type || user.user_type

  // Check if roles is an array and get the first role
  if (!role && user.roles && Array.isArray(user.roles) && user.roles.length > 0) {
    role = user.roles[0]
  }

  if (typeof role === 'string') {
    const normalizedRole = role.toLowerCase()
    
    // Map various role names to our standard roles
    if (normalizedRole.includes('admin') || normalizedRole === 'administrator') {
      return 'admin'
    }
    if (normalizedRole.includes('doctor') || normalizedRole.includes('physician') || normalizedRole === 'medical') {
      return 'doctor'
    }
    if (normalizedRole.includes('patient') || normalizedRole.includes('client') || normalizedRole === 'user') {
      return 'patient'
    }
  }

  // If role is a number, map it to roles (common pattern)
  if (typeof role === 'number') {
    switch (role) {
      case 1:
        return 'admin'
      case 2:
        return 'doctor'
      case 3:
        return 'patient'
      default:
        return 'patient'
    }
  }

  // Default to patient if no clear role is found
  return 'patient'
}

/**
 * Get the current user's role from the Redux store
 * This is now the preferred method as it uses the stored userRole
 */
export const getCurrentUserRole = (): UserRole => {
  const { userRole } = store.getState().auth
  return userRole
}

/**
 * Get display name for a role
 */
export const getRoleDisplayName = (role: UserRole): string => {
  const roleNames = {
    admin: 'Administrator',
    doctor: 'Doctor',
    patient: 'Patient'
  }
  return roleNames[role]
}

/**
 * Get role color for UI styling
 */
export const getRoleColor = (role: UserRole): string => {
  const roleColors = {
    admin: '#f44336', // Red for admin
    doctor: '#2196f3', // Blue for doctor
    patient: '#4caf50' // Green for patient
  }
  return roleColors[role]
}

/**
 * Get role icon name for UI display
 */
export const getRoleIcon = (role: UserRole): string => {
  const roleIcons = {
    admin: 'AdminPanelSettings',
    doctor: 'LocalHospital',
    patient: 'Person'
  }
  return roleIcons[role]
}

/**
 * Check if the current user has a specific role
 */
export const hasRole = (targetRole: UserRole): boolean => {
  const currentRole = getCurrentUserRole()
  return currentRole === targetRole
}

/**
 * Check if the current user is an admin
 */
export const isAdmin = (): boolean => hasRole('admin')

/**
 * Check if the current user is a doctor
 */
export const isDoctor = (): boolean => hasRole('doctor')

/**
 * Check if the current user is a patient
 */
export const isPatient = (): boolean => hasRole('patient')