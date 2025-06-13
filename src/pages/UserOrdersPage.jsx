// src/pages/UserOrdersPage.jsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { db, collection, query, where, onSnapshot, orderBy } from '@/firebase';
import { Button } from '@/components/ui/button.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card.jsx';
import { Loader2 } from 'lucide-react';

// --- دوال مساعدة ---
const formatPrice = (price) => {
    if (typeof price !== 'number') return 'N/A';
    return new Intl.NumberFormat('ar-EG', { style: 'currency', currency: 'EGP' }).format(price);
};

const formatDate = (timestamp) => {
    if (!timestamp?.toDate) return 'تاريخ غير معروف';
    return new Intl.DateTimeFormat('ar-EG', {
        day: 'numeric', month: 'long', year: 'numeric'
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

const UserOrdersPage = () => {
    const { currentUser } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!currentUser) return;
        setLoading(true);
        const q = query(collection(db, 'orders'), where('userId', '==', currentUser.uid), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const userOrders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setOrders(userOrders);
            setLoading(false);
        }, () => setLoading(false));
        return () => unsubscribe();
    }, [currentUser]);

    if (loading) return <Loader2 className="h-8 w-8 animate-spin mx-auto mt-8" />;

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <CardHeader className="p-0 mb-6">
                <CardTitle className="text-2xl font-bold">طلباتي السابقة</CardTitle>
                <CardDescription>هنا يمكنك تتبع جميع طلباتك.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
                {orders.length > 0 ? (
                    <div className="space-y-4">
                        {orders.map(order => {
                            const statusInfo = getStatusInfo(order.status);
                            return (
                                <div key={order.id} className="border p-4 rounded-lg flex justify-between items-center hover:bg-muted/50 transition-colors">
                                    <div>
                                        <p className="font-semibold">طلب رقم #{order.id.slice(0, 8)}...</p>
                                        <p className="text-sm text-muted-foreground">{formatDate(order.createdAt)}</p>
                                        <Badge variant="outline" className={`${statusInfo.color} ${statusInfo.textColor} mt-2`}>{statusInfo.label}</Badge>
                                    </div>
                                    <div className="text-left">
                                        <p className="font-bold">{formatPrice(order.total)}</p>
                                        <Button asChild variant="link" className="p-0 h-auto text-primary">
                                            <Link to={`/profile/orders/${order.id}`}>عرض التفاصيل</Link>
                                        </Button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <p className="text-muted-foreground text-center py-8">لا توجد طلبات سابقة.</p>
                )}
            </CardContent>
        </motion.div>
    );
};

export default UserOrdersPage;
