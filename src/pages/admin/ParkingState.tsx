import React from 'react'
import { useSelector } from 'react-redux'
import { Navigate } from 'react-router-dom'
import { RootState } from '../../store'
import { useParkingStateReport } from '../../services/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table'
import { MdRefresh, MdLocalParking } from 'react-icons/md'

const ParkingState: React.FC = () => {
  const { user, token, isAuthenticated } = useSelector((state: RootState) => state.auth)
  const { data: parkingState, isLoading, refetch } = useParkingStateReport(token || '')

  if (!isAuthenticated || user?.role !== 'admin') {
    return <Navigate to="/login" replace />
  }

  const getStatusColor = (zone: any) => {
    if (!zone.open) return 'closed'
    if (zone.free === 0) return 'occupied'
    return 'available'
  }

  const getStatusText = (zone: any) => {
    if (!zone.open) return 'Closed'
    if (zone.free === 0) return 'Full'
    return 'Available'
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Parking State Report</h1>
          <p className="text-muted-foreground">Real-time overview of all parking zones</p>
        </div>
        
        <Button
          variant="outline"
          onClick={() => refetch()}
          disabled={isLoading}
        >
          <MdRefresh className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <MdLocalParking className="h-12 w-12 text-muted-foreground mx-auto mb-4 animate-pulse" />
            <p className="text-muted-foreground">Loading parking state data...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Zones</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{parkingState?.length || 0}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Open Zones</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-success">
                  {parkingState?.filter((zone: any) => zone.open).length || 0}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Spaces</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {parkingState?.reduce((acc: number, zone: any) => acc + zone.occupied + zone.free, 0) || 0}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Occupied</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-occupied">
                  {parkingState?.reduce((acc: number, zone: any) => acc + zone.occupied, 0) || 0}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Table */}
          <Card>
            <CardHeader>
              <CardTitle>Zone Details</CardTitle>
              <CardDescription>Detailed breakdown of each parking zone</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Zone</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Occupied</TableHead>
                      <TableHead className="text-right">Free</TableHead>
                      <TableHead className="text-right">Reserved</TableHead>
                      <TableHead className="text-right">Available (V)</TableHead>
                      <TableHead className="text-right">Available (S)</TableHead>
                      <TableHead className="text-right">Subscribers</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {parkingState?.map((zone: any) => (
                      <TableRow key={zone.id}>
                        <TableCell className="font-medium">{zone.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{zone.category}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={getStatusColor(zone) as any}
                            className={
                              getStatusColor(zone) === 'available' ? 'bg-available text-available-foreground' :
                              getStatusColor(zone) === 'occupied' ? 'bg-occupied text-occupied-foreground' :
                              'bg-closed text-closed-foreground'
                            }
                          >
                            {getStatusText(zone)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium">{zone.occupied}</TableCell>
                        <TableCell className="text-right font-medium">{zone.free}</TableCell>
                        <TableCell className="text-right font-medium">{zone.reserved}</TableCell>
                        <TableCell className="text-right font-medium text-available">
                          {zone.availableForVisitors}
                        </TableCell>
                        <TableCell className="text-right font-medium text-reserved">
                          {zone.availableForSubscribers}
                        </TableCell>
                        <TableCell className="text-right font-medium">{zone.subscriberCount}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              {(!parkingState || parkingState.length === 0) && (
                <div className="text-center py-8 text-muted-foreground">
                  No parking zones found
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}

export default ParkingState