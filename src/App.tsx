import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Provider } from 'react-redux';
import { store } from './store';
import Layout from './components/layout/Layout';
import Login from './pages/Login';
import GateScreen from './pages/gate/GateScreen';
import CheckpointScreen from './pages/checkpoint/CheckpointScreen';
import AdminDashboard from './pages/admin/AdminDashboard';
import ParkingState from './pages/admin/ParkingState';
import Employees from './pages/admin/Employees';
import ControlPanel from './pages/admin/ControlPanel';
import NotFound from "./pages/NotFound";
import GatesScreen from "./pages/gate/GatesScreen";

const queryClient = new QueryClient();

const App = () => (
  <Provider store={store}>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Login />} />
              <Route path="login" element={<Login />} />
              <Route path="gates" element={<GatesScreen />} />
              <Route path="gate/:gateId" element={<GateScreen />} />
              <Route path="checkpoint" element={<CheckpointScreen />} />
              <Route path="admin" element={<AdminDashboard />} />
              <Route path="admin/parking-state" element={<ParkingState />} />
              <Route path="admin/employees" element={<Employees />} />
              <Route path="admin/control" element={<ControlPanel />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </Provider>
);

export default App;
