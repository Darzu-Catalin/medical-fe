import { UserType } from '@/types/types'

export const getUserDisplayName = (user: UserType | null) => {
  if (!user) {
    return 'Anonim'
  }

  if (user.first_name && user.last_name) {
    return `${user.first_name} ${user.last_name}`
  }

  if (user.first_name) {
    return user.first_name
  }

  if (user.last_name) {
    return user.last_name
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
