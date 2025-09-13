import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { Navigate } from 'react-router-dom'
import { RootState } from '../../store'
import { useCheckout, useTicket, useSubscription } from '../../services/api'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import { Separator } from '../../components/ui/separator'
import { useToast } from '../../hooks/use-toast'
import { MdQrCode, MdCarRental, MdReceiptLong } from 'react-icons/md'

const CheckpointScreen: React.FC = () => {
  const [ticketId, setTicketId] = useState('')
  const [scannedTicket, setScannedTicket] = useState<any>(null)
  const [checkoutResult, setCheckoutResult] = useState<any>(null)
  
  const { user, token, isAuthenticated } = useSelector((state: RootState) => state.auth)
  const { toast } = useToast()

  const { data: ticketData } = useTicket(ticketId, token || undefined)
  const { data: subscriptionData } = useSubscription(scannedTicket?.subscriptionId || '')
  const checkoutMutation = useCheckout(token || '')

  if (!isAuthenticated || user?.role !== 'employee') {
    return <Navigate to="/login" replace />
  }

  const handleScanTicket = () => {
    if (!ticketId.trim()) {
      toast({
        title: "Error",
        description: "Please enter a ticket ID",
        variant: "destructive",
      })
      return
    }

    if (ticketData) {
      setScannedTicket(ticketData)
    } else {
      toast({
        title: "Error",
        description: "Ticket not found",
        variant: "destructive",
      })
    }
  }

  const handleCheckout = async (forceConvertToVisitor = false) => {
    if (!scannedTicket) {
      toast({
        title: "Error",
        description: "Please scan a ticket first",
        variant: "destructive",
      })
      return
    }

    try {
      const result = await checkoutMutation.mutateAsync({
        ticketId: scannedTicket.id,
        forceConvertToVisitor
      })
      
      setCheckoutResult(result)
      setScannedTicket(null)
      setTicketId('')

      toast({
        title: "Checkout successful",
        description: `Total amount: $${result.amount?.toFixed(2) || '0.00'}`,
      })
    } catch (error) {
      toast({
        title: "Checkout failed",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      })
    }
  }

  const formatDuration = (hours: number) => {
    const wholeHours = Math.floor(hours)
    const minutes = Math.round((hours - wholeHours) * 60)
    return `${wholeHours}h ${minutes}m`
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Checkpoint</h1>
        <p className="text-muted-foreground">Scan ticket QR code to process checkout</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ticket Scanner */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MdQrCode className="h-5 w-5" />
              <span>Ticket Scanner</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ticketId">Ticket ID (Simulated QR Scan)</Label>
              <div className="flex space-x-2">
                <Input
                  id="ticketId"
                  value={ticketId}
                  onChange={(e) => setTicketId(e.target.value)}
                  placeholder="Paste or type ticket ID"
                  className="font-mono"
                />
                <Button onClick={handleScanTicket}>
                  Scan
                </Button>
              </div>
            </div>

            {scannedTicket && (
              <div className="bg-muted p-4 rounded-lg space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Ticket Found</span>
                  <Badge variant="outline" className="capitalize">
                    {scannedTicket.type}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Gate</p>
                    <p className="font-medium">{scannedTicket.gateId}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Zone</p>
                    <p className="font-medium">{scannedTicket.zoneId}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Check-in</p>
                    <p className="font-medium">
                      {new Date(scannedTicket.checkinAt).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Duration</p>
                    <p className="font-medium">
                      {formatDuration((Date.now() - new Date(scannedTicket.checkinAt).getTime()) / (1000 * 60 * 60))}
                    </p>
                  </div>
                </div>

                {scannedTicket.subscriptionId && subscriptionData && (
                  <div className="border-t pt-3">
                    <div className="flex items-center space-x-2 mb-2">
                      <MdCarRental className="h-4 w-4" />
                      <span className="font-medium">Subscription Details</span>
                    </div>
                    <div className="text-sm space-y-1">
                      <p>ID: {subscriptionData.id}</p>
                      <p>Category: {subscriptionData.category}</p>
                      <p>Cars: {subscriptionData.cars.join(', ')}</p>
                      <p className="text-muted-foreground">
                        Please verify the vehicle plate matches one of the registered cars
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex space-x-2 pt-3">
                  <Button 
                    onClick={() => handleCheckout(false)}
                    disabled={checkoutMutation.isPending}
                    className="flex-1"
                  >
                    {checkoutMutation.isPending ? 'Processing...' : 'Process Checkout'}
                  </Button>
                  
                  {scannedTicket.type === 'subscriber' && (
                    <Button 
                      variant="outline"
                      onClick={() => handleCheckout(true)}
                      disabled={checkoutMutation.isPending}
                    >
                      Convert to Visitor
                    </Button>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Checkout Result */}
        {checkoutResult && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MdReceiptLong className="h-5 w-5" />
                <span>Checkout Summary</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
        <div className="bg-success/10 text-success p-4 rounded-lg text-center">
          <div className="text-2xl font-bold">${checkoutResult.amount?.toFixed(2) || '0.00'}</div>
          <div className="text-sm">Total Amount</div>
        </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Duration:</span>
                  <span className="font-medium">
                    {formatDuration(checkoutResult.durationHours || 0)}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Check-out:</span>
                  <span className="font-medium">
                    {new Date().toLocaleString()}
                  </span>
                </div>
              </div>

              {checkoutResult.breakdown && checkoutResult.breakdown.length > 0 && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <h4 className="font-medium">Rate Breakdown</h4>
                    {checkoutResult.breakdown.map((segment: any, index: number) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span>
                          {formatDuration(segment.hours)} @ ${segment.rate}/hr ({segment.rateMode})
                        </span>
                        <span className="font-medium">${segment.amount.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}

              <Button
                variant="outline"
                className="w-full"
                onClick={() => setCheckoutResult(null)}
              >
                Process Next Ticket
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export default CheckpointScreen