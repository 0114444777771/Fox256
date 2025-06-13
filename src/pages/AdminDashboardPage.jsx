// src/pages/AdminDashboardPage.jsx

import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Users, ShoppingBag, DollarSign, Settings, BarChart3, Package, ListOrdered, MessageSquare, Bell } from 'lucide-react';
import { db, collection, onSnapshot, query, orderBy } from '@/firebase'; // تم التعديل
import { Button } from '@/components/ui/button';

// ------------------- المكونات المساعدة (بدون تغيير) -------------------
const StatCard = ({ title, value, icon, color, linkTo }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.4 }}
    className="h-full"
  >
    <Card className={`bg-white dark:bg-slate-800 shadow-lg hover:shadow-xl transition-shadow duration-300 border-l-4 border-${color}-500 dark:border-${color}-400 h-full flex flex-col`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-300">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="text-2xl font-bold text-slate-900 dark:text-slate-50">{value}</div>
      </CardContent>
      {linkTo && (
        <CardFooter className="pt-0">
          <Button variant="link" asChild className={`p-0 h-auto text-xs text-${color}-600 dark:text-${color}-400 hover:text-${color}-700`}>
            <Link to={linkTo}>عرض الكل →</Link>
          </Button>
        </CardFooter>
      )}
    </Card>
  </motion.div>
);

const ManagementLinkCard = ({ to, title, description, icon, bgColorClass }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: 0.1 }}
    className="h-full"
  >
    <Link to={to} className="block h-full group">
      <Card className={`${bgColorClass} text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 h-full flex flex-col justify-between p-6 rounded-lg`}>
        <div>
          <div className="p-3 bg-white/20 rounded-full w-fit mb-4 group-hover:bg-white/30 transition-colors">
            {icon}
          </div>
          <CardTitle className="text-xl sm:text-2xl font-semibold mb-2">{title}</CardTitle>
          <p className="text-sm opacity-90">{description}</p>
        </div>
        <div className="mt-4 text-right">
          <span className="text-sm font-medium group-hover:underline">الانتقال →</span>
        </div>
      </Card>
    </Link>
  </motion.div>
);
// ------------------- نهاية المكونات المساعدة -------------------


const AdminDashboardPage = () => {
  const [allOrders, setAllOrders] = useState([]);
  const [staticStats, setStaticStats] = useState({ users: 0, products: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // جلب البيانات الثابتة (المستخدمين والمنتجات) مرة واحدة
    const fetchStaticData = async () => {
      try {
        const { getDocs } = await import('firebase/firestore');
        const usersSnapshot = await getDocs(collection(db, 'users'));
        const productsSnapshot = await getDocs(collection(db, 'products'));
        setStaticStats({
          users: usersSnapshot.size,
          products: productsSnapshot.size,
        });
      } catch (error) {
        console.error("Error fetching static data: ", error);
      }
    };
    
    fetchStaticData();

    // الاستماع المستمر لتحديثات الطلبات
    const ordersQuery = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(ordersQuery, (snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAllOrders(ordersData);
      setLoading(false);
    }, (error) => {
      console.error("Error listening to orders: ", error);
      setLoading(false);
    });

    return () => unsubscribe(); // تنظيف المستمع عند الخروج
  }, []);

  // --- استخدام useMemo لحساب الإحصائيات بشكل تفاعلي من قائمة الطلبات ---
  const dynamicStats = useMemo(() => {
    const completedOrders = allOrders.filter(order => order.status === 'delivered');
    
    const revenue = completedOrders.reduce((sum, order) => sum + (order.total || 0), 0);
    
    return {
      totalOrders: allOrders.length,
      totalRevenue: revenue,
      recentOrders: allOrders.slice(0, 5),
    };
  }, [allOrders]); // إعادة الحساب فقط عند تغير `allOrders`

  // --- دوال مساعدة (بدون تغيير) ---
  const formatPrice = (price) => new Intl.NumberFormat('ar-EG', { style: 'currency', currency: 'EGP' }).format(price);
  const formatDate = (timestamp) => {
    if (!timestamp?.toDate) return '-';
    return new Date(timestamp.toDate()).toLocaleDateString('ar-EG', { day: '2-digit', month: 'short', year: 'numeric' });
  };
  const getStatusArabic = (status) => {
    const statuses = { pending: 'قيد الانتظار', processing: 'قيد المعالجة', shipped: 'تم الشحن', completed: 'مكتمل', cancelled: 'ملغي' };
    return statuses[status] || status;
  };

  const quickStatsCards = [
    { title: 'إجمالي المستخدمين', value: loading ? '...' : staticStats.users, icon: <Users className="h-6 w-6 text-sky-500" />, color: 'sky', linkTo: '/AdminDashboard/users' },
    { title: 'إجمالي الطلبات', value: loading ? '...' : dynamicStats.totalOrders, icon: <ListOrdered className="h-6 w-6 text-green-500" />, color: 'green', linkTo: '/AdminDashboard/orders' },
    { title: 'الإيرادات المكتملة', value: loading ? '...' : formatPrice(dynamicStats.totalRevenue), icon: <DollarSign className="h-6 w-6 text-amber-500" />, color: 'amber' },
    { title: 'المنتجات النشطة', value: loading ? '...' : staticStats.products, icon: <Package className="h-6 w-6 text-purple-500" />, color: 'purple', linkTo: '/AdminDashboard/products' },
  ];

  const managementLinks = [
    { to: '/AdminDashboard/products', title: 'إدارة المنتجات', description: 'إضافة، تعديل، وحذف المنتجات.', icon: <Package className="h-8 w-8 text-white" />, bgColorClass: 'bg-gradient-to-br from-sky-500 to-sky-700' },
    { to: '/AdminDashboard/orders', title: 'إدارة الطلبات', description: 'متابعة ومعالجة طلبات العملاء.', icon: <ListOrdered className="h-8 w-8 text-white" />, bgColorClass: 'bg-gradient-to-br from-green-500 to-green-700' },
    { to: '/AdminDashboard/users', title: 'إدارة المستخدمين', description: 'عرض وتعديل معلومات المستخدمين.', icon: <Users className="h-8 w-8 text-white" />, bgColorClass: 'bg-gradient-to-br from-purple-500 to-purple-700' },
    { to: '/AdminDashboard/settings', title: 'إعدادات الموقع', description: 'تكوين إعدادات المتجر العامة.', icon: <Settings className="h-8 w-8 text-white" />, bgColorClass: 'bg-gradient-to-br from-slate-500 to-slate-700' },
  ];

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 p-4 sm:p-6 lg:p-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col sm:flex-row justify-between items-center mb-8"
      >
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100">لوحة تحكم المدير</h1>
        <div className="flex items-center gap-2 mt-4 sm:mt-0">
          <Button variant="outline" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">3</span>
          </Button>
          <Button variant="outline">
            <MessageSquare className="mr-2 rtl:ml-2 rtl:mr-0 h-5 w-5" /> رسائل الدعم
          </Button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {quickStatsCards.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        {managementLinks.map((linkInfo) => (
          <ManagementLinkCard key={linkInfo.title} {...linkInfo} />
        ))}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div 
          className="lg:col-span-2"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="bg-white dark:bg-slate-800 shadow-lg h-full">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-slate-700 dark:text-slate-200">
                أحدث الطلبات
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? <p className="text-slate-500 dark:text-slate-400">جاري تحميل الطلبات...</p> :
              dynamicStats.recentOrders.length > 0 ? (
                <ul className="space-y-3">
                  {dynamicStats.recentOrders.map(order => (
                    <li key={order.id} className="flex justify-between items-center p-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-md transition-colors">
                      <div>
                        <Link to={`/AdminDashboard/orders/${order.id}`} className="font-medium text-sky-600 dark:text-sky-400 hover:underline">#{order.id.slice(0,8)}</Link>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{order.shipping?.fullName || order.userEmail}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-slate-700 dark:text-slate-200">{formatPrice(order.total)}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{formatDate(order.createdAt)} - {getStatusArabic(order.status)}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : <p className="text-slate-500 dark:text-slate-400">لا توجد طلبات حديثة.</p>}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="bg-white dark:bg-slate-800 shadow-lg h-full">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-slate-700 dark:text-slate-200">
                نظرة عامة على النشاط
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center text-slate-400 dark:text-slate-500">
                <BarChart3 size={48} />
                <p className="ml-4 rtl:mr-4">مخطط النشاط سيكون هنا</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
