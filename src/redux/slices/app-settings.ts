import { PURGE } from 'redux-persist'
import persistReducer from 'redux-persist/es/persistReducer'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

import { createConfig } from 'src/utils/redux.utils'

type InitialState = {
  initialEmail: string
}




const initialState: InitialState = {
  initialEmail: '',
}

const appSettingsSlice = createSlice({
  name: 'appSettings',
  initialState,
  reducers: {
    setInitialEmail(state, action: PayloadAction<string>) {
      state.initialEmail = action.payload
    },
  },
  extraReducers(builder) {
    builder.addCase(PURGE, (state, action) => {
      state = initialState
      return state
    })
  },
})

export const {
  setInitialEmail,
} = appSettingsSlice.actions

const persistedAppSettingsSliceReducer = persistReducer(
  createConfig({
    key: 'app',
  }),
  appSettingsSlice.reducer
)

export default persistedAppSettingsSliceReducer

