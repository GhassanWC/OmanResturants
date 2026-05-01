import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/src/contexts/AuthContext';
import { Layout } from '@/src/components/Layout';
import { Toaster } from "@/components/ui/sonner";

// Lazy load pages for performance
const LandingPage = lazy(() => import('@/src/pages/LandingPage'));
const ListingPage = lazy(() => import('@/src/pages/ListingPage'));
const RestaurantDetailsPage = lazy(() => import('@/src/pages/RestaurantDetailsPage'));
const OwnerDashboard = lazy(() => import('@/src/pages/OwnerDashboard'));
const AdminDashboard = lazy(() => import('@/src/pages/AdminDashboard'));
const AuthPage = lazy(() => import('@/src/pages/AuthPage'));

const ProtectedRoute = ({ children, roles }: { children: React.ReactNode, roles?: string[] }) => {
  const { user, profile, loading } = useAuth();
  
  if (loading) return <div className="h-screen w-full flex items-center justify-center">جاري التحميل...</div>;
  if (!user) return <Navigate to="/auth" />;
  if (roles && profile && !roles.includes(profile.role)) return <Navigate to="/" />;
  
  return <>{children}</>;
};

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <Suspense fallback={<div className="h-screen w-full flex items-center justify-center">جاري التهيئة...</div>}>
          <Layout>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/restaurants" element={<ListingPage />} />
              <Route path="/restaurant/:id" element={<RestaurantDetailsPage />} />
              
              <Route 
                path="/dashboard/*" 
                element={
                  <ProtectedRoute roles={['restaurant_owner', 'admin']}>
                    <OwnerDashboard />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/admin/*" 
                element={
                  <ProtectedRoute roles={['admin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </Layout>
        </Suspense>
        <Toaster position="top-right" />
      </AuthProvider>
    </Router>
  );
}
