import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { cn } from '../../lib/utils'
import { MdLocalParking, MdClose, MdStar } from 'react-icons/md'

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

interface ZoneCardProps {
  zone: Zone
  isSelected: boolean
  onSelect: (zoneId: string) => void
  userType: 'visitor' | 'subscriber'
  subscription?: any
}

const ZoneCard: React.FC<ZoneCardProps> = ({
  zone,
  isSelected,
  onSelect,
  userType,
  subscription
}) => {
  const availableSpaces = userType === 'visitor' ? zone.availableForVisitors : zone.availableForSubscribers
  const currentRate = zone.specialActive ? zone.rateSpecial : zone.rateNormal
  
  const isDisabled = !zone.open || availableSpaces <= 0 || 
    (userType === 'subscriber' && subscription && subscription.category !== zone.category)

  const getStatusColor = () => {
    if (!zone.open) return 'closed'
    if (availableSpaces === 0) return 'occupied'
    if (availableSpaces > 0) return 'available'
    return 'muted'
  }

  const getStatusText = () => {
    if (!zone.open) return 'Closed'
    if (availableSpaces === 0) return 'Full'
    return `${availableSpaces} Available`
  }

  return (
    <Card 
      className={cn(
        'cursor-pointer transition-all duration-200 hover:shadow-md',
        isSelected && 'ring-2 ring-primary',
        isDisabled && 'opacity-60 cursor-not-allowed'
      )}
      onClick={() => !isDisabled && onSelect(zone.id)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center space-x-2">
            <MdLocalParking className="h-5 w-5" />
            <span>{zone.name}</span>
          </CardTitle>
          
          {!zone.open && (
            <MdClose className="h-5 w-5 text-closed" />
          )}
          
          {zone.specialActive && (
            <div className="flex items-center space-x-1 text-special">
              <MdStar className="h-4 w-4" />
              <span className="text-xs font-medium">Special Rate</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-xs">
            {zone.category}
          </Badge>
          <Badge 
            variant={getStatusColor() as any}
            className={cn(
              'text-xs font-medium',
              getStatusColor() === 'available' && 'bg-available text-available-foreground',
              getStatusColor() === 'occupied' && 'bg-occupied text-occupied-foreground',
              getStatusColor() === 'closed' && 'bg-closed text-closed-foreground'
            )}
          >
            {getStatusText()}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Occupied</p>
            <p className="font-medium">{zone.occupied}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Free</p>
            <p className="font-medium">{zone.free}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Reserved</p>
            <p className="font-medium">{zone.reserved}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Rate</p>
            <p className={cn(
              'font-medium',
              zone.specialActive && 'text-special'
            )}>
              ${currentRate}/hr
            </p>
          </div>
        </div>

        {userType === 'visitor' && (
          <div className="text-sm">
            <p className="text-muted-foreground">Available for Visitors</p>
            <p className="font-medium text-available">{zone.availableForVisitors}</p>
          </div>
        )}

        {userType === 'subscriber' && (
          <div className="text-sm">
            <p className="text-muted-foreground">Available for Subscribers</p>
            <p className="font-medium text-available">{zone.availableForSubscribers}</p>
          </div>
        )}

        {userType === 'subscriber' && subscription && subscription.category !== zone.category && (
          <div className="text-xs text-destructive bg-destructive/10 p-2 rounded">
            Category mismatch: Your subscription is for {subscription.category}
          </div>
        )}

        <Button
          variant={isSelected ? "default" : "outline"}
          className="w-full"
          disabled={isDisabled}
          onClick={(e) => {
            e.stopPropagation()
            if (!isDisabled) onSelect(zone.id)
          }}
        >
          {isSelected ? 'Selected' : 'Select Zone'}
        </Button>
      </CardContent>
    </Card>
  )
}

export default ZoneCard