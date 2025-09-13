import { configureStore } from '@reduxjs/toolkit'
import authSlice from './slices/authSlice'
import uiSlice from './slices/uiSlice'
import wsSlice from './slices/wsSlice'

export const store = configureStore({
  reducer: {
    auth: authSlice,
    ui: uiSlice,
    ws: wsSlice,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch