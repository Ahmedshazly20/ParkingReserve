import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface UiState {
  sidebarOpen: boolean
  currentGateTab: 'visitor' | 'subscriber'
  loading: {
    checkin: boolean
    checkout: boolean
    zones: boolean
  }
}

const initialState: UiState = {
  sidebarOpen: true,
  currentGateTab: 'visitor',
  loading: {
    checkin: false,
    checkout: false,
    zones: false,
  },
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload
    },
    setGateTab: (state, action: PayloadAction<'visitor' | 'subscriber'>) => {
      state.currentGateTab = action.payload
    },
    setLoading: (state, action: PayloadAction<{ key: keyof UiState['loading']; value: boolean }>) => {
      state.loading[action.payload.key] = action.payload.value
    },
  },
})

export const { toggleSidebar, setSidebarOpen, setGateTab, setLoading } = uiSlice.actions
export default uiSlice.reducer