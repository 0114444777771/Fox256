// src/pages/OrderSuccessPage.jsx

import React, { useEffect, useState } from 'react';
import { Link, useParams, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { CheckCircle, Package, ArrowRight, Loader2 } from 'lucide-react';
// لاحظ أننا لم نعد نستورد من firebase هنا بشكل مباشر لتحسين الأداء

const OrderSuccessPage = () => {
  const { orderId } = useParams();
  const location = useLocation();

  // الخطوة 1: حاول أخذ البيانات مباشرة من الـ state الذي تم تمريره
  const [order, setOrder] = useState(location.state?.orderData || null);
  // نظهر التحميل فقط إذا لم تكن البيانات موجودة
  const [loading, setLoading] = useState(!location.state?.orderData);

  // الخطوة 2: هذا الـ useEffect يعمل كـ "خطة بديلة"
  // إذا وصل المستخدم للصفحة مباشرة (عبر رابط مرسل بالإيميل مثلاً)
  useEffect(() => {
    // إذا لم يتم العثور على بيانات الطلب في الـ state، قم بجلبها من Firestore
    if (!order && orderId) {
      const fetchOrder = async () => {
        try {
          // استيراد أدوات Firestore عند الحاجة فقط (Dynamic Import)
          const { db, doc, getDoc } = await import('@/firebase');
          const orderDoc = await getDoc(doc(db, 'orders', orderId));

          if (orderDoc.exists()) {
            setOrder({ id: orderDoc.id, ...orderDoc.data() });
          }
        } catch (error) {
          console.error('Error fetching order:', error);
          // في حالة الخطأ، أوقف التحميل لعرض رسالة "لم يتم العثور على الطلب"
          setOrder(null);
        } finally {
          setLoading(false);
        }
      };

      fetchOrder();
    }
  }, [orderId, order]); // يتم تشغيله إذا تغير orderId أو إذا كان order فارغاً

  const formatPrice = (price) => {
    // تحقق للتأكد من أن السعر رقم قبل تنسيقه
    if (typeof price !== 'number') return '';
    return new Intl.NumberFormat('ar-EG', { style: 'currency', currency: 'EGP' }).format(price);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <Loader2 className="h-12 w-12 text-sky-500 animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="text-center p-4">
          <h1 className="text-2xl font-bold text-red-500 mb-4">عذراً، لم نتمكن من العثور على طلبك</h1>
          <p className="text-slate-600 dark:text-slate-400 mb-6">قد يكون الرابط غير صحيح أو تم حذف الطلب.</p>
          <Button asChild>
            <Link to="/">العودة للصفحة الرئيسية</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto bg-white dark:bg-slate-800 rounded-xl shadow-xl p-6 sm:p-8"
        >
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <CheckCircle className="w-12 h-12 text-green-500" />
            </motion.div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-200 mb-2">
              تم استلام طلبك بنجاح!
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mb-2">
              شكراً لك، {order.shipping?.fullName}. سنقوم بمعالجة طلبك في أقرب وقت.
            </p>
            <p className="text-sky-600 dark:text-sky-400 font-medium bg-sky-50 dark:bg-sky-900/50 rounded-md p-2 inline-block">
              رقم الطلب: {order.id}
            </p>
          </div>

          <div className="border-t border-b dark:border-slate-700 py-6 mb-6">
            <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-4 flex items-center">
              <Package className="mr-2 rtl:ml-2 rtl:mr-0 text-sky-500" />
              ملخص الطلب
            </h2>
            <div className="space-y-4">
              {order.items?.map((item) => (
                <div key={item.id || item.name} className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 rtl:space-x-reverse">
                    <img
                      src={item.imageUrl || 'https://via.placeholder.com/64'}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-lg border dark:border-slate-700"
                    />
                    <div>
                      <h3 className="font-medium text-slate-800 dark:text-slate-200">{item.name}</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">الكمية: {item.quantity}</p>
                    </div>
                  </div>
                  <p className="font-medium text-slate-800 dark:text-slate-200">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-4">سيتم الشحن إلى</h2>
            <div className="text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg">
                <p className="font-semibold">{order.shipping?.fullName}</p>
                <p>{order.shipping?.address}</p>
                <p>{order.shipping?.city}, {order.shipping?.country}</p>
                <p>الهاتف: {order.shipping?.phone}</p>
            </div>
          </div>

          <div className="border-t dark:border-slate-700 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
            <Button asChild variant="outline">
              <Link to="/products" className="w-full sm:w-auto flex items-center justify-center">
                <ArrowRight className="ml-2 rtl:mr-2 rtl:ml-0 h-4 w-4" />
                متابعة التسوق
              </Link>
            </Button>
            <div className="text-right">
              <p className="text-slate-500 dark:text-slate-400">المجموع الفرعي: {formatPrice(order.subtotal)}</p>
              <p className="text-slate-500 dark:text-slate-400">الشحن: {formatPrice(order.shippingCost)}</p>
              <p className="text-lg font-bold text-slate-800 dark:text-slate-200">الإجمالي: {formatPrice(order.total)}</p>
            </div>
          </div>

        </motion.div>
      </div>
    </div>
  );
};

export default OrderSuccessPage;
