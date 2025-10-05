import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DashboardLayout } from "./components/layout/DashboardLayout";
import { ManagerDashboard } from "./components/pages/ManagerDashboard";
import { EnhancedFinance } from "./pages/EnhancedFinance";
import { Sales } from "./pages/Sales";
import { Operations } from "./pages/Operations";
import { Marketing } from "./pages/Marketing";
import { Customers } from "./pages/Customers";
import { Suppliers } from "./pages/Suppliers";
import { Reports } from "./pages/Reports";
import { Charts } from "./pages/Charts";
import { Download } from "./pages/Download";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import { DateProvider } from "./contexts/DateContext";
import { AuthProvider } from "./contexts/AuthContext";
import { ErrorBoundary } from "./components/ui/error-boundary";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

// Removed Placeholder components

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <DateProvider>
          <Toaster />
          <Sonner />
          <ErrorBoundary>
            <BrowserRouter>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <DashboardLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<ManagerDashboard />} />
                  <Route path="reports" element={<Reports />} />
                  <Route path="finance" element={<EnhancedFinance />} />
                  <Route path="sales" element={<Sales />} />
                  <Route path="operations" element={<Operations />} />
                  <Route path="marketing" element={<Marketing />} />
                  <Route path="customers" element={<Customers />} />
                  <Route path="suppliers" element={<Suppliers />} />
                  <Route path="charts" element={<Charts />} />
                  <Route path="download" element={<Download />} />
                </Route>
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </ErrorBoundary>
        </DateProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
