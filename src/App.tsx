import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { LoginPage } from "@/pages/LoginPage";
import { Dashboard } from "@/pages/Dashboard";
import { Tracking } from "@/pages/Tracking";
import { Parcels } from "@/pages/Parcels";
import { Branches } from "@/pages/Branches";
import { Merchants } from "@/pages/Merchants";
import { UsersPage } from "@/pages/UsersPage";
import { NewBooking } from "@/pages/NewBooking";
import { DeliveryUpdate } from "@/pages/DeliveryUpdate";
import { Riders } from "@/pages/Riders";
import { MerchantStatement } from "@/pages/MerchantStatement";
import { Reports } from "@/pages/Reports";
import { Accounts } from "@/pages/Accounts";
import { Settings } from "@/pages/Settings";
import { Toaster } from "sonner";

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <Toaster position="top-right" richColors closeButton />
      <Router>
        <Routes>
          {/* Public Routes (No Auth Required) */}
          <Route
            path="/login"
            element={
              <AuthLayout>
                <LoginPage />
              </AuthLayout>
            }
          />

          <Route
            path="/tracking"
            element={
              <div className="min-h-screen bg-slate-50 py-8 px-4">
                <Tracking />
              </div>
            }
          />

          {/* Secure Dashboard Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Dashboard />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/booking/new"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <NewBooking />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/reports"
            element={
              <ProtectedRoute allowedRoles={["ADMIN", "OPERATOR", "ACCOUNTS_USER"]}>
                <DashboardLayout>
                  <Reports />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/accounts"
            element={
              <ProtectedRoute allowedRoles={["ADMIN", "ACCOUNTS_USER"]}>
                <DashboardLayout>
                  <Accounts />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/merchant-statement"
            element={
              <ProtectedRoute allowedRoles={["ADMIN", "ACCOUNTS_USER", "OPERATOR"]}>
                <DashboardLayout>
                  <MerchantStatement />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/financials/statement"
            element={
              <ProtectedRoute allowedRoles={["ADMIN", "ACCOUNTS_USER", "OPERATOR"]}>
                <DashboardLayout>
                  <MerchantStatement />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/settings"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <DashboardLayout>
                  <Settings />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/delivery-update"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <DeliveryUpdate />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/riders"
            element={
              <ProtectedRoute allowedRoles={["ADMIN", "OPERATOR", "BRANCH_USER"]}>
                <DashboardLayout>
                  <Riders />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/parcels"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Parcels />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/branches"
            element={
              <ProtectedRoute allowedRoles={["ADMIN", "OPERATOR", "BRANCH_USER"]}>
                <DashboardLayout>
                  <Branches />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/merchants"
            element={
              <ProtectedRoute allowedRoles={["ADMIN", "OPERATOR", "ACCOUNTS_USER"]}>
                <DashboardLayout>
                  <Merchants />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/users"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <DashboardLayout>
                  <UsersPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* Catch-all redirect to Dashboard */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
