import { AnyAction, ThunkDispatch, configureStore } from '@reduxjs/toolkit'
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux'
import { FLUSH, PAUSE, PURGE, PERSIST, REGISTER, REHYDRATE, persistStore } from 'redux-persist'

// eslint-disable-next-line import/no-cycle
import persistedAuthReducer from './slices/auth'
import persistedUsersReducer from './slices/users'
import persistedGeneralReducer from './slices/general'
import persistedAppSettingsSliceReducer from './slices/app-settings'

// ----------------------------------------------------------------------


export const store = configureStore({
  reducer: {
    app: persistedAppSettingsSliceReducer,
    auth: persistedAuthReducer,
    users: persistedUsersReducer,
    general: persistedGeneralReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
})

export const persistor = persistStore(store)

export type AppThunkDispatch = ThunkDispatch<RootState, any, AnyAction>
export const useAppDispatch = () => useDispatch<AppThunkDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector
export type AppDispatch = typeof store.dispatch
export type RootState = ReturnType<typeof store.getState>
export type StoreType = typeof store
