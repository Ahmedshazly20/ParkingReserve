import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useLocation } from 'react-router-dom'
import { RootState } from '../../store'
import { toggleSidebar } from '../../store/slices/uiSlice'
import { logout } from '../../store/slices/authSlice'
import { Button } from '../ui/button'
import { MdMenu, MdLogout, MdWifi, MdWifiOff } from 'react-icons/md'
import { useToast } from '../../hooks/use-toast'

const Header: React.FC = () => {
  const dispatch = useDispatch()
  const location = useLocation()
  const { toast } = useToast()
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth)
  const { connected } = useSelector((state: RootState) => state.ws)

  const isAdminRoute = location.pathname.startsWith('/admin')
  const isGateRoute = location.pathname.startsWith('/gate')
  const isCheckpointRoute = location.pathname.startsWith('/checkpoint')

  const handleLogout = () => {
    dispatch(logout())
    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
    })
  }

  const getPageTitle = () => {
    if (isGateRoute) {
      const gateId = location.pathname.split('/')[2]
      return `Gate ${gateId?.toUpperCase() || ''}`
    }
    if (isCheckpointRoute) return 'Checkpoint'
    if (isAdminRoute) return 'Admin Dashboard'
    return 'Parking System'
  }

  return (
    <header className="bg-card border-b border-border h-16 flex items-center justify-between px-6 shadow-sm">
      <div className="flex items-center space-x-4">
        {isAdminRoute && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => dispatch(toggleSidebar())}
            className="lg:hidden"
          >
            <MdMenu className="h-5 w-5" />
          </Button>
        )}
        
        <div className="flex items-center space-x-3">
          <h1 className="text-xl font-semibold text-foreground">
            {getPageTitle()}
          </h1>
          
          {(isGateRoute || isCheckpointRoute) && (
            <div className="flex items-center space-x-2">
              {connected ? (
                <div className="flex items-center space-x-1 text-success">
                  <MdWifi className="h-4 w-4" />
                  <span className="text-sm font-medium">Connected</span>
                </div>
              ) : (
                <div className="flex items-center space-x-1 text-destructive">
                  <MdWifiOff className="h-4 w-4" />
                  <span className="text-sm font-medium">Disconnected</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="text-sm text-muted-foreground">
          {new Date().toLocaleTimeString()}
        </div>
        
        {isAuthenticated && user && (
          <div className="flex items-center space-x-3">
            <div className="text-sm">
              <div className="font-medium text-foreground">{user.username}</div>
              <div className="text-muted-foreground capitalize">{user.role}</div>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-muted-foreground hover:text-foreground"
            >
              <MdLogout className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </header>
  )
}

export default Header