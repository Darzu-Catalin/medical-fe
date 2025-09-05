import persistReducer from 'redux-persist/es/persistReducer'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import {
  PartnerType,
  WorkplaceType,
  ContactPersonType,
} from '@/types/types'

import { createConfig } from 'src/utils/redux.utils'

type InitialState = {
  selectedPartner: PartnerType | null
  selectedContactPerson: ContactPersonType | null
  selectedWorkplace: WorkplaceType | null
  selectedMarker: any
}

const initialState: InitialState = {
  selectedPartner: null,
  selectedContactPerson: null,
  selectedWorkplace: null,
  selectedMarker: null,
}

const modelsSlice = createSlice({
  name: 'general',
  initialState,
  reducers: {
    setSelectedPartner(state, action: PayloadAction<PartnerType | null>) {
      // if payload is same as current user.requests.ts, do nothing
      if (JSON.stringify(state.selectedPartner) === JSON.stringify(action.payload)) {
        return
      }
      state.selectedPartner = action.payload
    },
    setSelectedContactPerson(state, action: PayloadAction<ContactPersonType | null>) {
      // if payload is same as current user.requests.ts, do nothing
      if (JSON.stringify(state.selectedContactPerson) === JSON.stringify(action.payload)) {
        return
      }
      state.selectedContactPerson = action.payload
    },
    setSelectedWorkplace(state, action: PayloadAction<WorkplaceType | null>) {
      // if payload is same as current user.requests.ts, do nothing
      if (JSON.stringify(state.selectedWorkplace) === JSON.stringify(action.payload)) {
        return
      }
      state.selectedWorkplace = action.payload
    },
    setSelectedMarker(state, action: PayloadAction<any>) {
      state.selectedMarker = action.payload
    },
  },
  extraReducers: (builder) => { },
})

const persistedGeneralReducer = persistReducer(
  createConfig({
    key: 'general',
    blacklist: [
      'selectedMarker',
      'selectedPartner',
      'selectedContactPerson',
      'selectedWorkplace',
      
    ],
  }),
  modelsSlice.reducer
)

export const {
  setSelectedPartner,
  setSelectedContactPerson,
  setSelectedWorkplace,
  setSelectedMarker,
} = modelsSlice.actions
export default persistedGeneralReducer
