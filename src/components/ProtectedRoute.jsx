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
        <p className="mt-4 text-xl text-foreground">جاري التحقق من الصلاحيات...</p>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (adminOnly && !isAdmin) {
    // إذا كان المستخدم ليس أدمن ويحاول الوصول لصفحة أدمن، يتم توجيهه للصفحة الرئيسية
    return <Navigate to="/" replace />;
  }
  
  // Outlet يسمح بعرض المسارات الفرعية المحمية (مثل صفحات لوحة التحكم وصفحات الملف الشخصي)
  return <Outlet />;
};

export default ProtectedRoute;
