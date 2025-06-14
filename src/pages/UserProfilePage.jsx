import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';
import { User, Package, Clock, Settings, LogOut, Loader2 } from 'lucide-react';
import { db, collection, query, where, orderBy, getDocs } from '@/firebase';

const UserProfilePage = () => {
  const { user, logout, updateUserProfile } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState({
    displayName: user?.displayName || '',
    email: user?.email || '',
    phone: user?.phoneNumber || ''
  });

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const q = query(
          collection(db, 'orders'),
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc')
        );
        const querySnapshot = await getDocs(q);
        const ordersList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setOrders(ordersList);
      } catch (error) {
        console.error('Error fetching orders:', error);
        toast({
          title: "خطأ في تحميل الطلبات",
          description: "حدث خطأ أثناء تحميل طلباتك السابقة.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    if (!user) return;
    try {
      await updateUserProfile({
        displayName: profileData.displayName
      });
      toast({
        title: "تم تحديث الملف الشخصي",
        description: "تم تحديث معلوماتك الشخصية بنجاح.",
      });
    } catch (error) {
      toast({
        title: "خطأ في تحديث الملف الشخصي",
        description: "حدث خطأ أثناء تحديث معلوماتك. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      });
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      toast({
        title: "خطأ في تسجيل الخروج",
        description: "حدث خطأ أثناء تسجيل الخروج. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      });
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('ar-EG', { style: 'currency', currency: 'EGP' }).format(price);
  };

  const formatDate = (timestamp) => {
    if (!timestamp || !timestamp.seconds) return 'تاريخ غير متوفر';
    return new Date(timestamp.seconds * 1000).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <p>الرجاء تسجيل الدخول لعرض هذه الصفحة.</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 dark:bg-slate-900 min-h-screen py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {/* Profile Sidebar */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="md:col-span-1"
            >
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
                <div className="text-center mb-6">
                  <div className="w-24 h-24 bg-sky-100 dark:bg-sky-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <User className="w-12 h-12 text-sky-500" />
                  </div>
                  <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200">
                    {user.displayName || 'المستخدم'}
                  </h2>
                  <p className="text-slate-500 dark:text-slate-400 text-sm">{user.email}</p>
                </div>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => { /* Scroll to orders section or navigate if on a different tab view */ }}
                  >
                    <Package className="mr-2 rtl:ml-2 rtl:mr-0 h-5 w-5" />
                    طلباتي
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => { /* Scroll to settings section */ }}
                  >
                    <Settings className="mr-2 rtl:ml-2 rtl:mr-0 h-5 w-5" />
                    إعدادات الحساب
                  </Button>
                  <Button
                    variant="destructive"
                    className="w-full justify-start"
                    onClick={handleLogout}
                  >
                    <LogOut className="mr-2 rtl:ml-2 rtl:mr-0 h-5 w-5" />
                    تسجيل الخروج
                  </Button>
                </div>
              </div>
            </motion.div>

            {/* Main Content */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="md:col-span-2 space-y-8"
            >
              {/* Profile Settings */}
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-6">
                  المعلومات الشخصية
                </h3>
                <form onSubmit={handleProfileUpdate} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="displayName">الاسم</Label>
                    <Input
                      id="displayName"
                      value={profileData.displayName}
                      onChange={(e) => setProfileData(prev => ({ ...prev, displayName: e.target.value }))}
                      className="dark:bg-slate-700"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">البريد الإلكتروني</Label>
                    <Input
                      id="email"
                      value={profileData.email}
                      disabled
                      className="bg-slate-50 dark:bg-slate-700/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">رقم الهاتف</Label>
                    <Input
                      id="phone"
                      value={profileData.phone}
                      onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                      className="dark:bg-slate-700"
                    />
                  </div>
                  <Button type="submit" className="bg-sky-500 hover:bg-sky-600 text-white">
                    حفظ التغييرات
                  </Button>
                </form>
              </div>

              {/* Recent Orders */}
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-6">
                  طلباتي السابقة
                </h3>
                {loading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 text-sky-500 animate-spin" />
                  </div>
                ) : orders.length > 0 ? (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div
                        key={order.id}
                        className="border dark:border-slate-700 rounded-lg p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-medium text-slate-800 dark:text-slate-200">
                              طلب #{order.id.slice(0, 8)}...
                            </p>
                            <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center">
                              <Clock className="w-4 h-4 mr-1 rtl:ml-1 rtl:mr-0" />
                              {formatDate(order.createdAt)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-sky-600 dark:text-sky-400">
                              {formatPrice(order.total)}
                            </p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                              {order.status === 'pending' ? 'قيد المعالجة' : order.status === 'shipped' ? 'تم الشحن' : order.status === 'delivered' ? 'تم التوصيل' : 'مكتمل'}
                            </p>
                          </div>
                        </div>
                        <div className="mt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-sm"
                            onClick={() => navigate(`/order/${order.id}`)}
                          >
                            عرض التفاصيل
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-slate-500 dark:text-slate-400 py-8">
                    لم تقم بأي طلبات حتى الآن
                  </p>
                )}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;
