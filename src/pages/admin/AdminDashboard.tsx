import React from 'react'
import { useSelector } from 'react-redux'
import { Navigate, Link } from 'react-router-dom'
import { RootState } from '../../store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import { useParkingStateReport, useGates } from '../../services/api'
import { MdLocalParking, MdPeople, MdAssignment, MdSettings, MdRouter } from 'react-icons/md'

const AdminDashboard = () => {
  const { user, token, isAuthenticated } = useSelector((state) => state.auth)
  const { connected } = useSelector((state) => state.ws)
  const { data: parkingState, isLoading: isParkingStateLoading } = useParkingStateReport(token || '')
  const { data: gates, isLoading: isGatesLoading } = useGates()

  if (!isAuthenticated || user?.role !== 'admin') {
    return <Navigate to="/login" replace />
  }

  const totalSpaces = parkingState?.reduce((acc, zone) => acc + zone.occupied + zone.free, 0) || 0
  const totalOccupied = parkingState?.reduce((acc, zone) => acc + zone.occupied, 0) || 0
  const totalFree = parkingState?.reduce((acc, zone) => acc + zone.free, 0) || 0
  const occupancyRate = totalSpaces > 0 ? (totalOccupied / totalSpaces * 100).toFixed(1) : '0'

  const stats = [
    {
      title: 'Total Spaces',
      value: totalSpaces.toString(),
      description: 'Across all zones',
      icon: MdLocalParking,
      color: 'bg-primary'
    },
    {
      title: 'Occupied',
      value: totalOccupied.toString(),
      description: `${occupancyRate}% occupancy rate`,
      icon: MdAssignment,
      color: 'bg-occupied'
    },
    {
      title: 'Available',
      value: totalFree.toString(),
      description: 'Ready for new parkers',
      icon: MdPeople,
      color: 'bg-available'
    },
    {
      title: 'Zones Open',
      value: parkingState?.filter(zone => zone.open).length.toString() || '0',
      description: `${parkingState?.length || 0} total zones`,
      icon: MdSettings,
      color: 'bg-success'
    }
  ]

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-muted-foreground">Monitor and manage the parking system</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${stat.color}`}>
                  <Icon className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Zone Status Overview</CardTitle>
            <CardDescription>Real-time status of all parking zones</CardDescription>
          </CardHeader>
          <CardContent>
            {isParkingStateLoading ? (
              <div className="text-center py-4">Loading zone data...</div>
            ) : (
              <div className="space-y-3">
                {parkingState?.slice(0, 14).map(zone => (
                  <div key={zone.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-2 h-2 rounded-full ${zone.open ? 'bg-available' : 'bg-closed'}`} />
                      <div>
                        <p className="font-medium"> {zone.name}</p>
                        <p className="text-xs text-muted-foreground">{zone.category}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Badge variant={zone.open ? "available" : "closed"}>
                        {zone.open ? 'Open' : 'Closed'}
                      </Badge>
                      <span className="text-sm font-medium">
                        {zone.occupied}/{zone.occupied + zone.free}
                      </span>
                    </div>
                  </div>
                ))}
                
                {parkingState && parkingState.length > 6 && (
                  <div className="text-center text-sm text-muted-foreground pt-2">
                    And {parkingState.length - 6} more zones...
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
            <CardDescription>Current system health and connectivity</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">API Server</span>
              <Badge variant="available">Online</Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm">WebSocket Connection</span>
              <Badge variant={connected ? "available" : "destructive"}>
                {connected ? 'Connected' : 'Disconnected'}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm">Last Data Update</span>
              <span className="text-sm text-muted-foreground">
                {new Date().toLocaleTimeString()}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm">Active Sessions</span>
              <span className="text-sm font-medium">1 Admin</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Manage Gates</h2>
        {isGatesLoading ? (
          <div className="text-center py-4">Loading gates...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {gates?.map((gate) => (
              <Link key={gate.id} to={`/gate/${gate.id}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>{gate.name}</CardTitle>
                    <MdRouter className="h-6 w-6 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">Gate ID: {gate.id}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminDashboard