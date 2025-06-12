// src/components/admin/AdminLayout.jsx
import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { LayoutDashboard, Package, ListOrdered, Users, Settings, Home } from 'lucide-react';

const AdminLayout = () => {
  const navLinkClass = ({ isActive }) =>
    `flex items-center px-4 py-3 text-lg rounded-lg transition-colors ${
      isActive
        ? 'bg-sky-500 text-white shadow-md'
        : 'text-slate-100 hover:bg-white/20'
    }`;

  return (
    <div className="flex min-h-screen bg-slate-200 dark:bg-gray-900">
      <aside className="w-64 bg-slate-800 text-white p-4 flex flex-col shadow-lg">
        <div className="text-2xl font-bold mb-10 text-center">
          <Link to="/AdminDashboard">رايت واتر</Link>
        </div>
        <nav className="flex flex-col gap-3">
          <NavLink to="/AdminDashboard" end className={navLinkClass}>
            <LayoutDashboard className="mr-3 rtl:ml-3" /> لوحة التحكم
          </NavLink>
          <NavLink to="/AdminDashboard/orders" className={navLinkClass}>
            <ListOrdered className="mr-3 rtl:ml-3" /> إدارة الطلبات
          </NavLink>
          <NavLink to="/AdminDashboard/products" className={navLinkClass}>
            <Package className="mr-3 rtl:ml-3" /> إدارة المنتجات
          </NavLink>
          <NavLink to="/AdminDashboard/users" className={navLinkClass}>
            <Users className="mr-3 rtl:ml-3" /> إدارة المستخدمين
          </NavLink>
          <NavLink to="/AdminDashboard/settings" className={navLinkClass}>
            <Settings className="mr-3 rtl:ml-3" /> الإعدادات
          </NavLink>
        </nav>
        
        {/* 🔥 الزر الجديد هنا 🔥 */}
        <div className="mt-auto pt-4 border-t border-slate-700">
          <Link to="/" className="flex items-center justify-center px-4 py-3 text-lg rounded-lg transition-colors text-slate-300 hover:bg-white/10 hover:text-white">
            <Home className="mr-3 rtl:ml-3" /> العودة للموقع
          </Link>
        </div>
      </aside>

      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
