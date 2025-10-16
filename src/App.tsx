import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { DashboardLayout } from "./components/layout/DashboardLayout";
import { lazy, Suspense } from "react";
import { PageLoading, DashboardLoading, TablePageLoading } from "@/components/ui/page-loading";
const ManagerDashboard = lazy(() => import("./components/pages/ManagerDashboard").then(m => ({ default: m.ManagerDashboard })));
const EnhancedFinance = lazy(() => import("./pages/EnhancedFinance").then(m => ({ default: m.EnhancedFinance })));
const Sales = lazy(() => import("./pages/Sales").then(m => ({ default: m.Sales })));
const Operations = lazy(() => import("./pages/Operations").then(m => ({ default: m.Operations })));
const Marketing = lazy(() => import("./pages/Marketing").then(m => ({ default: m.Marketing })));
const Customers = lazy(() => import("./pages/Customers").then(m => ({ default: m.Customers })));
const Suppliers = lazy(() => import("./pages/Suppliers").then(m => ({ default: m.Suppliers })));
const Reports = lazy(() => import("./pages/Reports").then(m => ({ default: m.Reports })));
const Charts = lazy(() => import("./pages/Charts").then(m => ({ default: m.Charts })));
const Download = lazy(() => import("./pages/Download").then(m => ({ default: m.Download })));
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import { DateProvider } from "./contexts/DateContext";
import { AuthProvider } from "./contexts/AuthContext";
import { NotificationsProvider } from "./contexts/NotificationsContext";
import { ErrorBoundary } from "./components/ui/error-boundary";
import ProtectedRoute from "./components/ProtectedRoute";


// Removed Placeholder components

const App = () => (
  <TooltipProvider>
    <AuthProvider>
      <NotificationsProvider>
        <DateProvider>
          <Toaster />
          <Sonner />
          <ErrorBoundary>
            <BrowserRouter>
              <Routes>
                       {/* Root goes to Login */}
                       <Route path="/" element={<Login />} />

                       {/* Admin base */}
                       <Route
                         path="/admin"
                         element={
                           <ProtectedRoute>
                             <DashboardLayout />
                           </ProtectedRoute>
                         }
                       >
                         <Route index element={
                           <Suspense fallback={<DashboardLoading />}>
                             <ManagerDashboard />
                           </Suspense>
                         } />
                         <Route path="reports" element={<Suspense fallback={<TablePageLoading />}><Reports /></Suspense>} />
                         <Route path="finance" element={<Suspense fallback={<TablePageLoading />}><EnhancedFinance /></Suspense>} />
                         <Route path="sales" element={<Suspense fallback={<TablePageLoading />}><Sales /></Suspense>} />
                         <Route path="operations" element={<Suspense fallback={<TablePageLoading />}><Operations /></Suspense>} />
                         <Route path="marketing" element={<Suspense fallback={<TablePageLoading />}><Marketing /></Suspense>} />
                         <Route path="customers" element={<Suspense fallback={<TablePageLoading />}><Customers /></Suspense>} />
                         <Route path="suppliers" element={<Suspense fallback={<TablePageLoading />}><Suppliers /></Suspense>} />
                         <Route path="charts" element={<Suspense fallback={<DashboardLoading />}><Charts /></Suspense>} />
                         <Route path="download" element={<Suspense fallback={<PageLoading />}><Download /></Suspense>} />
                       </Route>

                       {/* Manager base (same layout) */}
                       <Route
                         path="/manager"
                         element={
                           <ProtectedRoute>
                             <DashboardLayout />
                           </ProtectedRoute>
                         }
                       >
                         <Route index element={
                           <Suspense fallback={<DashboardLoading />}>
                             <ManagerDashboard />
                           </Suspense>
                         } />
                         <Route path="reports" element={<Suspense fallback={<TablePageLoading />}><Reports /></Suspense>} />
                         <Route path="finance" element={<Suspense fallback={<TablePageLoading />}><EnhancedFinance /></Suspense>} />
                         <Route path="sales" element={<Suspense fallback={<TablePageLoading />}><Sales /></Suspense>} />
                         <Route path="operations" element={<Suspense fallback={<TablePageLoading />}><Operations /></Suspense>} />
                         <Route path="marketing" element={<Suspense fallback={<TablePageLoading />}><Marketing /></Suspense>} />
                         <Route path="customers" element={<Suspense fallback={<TablePageLoading />}><Customers /></Suspense>} />
                         <Route path="suppliers" element={<Suspense fallback={<TablePageLoading />}><Suppliers /></Suspense>} />
                         <Route path="charts" element={<Suspense fallback={<DashboardLoading />}><Charts /></Suspense>} />
                         <Route path="download" element={<Suspense fallback={<PageLoading />}><Download /></Suspense>} />
                       </Route>

                       {/* Legacy /login path redirect to root */}
                       <Route path="/login" element={<Navigate to="/" replace />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </ErrorBoundary>
        </DateProvider>
      </NotificationsProvider>
    </AuthProvider>
  </TooltipProvider>
);

export default App;
