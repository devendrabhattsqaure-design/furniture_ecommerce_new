// admin-panel/src/App.jsx
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Dashboard, Auth } from "@/layouts";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { MaterialTailwindControllerProvider } from "@/context";
import { ThemeProvider } from "@material-tailwind/react";
import VerifyBill from "../src/pages/dashboard/BillingManagement/components/VerifyBill"; 

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/auth/sign-in" replace />;
};

// Public Route component
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return !isAuthenticated ? children : <Navigate to="/dashboard/home" replace />;
};

function AppContent() {
  return (
    <Routes>
      {/* ✅ PUBLIC ROUTES FIRST (no authentication required) */}
      <Route path="/verify-bill/:billId" element={<VerifyBill />} />
      <Route path="/verify/:billId" element={<VerifyBill />} />
      
      {/* Auth Routes - Public (only when not logged in) */}
      <Route 
        path="/auth/*" 
        element={
          <PublicRoute>
            <Auth />
          </PublicRoute>
        } 
      />
      
      {/* Dashboard Routes - Protected */}
      <Route 
        path="/dashboard/*" 
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } 
      />
      
      {/* Default Routes - Keep these at the END */}
      <Route path="/" element={<Navigate to="/dashboard/home" replace />} />
      <Route path="*" element={<Navigate to="/dashboard/home" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <MaterialTailwindControllerProvider>
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </MaterialTailwindControllerProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;