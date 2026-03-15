import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import DashboardLayout from "@/components/DashboardLayout";
import Dashboard from "@/pages/Dashboard";
import SubmitObservation from "@/pages/SubmitObservation";
import Insights from "@/pages/Insights";
import ActivityLibrary from "@/pages/ActivityLibrary";
import Analytics from "@/pages/Analytics";
import ModelStatus from "@/pages/ModelStatus";
import Settings from "@/pages/Settings";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<DashboardLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/submit" element={<SubmitObservation />} />
            <Route path="/insights" element={<Insights />} />
            <Route path="/activities" element={<ActivityLibrary />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/status" element={<ModelStatus />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
