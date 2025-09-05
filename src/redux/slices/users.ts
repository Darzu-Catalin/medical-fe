import { UserType } from '@/types/types'
import persistReducer from 'redux-persist/es/persistReducer'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

import { createConfig } from 'src/utils/redux.utils'

type InitialState = {
  selectedUser: UserType | null
  selectedUserTokens: any[]
}

const initialState: InitialState = {
  selectedUser: null,
  selectedUserTokens: [],
}

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    setSelectedUser(state, action: PayloadAction<UserType | null>) {
      // if payload is same as current user.requests.ts, do nothing
      if (JSON.stringify(state.selectedUser) === JSON.stringify(action.payload)) {
        return
      }
      state.selectedUser = action.payload
    },
    setSelectedUserTokens(state, action: PayloadAction<any[]>) {
      // if payload is same as current user.requests.ts, do nothing
      if (JSON.stringify(state.selectedUserTokens) === JSON.stringify(action.payload)) {
        return
      }
      state.selectedUserTokens = action.payload
    },
  },
  extraReducers: (builder) => {},
})

const persistedUsersReducer = persistReducer(
  createConfig({
    key: 'users',
    blacklist: ['selectedUserTokens', 'selectedUser'],
  }),
  usersSlice.reducer
)

export const { setSelectedUser, setSelectedUserTokens } = usersSlice.actions
export default persistedUsersReducer
