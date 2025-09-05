// To update this file just call the endpoint

import { store } from "@/redux/store"

import { PermissionType } from "../types/types"

// {{baseUrl}}/api/general/get-permissions
export const PERMISSIONS = {
  ALL_PERMISSIONS: '*',
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
  // get store user.requests.ts
  const { user, permissions } = store.getState().auth

  if (!user) return false
  if (!permissions) return false

  if (Array.isArray(permission)) {
    return permission.some((p) => {
      const x = permissions.some((p2) => p2 === p || p2 === '*')
      return x
    })
  }

  return permissions.some((p) => {
    if (p === '*') return true

    if (p === permission) return true

    return false
  })
}