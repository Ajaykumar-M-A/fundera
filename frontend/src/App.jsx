import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Layout from "./components/Layout/Layout";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";

const Login = lazy(() => import("./pages/Login/Login"));
const Register = lazy(() => import("./pages/Register/Register"));
const Dashboard = lazy(() => import("./pages/Dashboard/Dashboard"));
const AdminPanel = lazy(() => import("./pages/Admin/AdminPanel"));
const KycPage = lazy(() => import("./pages/KYC/KycPage"));
const StockDetails = lazy(() => import("./pages/StockDetails/StockDetails"));
const Watchlists = lazy(() => import("./pages/Watchlists/Watchlists"));
const Terms = lazy(() => import("./pages/Legal/Terms"));
const Privacy = lazy(() => import("./pages/Legal/Privacy"));

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={<div className="empty">Loading...</div>}>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute role="ADMIN">
                    <AdminPanel />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/kyc"
                element={
                  <ProtectedRoute>
                    <KycPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/watchlists"
                element={
                  <ProtectedRoute>
                    <Watchlists />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/stocks/:ticker"
                element={
                  <ProtectedRoute>
                    <StockDetails />
                  </ProtectedRoute>
                }
              />
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}
