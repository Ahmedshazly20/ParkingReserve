import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { setGateTab, setLoading } from '../../store/slices/uiSlice';
import { setCurrentGateId, updateZones } from '../../store/slices/wsSlice';
import { useZones, useSubscription, useCheckin } from '../../services/api';
import { WebSocketService } from '../../services/websocket';
import { Button } from '../../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import ZoneCard from '../../components/gate/ZoneCard';
import TicketModal from '../../components/gate/TicketModal';
import { useToast } from '../../hooks/use-toast';
import { MdRefresh } from 'react-icons/md';

let wsService: WebSocketService | null = null;

const GateScreen: React.FC = () => {
  const { gateId } = useParams<{ gateId: string }>();
  const dispatch = useDispatch();
  const { toast } = useToast();
  
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);
  const [subscriptionId, setSubscriptionId] = useState('');
  const [validatedSubscription, setValidatedSubscription] = useState<any>(null);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [ticket, setTicket] = useState<any>(null);

  const { currentGateTab } = useSelector((state: RootState) => state.ui);
  const { zones, connected } = useSelector((state: RootState) => state.ws);

  // Now, useZones will fetch and filter the zones by gateId internally
  const { data: zonesData, isLoading: zonesLoading, refetch: refetchZones } = useZones(gateId || '');
  const { data: subscriptionData } = useSubscription(subscriptionId);
  const checkinMutation = useCheckin();

  useEffect(() => {
    if (gateId) {
      dispatch(setCurrentGateId(gateId));
      
      if (!wsService) {
        wsService = new WebSocketService(dispatch);
        wsService.connect();
      }
      
      if (connected) {
        wsService.subscribeToGate(gateId);
      }
    }

    return () => {
      dispatch(setCurrentGateId(null));
    };
  }, [gateId, dispatch, connected]);

  useEffect(() => {
    // This effect now directly updates the Redux store with the already-filtered data
    if (zonesData) {
      dispatch(updateZones(zonesData));
    }
  }, [zonesData, dispatch]);

  useEffect(() => {
    if (subscriptionData) {
      setValidatedSubscription(subscriptionData);
    }
  }, [subscriptionData]);

  const handleZoneSelect = (zoneId: string) => {
    setSelectedZoneId(selectedZoneId === zoneId ? null : zoneId);
  };

  const handleSubscriptionValidation = async () => {
    if (!subscriptionId.trim()) {
      toast({
        title: "Error",
        description: "Please enter a subscription ID",
        variant: "destructive",
      });
      return;
    }

    setSubscriptionId(subscriptionId.trim());
  };

  const handleCheckin = async () => {
    if (!selectedZoneId || !gateId) {
      toast({
        title: "Error",
        description: "Please select a zone",
        variant: "destructive",
      });
      return;
    }

    const selectedZone = zones.find(z => z.id === selectedZoneId);
    if (!selectedZone?.open) {
      toast({
        title: "Error",
        description: "Selected zone is currently closed",
        variant: "destructive",
      });
      return;
    }

    if (currentGateTab === 'visitor' && selectedZone.availableForVisitors <= 0) {
      toast({
        title: "Error",
        description: "No spaces available for visitors in this zone",
        variant: "destructive",
      });
      return;
    }

    if (currentGateTab === 'subscriber') {
      if (!validatedSubscription) {
        toast({
          title: "Error",
          description: "Please validate subscription first",
          variant: "destructive",
        });
        return;
      }

      if (!validatedSubscription.active) {
        toast({
          title: "Error",
          description: "Subscription is not active",
          variant: "destructive",
        });
        return;
      }

      if (validatedSubscription.category !== selectedZone.categoryId) { // Corrected from 'category' to 'categoryId'
        toast({
          title: "Error",
          description: "Subscription category does not match zone category",
          variant: "destructive",
        });
        return;
      }
    }

    dispatch(setLoading({ key: 'checkin', value: true }));

    try {
      const checkinData = {
        gateId,
        zoneId: selectedZoneId,
        type: currentGateTab,
        ...(currentGateTab === 'subscriber' && { subscriptionId: validatedSubscription.id })
      };

      const result = await checkinMutation.mutateAsync(checkinData);
      
      setTicket(result);
      setShowTicketModal(true);
      setSelectedZoneId(null);
      
      if (currentGateTab === 'subscriber') {
        setSubscriptionId('');
        setValidatedSubscription(null);
      }

      toast({
        title: "Check-in successful!",
        description: `Ticket ${result.id} created`,
      });
    } catch (error: any) { // Type 'any' for the error to handle the Error object
      toast({
        title: "Check-in failed",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
    } finally {
      dispatch(setLoading({ key: 'checkin', value: false }));
    }
  };

  const canProceed = () => {
    if (!selectedZoneId) return false;
    
    const selectedZone = zones.find(z => z.id === selectedZoneId);
    if (!selectedZone?.open) return false;

    if (currentGateTab === 'visitor') {
      return selectedZone.availableForVisitors > 0;
    } else {
      return validatedSubscription && validatedSubscription.active && 
             validatedSubscription.category === selectedZone.categoryId; // Corrected from 'category' to 'categoryId'
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Gate {gateId?.toUpperCase()}</h1>
          <p className="text-muted-foreground">Select a parking zone to continue</p>
          {!connected && (
            <div className="flex items-center space-x-2 mt-2">
              <div className="w-2 h-2 bg-destructive rounded-full"></div>
              <span className="text-sm text-destructive">WebSocket disconnected</span>
            </div>
          )}
          {connected && (
            <div className="flex items-center space-x-2 mt-2">
              <div className="w-2 h-2 bg-success rounded-full"></div>
              <span className="text-sm text-success">Connected</span>
            </div>
          )}
        </div>
      
        <Button
          variant="outline"
          onClick={() => refetchZones()}
          disabled={zonesLoading}
        >
          <MdRefresh className={`h-4 w-4 mr-2 ${zonesLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <Tabs value={currentGateTab} onValueChange={(value) => dispatch(setGateTab(value as 'visitor' | 'subscriber'))}>
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="visitor">Visitor</TabsTrigger>
          <TabsTrigger value="subscriber">Subscriber</TabsTrigger>
        </TabsList>

        <TabsContent value="visitor" className="space-y-6">
          {zones.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-muted-foreground">
                {zonesLoading ? "Loading zones..." : "No zones available for this gate"}
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {zones.map((zone) => (
                  <ZoneCard
                    key={zone.id}
                    zone={zone}
                    isSelected={selectedZoneId === zone.id}
                    onSelect={handleZoneSelect}
                    userType="visitor"
                  />
                ))}
              </div>
              
              <div className="flex justify-center">
                <Button
                  onClick={handleCheckin}
                  disabled={!canProceed() || checkinMutation.isPending}
                  size="lg"
                  className="px-8"
                >
                  {checkinMutation.isPending ? 'Processing...' : 'Proceed to Check-in'}
                </Button>
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="subscriber" className="space-y-6">
          <div className="bg-card p-4 rounded-lg border">
            <div className="flex items-end space-x-4">
              <div className="flex-1">
                <Label htmlFor="subscriptionId">Subscription ID</Label>
                <Input
                  id="subscriptionId"
                  value={subscriptionId}
                  onChange={(e) => setSubscriptionId(e.target.value)}
                  placeholder="Enter subscription ID"
                />
              </div>
              <Button onClick={handleSubscriptionValidation}>
                Validate
              </Button>
            </div>
            
            {validatedSubscription && (
              <div className="mt-4 p-3 bg-muted rounded border">
                <p className="font-medium">Subscription Valid</p>
                <p className="text-sm text-muted-foreground">
                  Category: {validatedSubscription.category} | 
                  Status: {validatedSubscription.active ? 'Active' : 'Inactive'} |
                  Cars: {validatedSubscription.cars.join(', ')}
                </p>
              </div>
            )}
          </div>

          {zones.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-muted-foreground">
                {zonesLoading ? "Loading zones..." : "No zones available for this gate"}
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {zones.map((zone) => (
                  <ZoneCard
                    key={zone.id}
                    zone={zone}
                    isSelected={selectedZoneId === zone.id}
                    onSelect={handleZoneSelect}
                    userType="subscriber"
                    subscription={validatedSubscription}
                  />
                ))}
              </div>
              
              <div className="flex justify-center">
                <Button
                  onClick={handleCheckin}
                  disabled={!canProceed() || checkinMutation.isPending}
                  size="lg"
                  className="px-8"
                >
                  {checkinMutation.isPending ? 'Processing...' : 'Proceed to Check-in'}
                </Button>
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>

      <TicketModal
        open={showTicketModal}
        onOpenChange={setShowTicketModal}
        ticket={ticket}
        gateId={gateId}
      />
    </div>
  );
};

export default GateScreen;