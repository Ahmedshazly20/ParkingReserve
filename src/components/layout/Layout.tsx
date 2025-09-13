import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { RootState } from '../../store'
import { WebSocketService } from '../../services/websocket'
import Sidebar from './Sidebar'
import Header from './Header'

let wsService: WebSocketService | null = null

const Layout: React.FC = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated } = useSelector((state: RootState) => state.auth)
  const { sidebarOpen } = useSelector((state: RootState) => state.ui)

  useEffect(() => {
    if (!wsService) {
      wsService = new WebSocketService(dispatch)
      wsService.connect()
    }

    return () => {
      if (wsService) {
        wsService.disconnect()
        wsService = null
      }
    }
  }, [dispatch])

  // Check if current route requires authentication
  const requiresAuth = location.pathname.startsWith('/admin') || location.pathname.startsWith('/checkpoint')
  const isAdminRoute = location.pathname.startsWith('/admin')

  useEffect(() => {
    if (requiresAuth && !isAuthenticated) {
      navigate('/login')
    }
  }, [requiresAuth, isAuthenticated, navigate])

  // Don't show sidebar on gate screens or login
  const showSidebar = isAdminRoute && isAuthenticated

  return (
    <div className="min-h-screen bg-background flex w-full">
      {showSidebar && <Sidebar />}
      
      <div className={`flex-1 flex flex-col ${showSidebar && sidebarOpen ? 'ml-64' : showSidebar ? 'ml-16' : ''} transition-all duration-300`}>
        <Header />
        
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default Layout