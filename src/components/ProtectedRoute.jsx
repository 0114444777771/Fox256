// src/components/ProtectedRoute.jsx (النسخة النهائية)

import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

const ProtectedRoute = ({ adminOnly = false }) => {
  const { currentUser, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-background">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
        <p className="mt-4 text-xl text-foreground">جاري التحقق...</p>
      </div>
    );
  }

  // إذا لم يكن هناك مستخدم مسجل، اذهب لصفحة الدخول
  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // إذا كانت الصفحة للأدمن فقط والمستخدم الحالي ليس أدمن، اذهب للصفحة الرئيسية
  if (adminOnly && !isAdmin) {
    return <Navigate to="/" replace />;
  }
  
  // إذا تم تجاوز كل عمليات التحقق، اعرض المكونات الفرعية
  return <Outlet />; 
};

export default ProtectedRoute;
