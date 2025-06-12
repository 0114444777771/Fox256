// src/pages/UserProfilePage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/firebase';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, User, KeyRound, LogOut, ShoppingCart } from 'lucide-react';

const formatPrice = (price) => { /* ... */ };
const formatDate = (timestamp) => { /* ... */ };
const getStatusInfo = (status) => { /* ... */ };

const UserProfilePage = () => {
    const { currentUser } = useAuth();
    const { toast } = useToast();
    const [isUpdating, setIsUpdating] = useState(false);
    const [formData, setFormData] = useState({
      name: '',
      phone: '',
    });

    useEffect(() => {
        if (currentUser) {
            setFormData({
                name: currentUser.displayName || '',
                phone: currentUser.phoneNumber || '', // افترض أن رقم الهاتف قد يكون موجود
            });
        }
    }, [currentUser]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        if (!formData.name) {
          toast({ title: "خطأ", description: "حقل الاسم لا يمكن أن يكون فارغاً.", variant: "destructive" });
          return;
        }
        setIsUpdating(true);
        try {
          if (currentUser.displayName !== formData.name) {
            await updateProfile(currentUser, { displayName: formData.name });
          }
    
          const userDocRef = doc(db, 'users', currentUser.uid);
          await updateDoc(userDocRef, {
            displayName: formData.name,
            phone: formData.phone,
          }, { merge: true });
    
          toast({ title: "تم التحديث", description: "تم حفظ معلوماتك بنجاح." });
        } catch (error) {
          console.error("Error updating profile: ", error);
          toast({ title: "خطأ", description: "فشل تحديث المعلومات.", variant: "destructive" });
        } finally {
          setIsUpdating(false);
        }
    };
    
    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <CardHeader className="p-0 mb-6">
                <CardTitle className="text-2xl font-bold">المعلومات الشخصية</CardTitle>
                <CardDescription>قم بتحديث اسمك وبيانات الاتصال الخاصة بك.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
                <form onSubmit={handleUpdateProfile} className="space-y-6">
                    <div>
                        <Label htmlFor="name">الاسم الكامل</Label>
                        <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
                    </div>
                    <div>
                        <Label htmlFor="email">البريد الإلكتروني (لا يمكن تغييره)</Label>
                        <Input id="email" type="email" value={currentUser?.email || ''} disabled />
                    </div>
                    <div>
                        <Label htmlFor="phone">رقم الهاتف (اختياري)</Label>
                        <Input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} />
                    </div>
                    <Button type="submit" className="w-full sm:w-auto" disabled={isUpdating}>
                        {isUpdating ? <Loader2 className="animate-spin mr-2" /> : null}
                        {isUpdating ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                    </Button>
                </form>
            </CardContent>
        </motion.div>
    );
};

// 🔥🔥 المكون الجديد لصفحة الطلبات 🔥🔥
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
        });
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
                                <div key={order.id} className="border p-4 rounded-lg flex justify-between items-center">
                                    <div>
                                        <p className="font-semibold">طلب رقم #{order.id.slice(0, 8)}...</p>
                                        <p className="text-sm text-muted-foreground">{formatDate(order.createdAt)}</p>
                                        <Badge variant="outline" className={`${statusInfo.color} ${statusInfo.textColor} mt-2`}>{statusInfo.label}</Badge>
                                    </div>
                                    <div className="text-left">
                                        <p className="font-bold">{formatPrice(order.total)}</p>
                                        <Button asChild variant="link" className="p-0 h-auto">
                                            <Link to={`/order/${order.id}`}>عرض التفاصيل</Link>
                                        </Button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <p>لا توجد طلبات سابقة.</p>
                )}
            </CardContent>
        </motion.div>
    );
}

// تعديل بسيط على App.jsx لكي يعرض صفحة الطلبات
// <Route path="profile/orders" element={<UserOrdersPage />} />
// لكن যেহেতু UserProfilePage هو الافتراضي، سنتركه كما هو
export default UserProfilePage;
