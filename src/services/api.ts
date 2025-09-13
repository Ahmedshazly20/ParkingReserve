import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const API_BASE_URL = 'http://localhost:3018/api/v1';

// Types
export interface Zone {
  id: string;
  name: string;
  categoryId: string; // Changed from 'category' to 'categoryId' for consistency
  gateIds: string[]; // Add this field if it doesn't exist
  occupied: number;
  free: number;
  reserved: number;
  availableForVisitors: number;
  availableForSubscribers: number;
  rateNormal: number;
  rateSpecial: number;
  open: boolean;
  special?: boolean;
  specialActive?: boolean;
}

export interface Gate {
  id: string;
  name: string;
  zones: string[];
}

export interface Ticket {
  id: string;
  gateId: string;
  zoneId: string;
  type: 'visitor' | 'subscriber';
  subscriptionId?: string;
  checkinAt: string;
  checkoutAt?: string;
  amount?: number;
  breakdown?: BreakdownSegment[];
  durationHours?: number;
}

export interface BreakdownSegment {
  rateMode: string;
  hours: number;
  rate: number;
  amount: number;
}

export interface Subscription {
  id: string;
  userId: string;
  category: string;
  cars: string[];
  active: boolean;
  startDate: string;
  endDate: string;
}

// API client with auth
const apiClient = {
  get: async (endpoint: string, token?: string) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  },

  post: async (endpoint: string, data: any, token?: string) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    return response.json();
  },

  put: async (endpoint: string, data: any, token?: string) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  },
};

// React Query hooks
export const useLogin = () => {
  return useMutation({
    mutationFn: (credentials: { username: string; password: string }) =>
      apiClient.post('/auth/login', credentials),
  });
};

export const useGates = () => {
  return useQuery({
    queryKey: ['gates'],
    queryFn: () => apiClient.get('/master/gates'),
  });
};

export const useZones = (gateId: string) => {
  return useQuery({
    queryKey: ['zones', gateId],
    queryFn: async () => {
      // Fetch all zones first
      const allZones: Zone[] = await apiClient.get('/master/zones');
      // Then filter them by gateId
      return allZones.filter(zone => zone.gateIds.includes(gateId));
    },
    enabled: !!gateId,
  });
};

export const useSubscription = (subscriptionId: string) => {
  return useQuery({
    queryKey: ['subscription', subscriptionId],
    queryFn: () => apiClient.get(`/subscriptions/${subscriptionId}`),
    enabled: !!subscriptionId,
  });
};

export const useCheckin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { gateId: string; zoneId: string; type: 'visitor' | 'subscriber'; subscriptionId?: string }) =>
      apiClient.post('/tickets/checkin', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['zones'] });
    },
  });
};

export const useCheckout = (token: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { ticketId: string; forceConvertToVisitor?: boolean }) =>
      apiClient.post('/tickets/checkout', data, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['zones'] });
    },
  });
};

export const useTicket = (ticketId: string, token?: string) => {
  return useQuery({
    queryKey: ['ticket', ticketId],
    queryFn: () => apiClient.get(`/tickets/${ticketId}`, token),
    enabled: !!ticketId,
  });
};

export const useParkingStateReport = (token: string) => {
  return useQuery({
    queryKey: ['parking-state'],
    queryFn: () => apiClient.get('/admin/reports/parking-state', token),
    enabled: !!token,
  });
};

// Admin management hooks
export const useUsers = (token: string) => {
  return useQuery({
    queryKey: ['users'],
    queryFn: () => apiClient.get('/admin/users', token),
    enabled: !!token,
  });
};

export const useCreateUser = (token: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userData: { username: string; password: string; role: string }) =>
      apiClient.post('/admin/users', userData, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

export const useUpdateZoneOpen = (token: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ zoneId, open }: { zoneId: string; open: boolean }) =>
      apiClient.put(`/admin/zones/${zoneId}/open`, { open }, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['zones'] });
      queryClient.invalidateQueries({ queryKey: ['parking-state'] });
    },
  });
};

export const useUpdateCategoryRates = (token: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ categoryId, rateNormal, rateSpecial }: { categoryId: string; rateNormal: number; rateSpecial: number }) =>
      apiClient.put(`/admin/categories/${categoryId}`, { rateNormal, rateSpecial }, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['zones'] });
      queryClient.invalidateQueries({ queryKey: ['parking-state'] });
    },
  });
};

export const useAddRushHour = (token: string) => {
  return useMutation({
    mutationFn: (rushHourData: { startTime: string; endTime: string; days: string[]; multiplier: number }) =>
      apiClient.post('/admin/rush-hours', rushHourData, token),
  });
};

export const useAddVacation = (token: string) => {
  return useMutation({
    mutationFn: (vacationData: { startDate: string; endDate: string; multiplier: number }) =>
      apiClient.post('/admin/vacations', vacationData, token),
  });
};