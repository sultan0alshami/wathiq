import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DashboardLayout } from "./components/layout/DashboardLayout";
import { ManagerDashboard } from "./components/pages/ManagerDashboard";
import { Finance } from "./pages/Finance";
import { Sales } from "./pages/Sales";
import { Operations } from "./pages/Operations";
import { Marketing } from "./pages/Marketing";
import { Customers } from "./pages/Customers";
import { Suppliers } from "./pages/Suppliers";
import { Reports } from "./pages/Reports";
import { Charts } from "./pages/Charts";
import { Download } from "./pages/Download";
import NotFound from "./pages/NotFound";
import { DateProvider } from "./contexts/DateContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <DateProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<DashboardLayout />}>
              <Route index element={<ManagerDashboard />} />
              <Route path="reports" element={<Reports />} />
              <Route path="finance" element={<Finance />} />
              <Route path="sales" element={<Sales />} />
              <Route path="operations" element={<Operations />} />
              <Route path="marketing" element={<Marketing />} />
              <Route path="customers" element={<Customers />} />
              <Route path="suppliers" element={<Suppliers />} />
              <Route path="charts" element={<Charts />} />
              <Route path="download" element={<Download />} />
            </Route>
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </DateProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
