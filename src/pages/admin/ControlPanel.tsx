import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { Navigate } from 'react-router-dom'
import { RootState } from '../../store'
import { useParkingStateReport, useUpdateZoneOpen, useUpdateCategoryRates, useAddRushHour, useAddVacation } from '../../services/api'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import { Switch } from '../../components/ui/switch'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import { Checkbox } from '../../components/ui/checkbox'
import { useToast } from '../../hooks/use-toast'
import { MdSettings, MdLocalParking, MdSchedule, MdVpnKey } from 'react-icons/md'

const ControlPanel: React.FC = () => {
  const [rateUpdateDialog, setRateUpdateDialog] = useState(false)
  const [rushHourDialog, setRushHourDialog] = useState(false)
  const [vacationDialog, setVacationDialog] = useState(false)
  
  const [rateUpdate, setRateUpdate] = useState({
    categoryId: '',
    rateNormal: 0,
    rateSpecial: 0
  })

  const [rushHour, setRushHour] = useState({
    startTime: '',
    endTime: '',
    days: [] as string[],
    multiplier: 1.5
  })

  const [vacation, setVacation] = useState({
    startDate: '',
    endDate: '',
    multiplier: 0.8
  })

  const { user, token, isAuthenticated } = useSelector((state: RootState) => state.auth)
  const { toast } = useToast()

  const { data: parkingState, isLoading } = useParkingStateReport(token || '')
  const updateZoneOpenMutation = useUpdateZoneOpen(token || '')
  const updateCategoryRatesMutation = useUpdateCategoryRates(token || '')
  const addRushHourMutation = useAddRushHour(token || '')
  const addVacationMutation = useAddVacation(token || '')

  if (!isAuthenticated || user?.role !== 'admin') {
    return <Navigate to="/login" replace />
  }

  const handleZoneToggle = async (zoneId: string, currentOpen: boolean) => {
    try {
      await updateZoneOpenMutation.mutateAsync({ zoneId, open: !currentOpen })
      toast({
        title: "Zone updated",
        description: `Zone ${zoneId} is now ${!currentOpen ? 'open' : 'closed'}`,
      })
    } catch (error) {
      toast({
        title: "Failed to update zone",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      })
    }
  }

  const handleRateUpdate = async () => {
    if (!rateUpdate.categoryId) {
      toast({
        title: "Error",
        description: "Please select a category",
        variant: "destructive",
      })
      return
    }

    try {
      await updateCategoryRatesMutation.mutateAsync(rateUpdate)
      toast({
        title: "Rates updated successfully",
        description: `Category ${rateUpdate.categoryId} rates have been updated`,
      })
      setRateUpdateDialog(false)
      setRateUpdate({ categoryId: '', rateNormal: 0, rateSpecial: 0 })
    } catch (error) {
      toast({
        title: "Failed to update rates",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      })
    }
  }

  const handleAddRushHour = async () => {
    if (!rushHour.startTime || !rushHour.endTime || rushHour.days.length === 0) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    try {
      await addRushHourMutation.mutateAsync(rushHour)
      toast({
        title: "Rush hour added successfully",
        description: "The new rush hour period has been configured",
      })
      setRushHourDialog(false)
      setRushHour({ startTime: '', endTime: '', days: [], multiplier: 1.5 })
    } catch (error) {
      toast({
        title: "Failed to add rush hour",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      })
    }
  }

  const handleAddVacation = async () => {
    if (!vacation.startDate || !vacation.endDate) {
      toast({
        title: "Error",
        description: "Please select start and end dates",
        variant: "destructive",
      })
      return
    }

    try {
      await addVacationMutation.mutateAsync(vacation)
      toast({
        title: "Vacation period added successfully",
        description: "The new vacation pricing has been configured",
      })
      setVacationDialog(false)
      setVacation({ startDate: '', endDate: '', multiplier: 0.8 })
    } catch (error) {
      toast({
        title: "Failed to add vacation period",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      })
    }
  }

  const categories = Array.from(new Set(parkingState?.map((zone: any) => zone.category) || []))
  const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

  const handleDayToggle = (day: string, checked: boolean) => {
    if (checked) {
      setRushHour(prev => ({ ...prev, days: [...prev.days, day] }))
    } else {
      setRushHour(prev => ({ ...prev, days: prev.days.filter(d => d !== day) }))
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Control Panel</h1>
        <p className="text-muted-foreground">Manage zones, rates, and special pricing periods</p>
      </div>

      <Tabs defaultValue="zones" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="zones">Zone Management</TabsTrigger>
          <TabsTrigger value="rates">Rate Management</TabsTrigger>
          <TabsTrigger value="special">Special Periods</TabsTrigger>
        </TabsList>

        <TabsContent value="zones" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MdLocalParking className="h-5 w-5" />
                <span>Zone Status Control</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-4">Loading zones...</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {parkingState?.map((zone: any) => (
                    <div key={zone.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{zone.name}</h4>
                          <p className="text-sm text-muted-foreground">{zone.category}</p>
                        </div>
                        <Badge variant={zone.open ? "default" : "secondary"}>
                          {zone.open ? 'Open' : 'Closed'}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-muted-foreground">Occupied:</span>
                          <span className="ml-1 font-medium">{zone.occupied}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Free:</span>
                          <span className="ml-1 font-medium">{zone.free}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <Label htmlFor={`zone-${zone.id}`} className="text-sm">
                          Zone Status
                        </Label>
                        <Switch
                          id={`zone-${zone.id}`}
                          checked={zone.open}
                          onCheckedChange={() => handleZoneToggle(zone.id, zone.open)}
                          disabled={updateZoneOpenMutation.isPending}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rates" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <MdVpnKey className="h-5 w-5" />
                  <span>Category Rate Management</span>
                </CardTitle>
                
                <Dialog open={rateUpdateDialog} onOpenChange={setRateUpdateDialog}>
                  <DialogTrigger asChild>
                    <Button>Update Rates</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Update Category Rates</DialogTitle>
                    </DialogHeader>
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Category</Label>
                        <select
                          className="w-full px-3 py-2 border rounded-md"
                          value={rateUpdate.categoryId}
                          onChange={(e) => setRateUpdate(prev => ({ ...prev, categoryId: e.target.value }))}
                        >
                          <option value="">Select a category</option>
                          {categories.map((category: string) => (
                            <option key={category} value={category}>{category}</option>
                          ))}
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Normal Rate ($/hr)</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={rateUpdate.rateNormal}
                            onChange={(e) => setRateUpdate(prev => ({ ...prev, rateNormal: parseFloat(e.target.value) || 0 }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Special Rate ($/hr)</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={rateUpdate.rateSpecial}
                            onChange={(e) => setRateUpdate(prev => ({ ...prev, rateSpecial: parseFloat(e.target.value) || 0 }))}
                          />
                        </div>
                      </div>

                      <div className="flex space-x-2 pt-4">
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={() => setRateUpdateDialog(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          className="flex-1"
                          onClick={handleRateUpdate}
                          disabled={updateCategoryRatesMutation.isPending}
                        >
                          {updateCategoryRatesMutation.isPending ? 'Updating...' : 'Update Rates'}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                Current rates are managed per category. Use the Update Rates button to modify pricing for specific categories.
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="special" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <MdSchedule className="h-5 w-5" />
                    <span>Rush Hour Periods</span>
                  </CardTitle>
                  
                  <Dialog open={rushHourDialog} onOpenChange={setRushHourDialog}>
                    <DialogTrigger asChild>
                      <Button size="sm">Add Rush Hour</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add Rush Hour Period</DialogTitle>
                      </DialogHeader>
                      
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Start Time</Label>
                            <Input
                              type="time"
                              value={rushHour.startTime}
                              onChange={(e) => setRushHour(prev => ({ ...prev, startTime: e.target.value }))}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>End Time</Label>
                            <Input
                              type="time"
                              value={rushHour.endTime}
                              onChange={(e) => setRushHour(prev => ({ ...prev, endTime: e.target.value }))}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Days of Week</Label>
                          <div className="grid grid-cols-2 gap-2">
                            {weekdays.map(day => (
                              <div key={day} className="flex items-center space-x-2">
                                <Checkbox
                                  id={day}
                                  checked={rushHour.days.includes(day)}
                                  onCheckedChange={(checked) => handleDayToggle(day, checked as boolean)}
                                />
                                <Label htmlFor={day} className="text-sm">{day}</Label>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Rate Multiplier</Label>
                          <Input
                            type="number"
                            step="0.1"
                            value={rushHour.multiplier}
                            onChange={(e) => setRushHour(prev => ({ ...prev, multiplier: parseFloat(e.target.value) || 1.5 }))}
                          />
                        </div>

                        <div className="flex space-x-2 pt-4">
                          <Button
                            variant="outline"
                            className="flex-1"
                            onClick={() => setRushHourDialog(false)}
                          >
                            Cancel
                          </Button>
                          <Button
                            className="flex-1"
                            onClick={handleAddRushHour}
                            disabled={addRushHourMutation.isPending}
                          >
                            {addRushHourMutation.isPending ? 'Adding...' : 'Add Rush Hour'}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  Configure rush hour periods with increased rates during peak times.
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <MdSettings className="h-5 w-5" />
                    <span>Vacation Periods</span>
                  </CardTitle>
                  
                  <Dialog open={vacationDialog} onOpenChange={setVacationDialog}>
                    <DialogTrigger asChild>
                      <Button size="sm">Add Vacation</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add Vacation Period</DialogTitle>
                      </DialogHeader>
                      
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Start Date</Label>
                            <Input
                              type="date"
                              value={vacation.startDate}
                              onChange={(e) => setVacation(prev => ({ ...prev, startDate: e.target.value }))}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>End Date</Label>
                            <Input
                              type="date"
                              value={vacation.endDate}
                              onChange={(e) => setVacation(prev => ({ ...prev, endDate: e.target.value }))}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Rate Multiplier</Label>
                          <Input
                            type="number"
                            step="0.1"
                            value={vacation.multiplier}
                            onChange={(e) => setVacation(prev => ({ ...prev, multiplier: parseFloat(e.target.value) || 0.8 }))}
                          />
                          <div className="text-xs text-muted-foreground">
                            Use values less than 1.0 for discounted rates (e.g., 0.8 = 20% discount)
                          </div>
                        </div>

                        <div className="flex space-x-2 pt-4">
                          <Button
                            variant="outline"
                            className="flex-1"
                            onClick={() => setVacationDialog(false)}
                          >
                            Cancel
                          </Button>
                          <Button
                            className="flex-1"
                            onClick={handleAddVacation}
                            disabled={addVacationMutation.isPending}
                          >
                            {addVacationMutation.isPending ? 'Adding...' : 'Add Vacation'}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  Configure vacation periods with discounted rates during low-demand times.
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default ControlPanel