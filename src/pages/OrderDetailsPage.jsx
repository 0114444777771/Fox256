// src/pages/OrderDetailsPage.jsx

import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package, ArrowLeft, Loader2, Calendar, Hash, User, Phone, MapPin } from 'lucide-react';
import { db, doc, getDoc } from '@/firebase';

// --- دوال مساعدة تم نسخها ---
const formatPrice = (price) => {
  if (typeof price !== 'number') return 'N/A';
  return new Intl.NumberFormat('ar-EG', { style: 'currency', currency: 'EGP' }).format(price);
};

const formatDate = (timestamp) => {
  if (!timestamp?.toDate) return 'تاريخ غير معروف';
  return new Intl.DateTimeFormat('ar-EG', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  }).format(timestamp.toDate());
};

const getStatusInfo = (status) => {
    const statuses = {
      pending: { label: "قيد المراجعة", color: "bg-yellow-100 dark:bg-yellow-900/50", textColor: "text-yellow-800 dark:text-yellow-300" },
      processing: { label: "قيد المعالجة", color: "bg-blue-100 dark:bg-blue-900/50", textColor: "text-blue-800 dark:text-blue-300" },
      shipped: { label: "تم الشحن", color: "bg-sky-100 dark:bg-sky-900/50", textColor: "text-sky-800 dark:text-sky-300" },
      completed: { label: "مكتمل", color: "bg-green-100 dark:bg-green-900/50", textColor: "text-green-800 dark:text-green-300" },
      cancelled: { label: "ملغي", color: "bg-red-100 dark:bg-red-900/50", textColor: "text-red-800 dark:text-red-300" },
      'on-hold': { label: "في الانتظار", color: "bg-orange-100 dark:bg-orange-900/50", textColor: "text-orange-800 dark:text-orange-300" },
    };
    return statuses[status] || { label: status, color: "bg-slate-100 dark:bg-slate-700", textColor: "text-slate-800 dark:text-slate-300" };
};
// --- نهاية الدوال المساعدة ---


const OrderDetailsPage = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) return;
    const fetchOrder = async () => {
      setLoading(true);
      try {
        const orderDoc = await getDoc(doc(db, 'orders', orderId));
        if (orderDoc.exists()) {
          setOrder({ id: orderDoc.id, ...orderDoc.data() });
        }
      } catch (error) {
        console.error('Error fetching order:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);
  
  if (loading) return <div className="flex justify-center items-center h-screen"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
  if (!order) return <div className="text-center p-8"><h1>لم يتم العثور على الطلب المحدد.</h1></div>;

  const statusInfo = getStatusInfo(order.status);

  return (
    <div className="bg-slate-50 dark:bg-slate-900 min-h-screen py-12">
        <div className="container mx-auto px-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <Card className="max-w-4xl mx-auto shadow-xl">
                    <CardHeader className="border-b dark:border-slate-700 p-6">
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                            <div>
                                <CardTitle className="text-2xl font-bold flex items-center gap-2">
                                    <Hash className="h-6 w-6 text-primary" />
                                    <span>تفاصيل الطلب</span>
                                </CardTitle>
                                <CardDescription>رقم الطلب: {order.id}</CardDescription>
                            </div>
                            <Badge className={`text-sm px-3 py-1 ${statusInfo.color} ${statusInfo.textColor}`}>{statusInfo.label}</Badge>
                        </div>
                        <div className="text-sm text-slate-500 dark:text-slate-400 mt-4 flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>تاريخ الطلب: {formatDate(order.createdAt)}</span>
                        </div>
                    </CardHeader>

                    <CardContent className="p-6 space-y-8">
                        {/* معلومات الشحن */}
                        <section>
                            <h2 className="text-xl font-semibold mb-4">سيتم الشحن إلى</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-700 dark:text-slate-300">
                                <div className="flex items-center gap-3"><User className="h-5 w-5 text-primary" /><span>{order.shipping?.fullName}</span></div>
                                <div className="flex items-center gap-3"><Phone className="h-5 w-5 text-primary" /><span>{order.shipping?.phone}</span></div>
                                <div className="md:col-span-2 flex items-start gap-3"><MapPin className="h-5 w-5 text-primary mt-1" /><span>{`${order.shipping?.address}, ${order.shipping?.city}`}</span></div>
                            </div>
                        </section>

                        {/* المنتجات المطلوبة */}
                        <section>
                            <h2 className="text-xl font-semibold mb-4">المنتجات</h2>
                            <div className="space-y-4">
                                {order.items?.map(item => (
                                    <div key={item.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                                        <div className="flex items-center gap-4">
                                            <img src={item.imageUrl} alt={item.name} className="w-16 h-16 object-cover rounded-md" />
                                            <div>
                                                <p className="font-semibold">{item.name}</p>
                                                <p className="text-sm text-slate-500">الكمية: {item.quantity}</p>
                                            </div>
                                        </div>
                                        <p className="font-semibold">{formatPrice(item.price * item.quantity)}</p>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* ملخص الدفع */}
                        <section className="border-t dark:border-slate-700 pt-6">
                            <h2 className="text-xl font-semibold mb-4">ملخص الدفع</h2>
                            <div className="space-y-2 max-w-sm ml-auto rtl:mr-auto rtl:ml-0">
                                <div className="flex justify-between"><span className="text-slate-500">المجموع الفرعي:</span><span>{formatPrice(order.subtotal)}</span></div>
                                <div className="flex justify-between"><span className="text-slate-500">تكلفة الشحن:</span><span>{formatPrice(order.shippingCost)}</span></div>
                                <div className="flex justify-between font-bold text-lg border-t dark:border-slate-600 pt-2 mt-2"><span >الإجمالي الكلي:</span><span>{formatPrice(order.total)}</span></div>
                            </div>
                        </section>

                    </CardContent>
                </Card>

                <div className="text-center mt-8">
                    <Button asChild variant="outline">
                        <Link to="/profile">
                            <ArrowLeft className="ml-2 h-4 w-4" />
                            العودة إلى طلباتي
                        </Link>
                    </Button>
                </div>
            </motion.div>
        </div>
    </div>
  );
};

export default OrderDetailsPage;
