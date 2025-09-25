import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DashboardLayout } from "./components/layout/DashboardLayout";
import { ManagerDashboard } from "./components/pages/ManagerDashboard";
import { EnhancedFinance } from "./pages/EnhancedFinance"; // Re-add import
import { Sales } from "./pages/Sales"; // Re-add import
import { Operations } from "./pages/Operations"; // Re-add import
import { Marketing } from "./pages/Marketing"; // Re-add import
import { Customers } from "./pages/Customers"; // Re-add import
import { Suppliers } from "./pages/Suppliers"; // Re-add import
import { Reports } from "./pages/Reports"; // Re-add import
import { Charts } from "./pages/Charts"; // Re-add import
import { Download } from "./pages/Download"; // Re-add import
import NotFound from "./pages/NotFound"; // Re-add import
import { DateProvider } from "./contexts/DateContext";
import { ErrorBoundary } from "./components/ui/error-boundary";

const queryClient = new QueryClient();

// Removed Placeholder components

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <DateProvider>
        <Toaster />
        <Sonner />
        <ErrorBoundary>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<DashboardLayout />}>
                <Route index element={<ManagerDashboard />} />
                <Route path="reports" element={<Reports />} /> {/* Re-add Reports route */}
                <Route path="finance" element={<EnhancedFinance />} /> {/* Re-add Finance route */}
                <Route path="sales" element={<Sales />} /> {/* Re-add Sales route */}
                <Route path="operations" element={<Operations />} /> {/* Re-add Operations route */}
                <Route path="marketing" element={<Marketing />} /> {/* Re-add Marketing route */}
                <Route path="customers" element={<Customers />} /> {/* Re-add Customers route */}
                <Route path="suppliers" element={<Suppliers />} /> {/* Re-add Suppliers route */}
                <Route path="charts" element={<Charts />} /> {/* Re-add Charts route */}
                <Route path="download" element={<Download />} /> {/* Re-add Download route */}
              </Route>
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </ErrorBoundary>
      </DateProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
