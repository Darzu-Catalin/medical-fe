import { UserType, UserRole } from '@/types/types'
import { getUserRole, getRoleDisplayName } from './role.utils'

export const getUserDisplayName = (user: UserType | null) => {
  if (!user) {
    return 'Anonim'
  }

  if (user.firstName && user.lastName) {
    return `${user.firstName} ${user.lastName}`
  }

  if (user.firstName) {
    return user.firstName
  }

  if (user.lastName) {
    return user.lastName
  }

  return 'Anonim'
}

export const getUserAvatar = (user: UserType | null) => {
  // TODO: Add default avatar
  if (!user) {
    return 'https://i.pravatar.cc/300'
  }

  if (user.avatar) {
    return user.avatar.absolute_path
  }

  return 'https://i.pravatar.cc/300'
}

export const getUserRoleDisplayName = (user: UserType | null): string => {
  const role = getUserRole(user)
  return getRoleDisplayName(role)
}
