'use client'

import { PURGE } from 'redux-persist'
import persistReducer from 'redux-persist/es/persistReducer'
import { UserType, PermissionType, NotificationType, UserRole } from '@/types/types'
import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit'
import { loginUserRequest, logoutUserRequest } from '@/requests/auth/auth.requests'

import { createConfig } from 'src/utils/redux.utils'

import { setSession } from 'src/auth/context/utils'

// eslint-disable-next-line import/no-cycle
// import { persistor } from '../store'

type InitialState = {
  user: UserType | null
  userRole: UserRole
  permissions: PermissionType[]
  token: string
  isLoading: boolean
  notificationLoading: boolean
  notifications: NotificationType[]
}

const initialState: InitialState = {
  user: null,
  userRole: 'patient', // Default role
  permissions: [],
  token: '',
  isLoading: false,
  notificationLoading: false,
  notifications: [],
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<UserType | null>) {
      // if payload is same as current user.requests.ts, do nothing
      if (JSON.stringify(state.user) === JSON.stringify(action.payload)) {
        return
      }
      state.user = action.payload
      
      // Auto-detect and set user role when user is set
      if (action.payload) {
        // Check for role in multiple possible fields: role, userType, type, user_type, roles (array)
        let role = action.payload.role || action.payload.userType || action.payload.type || action.payload.user_type
        
        // Check if roles is an array and get the first role
        if (!role && action.payload.roles && Array.isArray(action.payload.roles) && action.payload.roles.length > 0) {
          role = action.payload.roles[0]
        }
        
        if (typeof role === 'string') {
          const normalizedRole = role.toLowerCase()
          
          if (normalizedRole.includes('admin') || normalizedRole === 'administrator') {
            state.userRole = 'admin'
          } else if (normalizedRole.includes('doctor') || normalizedRole.includes('physician') || normalizedRole === 'medical') {
            state.userRole = 'doctor'
          } else if (normalizedRole.includes('patient') || normalizedRole.includes('client') || normalizedRole === 'user') {
            state.userRole = 'patient'
          } else {
            state.userRole = 'patient'
          }
        } else if (typeof role === 'number') {
          switch (role) {
            case 1:
              state.userRole = 'admin'
              break
            case 2:
              state.userRole = 'doctor'
              break
            case 3:
              state.userRole = 'patient'
              break
            default:
              state.userRole = 'patient'
          }
        } else {
          state.userRole = 'patient'
        }
      } else {
        state.userRole = 'patient'
      }
    },
    setUserRole(state, action: PayloadAction<UserRole>) {
      state.userRole = action.payload
    },
    recalculateUserRole(state) {
      // Recalculate role from current user data
      if (state.user) {
        let role = state.user.role || state.user.userType || state.user.type || state.user.user_type
        
        // Check if roles is an array and get the first role
        if (!role && state.user.roles && Array.isArray(state.user.roles) && state.user.roles.length > 0) {
          role = state.user.roles[0]
        }
        
        if (typeof role === 'string') {
          const normalizedRole = role.toLowerCase()
          
          if (normalizedRole.includes('admin') || normalizedRole === 'administrator') {
            state.userRole = 'admin'
          } else if (normalizedRole.includes('doctor') || normalizedRole.includes('physician') || normalizedRole === 'medical') {
            state.userRole = 'doctor'
          } else if (normalizedRole.includes('patient') || normalizedRole.includes('client') || normalizedRole === 'user') {
            state.userRole = 'patient'
          } else {
            state.userRole = 'patient'
          }
        } else if (typeof role === 'number') {
          switch (role) {
            case 1:
              state.userRole = 'admin'
              break
            case 2:
              state.userRole = 'doctor'
              break
            case 3:
              state.userRole = 'patient'
              break
            default:
              state.userRole = 'patient'
          }
        } else {
          state.userRole = 'patient'
        }
      } else {
        state.userRole = 'patient'
      }
    },
    setToken(state, action: PayloadAction<string>) {
      // if payload is same as current token, do nothing
      if (state.token === action.payload) {
        return
      }

      state.token = action.payload
    },
    setPermissions(state, action: PayloadAction<PermissionType[]>) {
      state.permissions = action.payload
    },
    setNotifications(state, action: PayloadAction<NotificationType[]>) {
      state.notifications = action.payload
    },
    markNotificationAsOpened(state, action: PayloadAction<NotificationType>) {
      const notificationIndex = state.notifications.findIndex(
        (notification) => notification.id === action.payload.id
      )

      if (notificationIndex === -1) return

      state.notifications[notificationIndex].status = 'opened'
    },
    markAllNotificationsAsSeen(state) {
      state.notifications = state.notifications.map((notification) => {
        notification.status = 'opened'
        return notification
      })
    },
  },
  extraReducers: (builder) => {
    builder.addCase(PURGE, (state, action) => {
      state = initialState
      return state
    })

    builder.addCase(getNotificationsAsync.pending, (state, action) => {
      state.notificationLoading = true
    })

    builder.addCase(getNotificationsAsync.fulfilled, (state, action) => {
      state.notificationLoading = false
      state.notifications = action.payload
    })

    builder.addCase(getNotificationsAsync.rejected, (state, action) => {
      state.notificationLoading = false
    })
  },
})

const persistedAuthReducer = persistReducer(
  createConfig({
    key: 'auth',
    blacklist: ['isLoading'],
  }),
  authSlice.reducer
)

export const { setUser, setUserRole, recalculateUserRole, setToken, setNotifications, markNotificationAsOpened, setPermissions } =
  authSlice.actions
export default persistedAuthReducer

export const getNotificationsAsync = createAsyncThunk(
  'auth/getNotificationsAsync',
  async (
    {
      page = 1,
      per_page = 10,
    }: {
      page: number
      per_page: number
    },
    thunkAPI
  ) => 
    // const response = await getNotificationsRequest({
    //   page,
    //   per_page,
    // })

    // if (response.error) {
    //   return thunkAPI.rejectWithValue(response)
    // }

    // return response.notifications.data
     []
  
)

export const logoutAsync = createAsyncThunk('auth/logout', async (arg, thunkAPI) => {
  try {
    const result = await logoutUserRequest()
    // Clear session/headers and only remove our auth keys
    setSession(null)
    localStorage.removeItem('accessToken')
    localStorage.removeItem('token')

    // Clear redux state for this slice
    thunkAPI.dispatch(setUser(null))
    thunkAPI.dispatch(setUserRole('patient'))
    thunkAPI.dispatch(setPermissions([]))
    thunkAPI.dispatch(setToken(''))

    return result
  } catch (err) {
    // Even if API call fails, clear local session/state so user is logged out
    setSession(null)
    localStorage.removeItem('accessToken')
    localStorage.removeItem('token')
    thunkAPI.dispatch(setUser(null))
    thunkAPI.dispatch(setUserRole('patient'))
    thunkAPI.dispatch(setPermissions([]))
    thunkAPI.dispatch(setToken(''))
    return thunkAPI.rejectWithValue(err)
  }
})

// loginAsync
export const loginAsync = createAsyncThunk(
  'auth/login',
  async (
    {
      email,
      password,
    }: {
      email: string
      password: string
    },
    thunkAPI
  ) => {
    const response = await loginUserRequest({
      email,
      password,
    })

    if (response.error) {
      return thunkAPI.rejectWithValue(response)
    }

    // setUser
    thunkAPI.dispatch(setUser(response.data.user))
    const perms = Array.isArray(response.data.permissions) && response.data.permissions.length > 0
      ? response.data.permissions
      : ['*']
    thunkAPI.dispatch(setPermissions(perms))
    setSession(response.data.token)
    if (response.data.token) {
      thunkAPI.dispatch(setToken(response.data.token))
    }

    return thunkAPI.fulfillWithValue(response)
  }
)
