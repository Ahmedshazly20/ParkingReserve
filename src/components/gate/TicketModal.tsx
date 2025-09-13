import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Separator } from '../ui/separator'
import { MdPrint, MdCheckCircle } from 'react-icons/md'

interface TicketModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  ticket: any
  gateId?: string
}

const TicketModal: React.FC<TicketModalProps> = ({
  open,
  onOpenChange,
  ticket,
  gateId
}) => {
  const handlePrint = () => {
    window.print()
  }

  if (!ticket) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <MdCheckCircle className="h-5 w-5 text-success" />
            <span>Check-in Successful</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Gate Status */}
          <div className="bg-success/10 text-success rounded-lg p-4 text-center">
            <div className="text-2xl mb-2">🚗</div>
            <div className="text-lg font-semibold">Gate Opening</div>
            <div className="text-sm text-success/80">Please proceed to your parking zone</div>
          </div>

          {/* Ticket Details */}
          <div className="bg-card border rounded-lg p-4 space-y-3" id="ticket-print">
            <div className="text-center border-b pb-3">
              <h3 className="font-semibold text-lg">Parking Ticket</h3>
              <p className="text-sm text-muted-foreground">WeLink Cargo Parking System</p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Ticket ID:</span>
                <span className="font-mono font-medium">{ticket.id}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-muted-foreground">Gate:</span>
                <span className="font-medium">{gateId?.toUpperCase()}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-muted-foreground">Zone:</span>
                <span className="font-medium">{ticket.zoneId}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-muted-foreground">Type:</span>
                <Badge variant="outline" className="capitalize">
                  {ticket.type}
                </Badge>
              </div>
              
              <div className="flex justify-between">
                <span className="text-muted-foreground">Check-in Time:</span>
                <span className="font-medium">
                  {new Date(ticket.checkinAt).toLocaleString()}
                </span>
              </div>
              
              {ticket.subscriptionId && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subscription:</span>
                  <span className="font-mono text-sm">{ticket.subscriptionId}</span>
                </div>
              )}
            </div>

            <Separator />

            <div className="text-xs text-muted-foreground text-center">
              <p>Please keep this ticket for checkout</p>
              <p>Lost tickets will incur additional charges</p>
            </div>
          </div>

          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={handlePrint}
            >
              <MdPrint className="h-4 w-4 mr-2" />
              Print Ticket
            </Button>
            
            <Button 
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              Continue
            </Button>
          </div>
        </div>
      </DialogContent>

      {/* Print Styles */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @media print {
            body * {
              visibility: hidden;
            }
            #ticket-print, #ticket-print * {
              visibility: visible;
            }
            #ticket-print {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
            }
          }
        `
      }} />
    </Dialog>
  )
}

export default TicketModal