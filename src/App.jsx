// src/App.jsx (النسخة النهائية والمعدلة لكل المسارات)

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { motion } from 'framer-motion';

// --- استيراد الموفرات والمكونات الأساسية ---
import { AuthProvider } from '@/contexts/AuthContext.jsx';
import { CartProvider } from '@/contexts/CartContext.jsx';
import Layout from '@/components/Layout.jsx';
import ProtectedRoute from '@/components/ProtectedRoute.jsx';
import { Toaster as HotToaster } from 'react-hot-toast';
import { Toaster as ShadToaster } from "@/components/ui/toaster.jsx";
import { Button } from '@/components/ui/button.jsx';

// --- استيراد الهياكل (Layouts) ---
import AdminLayout from '@/components/admin/AdminLayout.jsx';
import ProfileLayout from '@/components/ProfileLayout.jsx';

// --- استيراد كل الصفحات ---
import HomePage from '@/pages/HomePage.jsx';
import ProductsPage from '@/pages/ProductsPage.jsx';
import ProductDetailsPage from '@/pages/ProductDetailsPage.jsx';
import AboutPage from '@/pages/AboutPage.jsx';
import ContactPage from '@/pages/ContactPage.jsx';
import CartPage from '@/pages/CartPage.jsx';
import LoginPage from '@/pages/LoginPage.jsx';
import SignupPage from '@/pages/SignupPage.jsx';
import ForgotPasswordPage from '@/pages/ForgotPasswordPage.jsx';
import UserProfilePage from '@/pages/UserProfilePage.jsx';
import ChangePasswordPage from '@/pages/ChangePasswordPage.jsx';
import CheckoutPage from '@/pages/CheckoutPage.jsx';
import OrderSuccessPage from '@/pages/OrderSuccessPage.jsx';
import OrderDetailsPage from '@/pages/OrderDetailsPage.jsx';
import TermsConditionsPage from '@/pages/TermsConditionsPage.jsx';
import UserOrdersPage from '@/pages/UserOrdersPage.jsx'; 

// --- صفحات لوحة التحكم ---
import AdminDashboardPage from '@/pages/AdminDashboardPage.jsx';
import OrderManagement from '@/components/admin/OrderManagement.jsx';
import ProductManagement from '@/components/admin/ProductManagement.jsx';
import AdminSettings from '@/components/admin/AdminSettings.jsx';
import UserManagement from '@/components/admin/UserManagement.jsx';

// --- مكونات مساعدة ---
const AnimatedPage = ({ children }) => ( <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}> {children} </motion.div> );
const NotFoundPage = () => (
  <div className="text-center py-20 flex flex-col items-center justify-center min-h-[calc(100vh-250px)]">
    <motion.h1 initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 100, delay: 0.1 }} className="text-8xl font-bold text-primary mb-4">404</motion.h1>
    <motion.h2 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="text-2xl font-semibold mb-6">الصفحة غير موجودة</motion.h2>
    <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }} className="text-muted-foreground mb-8 max-w-sm">عذراً، لم نتمكن من العثور على الصفحة التي تبحث عنها.</motion.p>
    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }}>
      <Button asChild><Link to="/">العودة إلى الصفحة الرئيسية</Link></Button>
    </motion.div>
  </div>
);

// --- المكون الرئيسي للتطبيق ---
function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <Routes>
            {/* ======================= الهيكل الرئيسي للموقع العام ======================= */}
            <Route path="/" element={<Layout />}>
              {/* --- الصفحات العامة --- */}
              <Route index element={<AnimatedPage><HomePage /></AnimatedPage>} />
              <Route path="products" element={<AnimatedPage><ProductsPage /></AnimatedPage>} />
              <Route path="product/:productId" element={<AnimatedPage><ProductDetailsPage /></AnimatedPage>} />
              <Route path="cart" element={<AnimatedPage><CartPage /></AnimatedPage>} />
              <Route path="about" element={<AnimatedPage><AboutPage /></AnimatedPage>} />
              <Route path="contact" element={<AnimatedPage><ContactPage /></AnimatedPage>} />
              <Route path="login" element={<AnimatedPage><LoginPage /></AnimatedPage>} />
              <Route path="signup" element={<AnimatedPage><SignupPage /></AnimatedPage>} />
              <Route path="forgot-password" element={<AnimatedPage><ForgotPasswordPage /></AnimatedPage>} />
              <Route path="order-success/:orderId" element={<AnimatedPage><OrderSuccessPage /></AnimatedPage>} />
              <Route path="terms-conditions" element={<AnimatedPage><TermsConditionsPage /></AnimatedPage>} />

              {/* --- المسارات المحمية للمستخدم المسجل --- */}
              <Route element={<ProtectedRoute />}>
                <Route path="checkout" element={<AnimatedPage><CheckoutPage /></AnimatedPage>} />
                {/* دمجنا ProfileLayout هنا */}
                <Route path="profile" element={<ProfileLayout />}>
                  <Route index element={<UserProfilePage />} />
                  <Route path="orders" element={<UserOrdersPage />} />
                  <Route path="orders/:orderId" element={<OrderDetailsPage />} />
                  <Route path="change-password" element={<ChangePasswordPage />} />
                </Route>
              </Route>

              {/* الصفحة غير الموجودة (آخر حاجة في الهيكل العام) */}
              <Route path="*" element={<AnimatedPage><NotFoundPage /></AnimatedPage>} />
            </Route>
            
            {/* ======================= مسارات لوحة التحكم المحمية للأدمن ======================= */}
            <Route element={<ProtectedRoute adminOnly={true} />}>
              <Route path="/AdminDashboard" element={<AdminLayout />}>
                <Route index element={<AdminDashboardPage />} />
                <Route path="orders" element={<OrderManagement />} />
                <Route path="products" element={<ProductManagement />} />
                <Route path="users" element={<UserManagement />} />
                <Route path="settings" element={<AdminSettings />} />
              </Route>
            </Route>
          </Routes>
          <ShadToaster />
          <HotToaster position="bottom-center" />
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
