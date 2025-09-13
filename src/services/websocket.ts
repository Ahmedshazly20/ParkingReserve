import { AppDispatch } from '../store'
import { setConnected, updateZone } from '../store/slices/wsSlice'

const WS_URL = 'ws://localhost:3018/api/v1/ws'

export class WebSocketService {
  private ws: WebSocket | null = null
  private dispatch: AppDispatch
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectTimeout: NodeJS.Timeout | null = null

  constructor(dispatch: AppDispatch) {
    this.dispatch = dispatch
  }

  connect() {
    try {
      this.ws = new WebSocket(WS_URL)

      this.ws.onopen = () => {
        console.log('WebSocket connected')
        this.dispatch(setConnected(true))
        this.reconnectAttempts = 0
      }

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          this.handleMessage(data)
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error)
        }
      }

      this.ws.onclose = () => {
        console.log('WebSocket disconnected')
        this.dispatch(setConnected(false))
        this.attemptReconnect()
      }

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error)
        this.dispatch(setConnected(false))
      }
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error)
      this.attemptReconnect()
    }
  }

  disconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout)
    }
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
    this.dispatch(setConnected(false))
  }

  subscribeToGate(gateId: string) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'subscribe',
        payload: { gateId }
      }))
    }
  }

  private handleMessage(data: any) {
    switch (data.type) {
      case 'zone-update':
        this.dispatch(updateZone(data.payload))
        break
      case 'admin-update':
        // Handle admin updates
        console.log('Admin update received:', data.payload)
        break
      default:
        console.log('Unknown WebSocket message type:', data.type)
    }
  }

  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      this.reconnectTimeout = setTimeout(() => {
        console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`)
        this.connect()
      }, 2000 * this.reconnectAttempts)
    } else {
      console.log('Max reconnection attempts reached. WebSocket will remain disconnected.')
    }
  }
}