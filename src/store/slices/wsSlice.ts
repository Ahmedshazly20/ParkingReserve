import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface Zone {
  id: string
  name: string
  category: string
  occupied: number
  free: number
  reserved: number
  availableForVisitors: number
  availableForSubscribers: number
  rateNormal: number
  rateSpecial: number
  open: boolean
  special?: boolean
  specialActive?: boolean
}

interface WsState {
  connected: boolean
  currentGateId: string | null
  zones: Zone[]
  lastUpdate: string | null
}

const initialState: WsState = {
  connected: false,
  currentGateId: null,
  zones: [],
  lastUpdate: null,
}

const wsSlice = createSlice({
  name: 'ws',
  initialState,
  reducers: {
    setConnected: (state, action: PayloadAction<boolean>) => {
      state.connected = action.payload
    },
    setCurrentGateId: (state, action: PayloadAction<string | null>) => {
      state.currentGateId = action.payload
    },
    updateZones: (state, action: PayloadAction<Zone[]>) => {
      state.zones = action.payload
      state.lastUpdate = new Date().toISOString()
    },
    updateZone: (state, action: PayloadAction<Zone>) => {
      const index = state.zones.findIndex(zone => zone.id === action.payload.id)
      if (index !== -1) {
        state.zones[index] = action.payload
      } else {
        state.zones.push(action.payload)
      }
      state.lastUpdate = new Date().toISOString()
    },
  },
})

export const { setConnected, setCurrentGateId, updateZones, updateZone } = wsSlice.actions
export default wsSlice.reducer