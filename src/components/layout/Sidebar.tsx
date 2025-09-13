import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '../../store'
import { toggleSidebar } from '../../store/slices/uiSlice'
import { Button } from '../ui/button'
import { cn } from '../../lib/utils'
import { 
  MdDashboard, 
  MdPeople, 
  MdLocalParking, 
  MdSettings,
  MdChevronLeft,
  MdChevronRight
} from 'react-icons/md'

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: MdDashboard },
  { name: 'Employees', href: '/admin/employees', icon: MdPeople },
  { name: 'Parking State', href: '/admin/parking-state', icon: MdLocalParking },
  { name: 'Control Panel', href: '/admin/control', icon: MdSettings },
]

const Sidebar: React.FC = () => {
  const location = useLocation()
  const dispatch = useDispatch()
  const { sidebarOpen } = useSelector((state: RootState) => state.ui)

  return (
    <>
      {/* Sidebar */}
      <div className={cn(
        'fixed left-0 top-0 h-full bg-card border-r border-border transition-all duration-300 z-50',
        sidebarOpen ? 'w-64' : 'w-16'
      )}>
        <div className="flex flex-col h-full">
          {/* Logo/Brand */}
          <div className="h-16 flex items-center justify-between px-4 border-b border-border">
            {sidebarOpen && (
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <MdLocalParking className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="font-semibold text-foreground">ParkingAdmin</span>
              </div>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => dispatch(toggleSidebar())}
              className="shrink-0"
            >
              {sidebarOpen ? (
                <MdChevronLeft className="h-4 w-4" />
              ) : (
                <MdChevronRight className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-2 py-4 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.href
              
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={cn(
                    'flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  )}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  {sidebarOpen && (
                    <span className="ml-3 truncate">{item.name}</span>
                  )}
                </NavLink>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => dispatch(toggleSidebar())}
        />
      )}
    </>
  )
}

export default Sidebar