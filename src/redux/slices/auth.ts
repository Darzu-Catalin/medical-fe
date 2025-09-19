'use client'

import { PURGE } from 'redux-persist'
import persistReducer from 'redux-persist/es/persistReducer'
import { UserType, PermissionType, NotificationType } from '@/types/types'
import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit'
import { loginUserRequest, logoutUserRequest } from '@/requests/auth/auth.requests'

import { createConfig } from 'src/utils/redux.utils'

import { setSession } from 'src/auth/context/utils'

// eslint-disable-next-line import/no-cycle
// import { persistor } from '../store'

type InitialState = {
  user: UserType | null
  permissions: PermissionType[]
  token: string
  isLoading: boolean
  notificationLoading: boolean
  notifications: NotificationType[]
}

const initialState: InitialState = {
  user: null,
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

export const { setUser, setToken, setNotifications, markNotificationAsOpened, setPermissions } =
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
    thunkAPI.dispatch(setPermissions([]))
    thunkAPI.dispatch(setToken(''))

    return result
  } catch (err) {
    // Even if API call fails, clear local session/state so user is logged out
    setSession(null)
    localStorage.removeItem('accessToken')
    localStorage.removeItem('token')
    thunkAPI.dispatch(setUser(null))
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
