// src/pages/CheckoutPage.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import emailjs from '@emailjs/browser';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { db, collection, addDoc, Timestamp, doc, writeBatch, increment } from '@/firebase';
import { useCart } from '@/contexts/CartContext';
import { Loader2, Lock, ShoppingBag } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Combobox } from '@/components/ui/combobox';
import { countries } from '@/lib/countries';

// دالة التحقق المعدلة لتكون أكثر مرونة
const validateForm = (formData) => {
  const errors = {};
  if (!/^[a-zA-Z\u0600-\u06FF\s-']+$/.test(formData.firstName.trim())) errors.firstName = "الاسم الأول يجب أن يحتوي على حروف فقط.";
  if (!/^[a-zA-Z\u0600-\u06FF\s-']+$/.test(formData.lastName.trim())) errors.lastName = "الاسم الأخير يجب أن يحتوي على حروف فقط.";
  if (!/^\S+@\S+\.\S+$/.test(formData.email)) errors.email = "صيغة البريد الإلكتروني غير صحيحة.";
  // تحقق مرن من رقم الهاتف
  if (!/^\+?[0-9\s-()]{7,15}$/.test(formData.phone)) errors.phone = "صيغة رقم الهاتف غير صحيحة.";
  if (formData.address.trim().length < 10) errors.address = "العنوان يجب ألا يقل عن 10 أحرف.";
  if (formData.city.trim().length < 2) errors.city = "اسم المدينة يجب ألا يقل عن حرفين.";
  if (!formData.country) errors.country = "يرجى اختيار دولة.";
  // جعل الرمز البريدي اختياريًا ولكن إذا تم إدخاله، يتم التحقق منه
  if (formData.postalCode && !/^[a-zA-Z0-9\s-]{3,10}$/.test(formData.postalCode)) {
      errors.postalCode = "الرمز البريدي غير صالح.";
  }
  return errors;
};

const CheckoutPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { cartItems, cartTotal, clearCart } = useCart();
  const { currentUser } = useAuth();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    address: '', city: '', country: 'EG', // الدولة الافتراضية مصر
    postalCode: '', paymentMethod: 'cod'
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    if (cartItems.length === 0) {
      toast({
        title: "سلتك فارغة!",
        description: "يتم توجيهك لصفحة المنتجات.",
        variant: "destructive",
      });
      navigate('/products');
    }
  }, [cartItems, navigate, toast]);
  
  useEffect(() => {
    if (currentUser) {
        const nameParts = currentUser.displayName?.split(' ') || ['', ''];
        setFormData(prev => ({
            ...prev,
            email: currentUser.email || '',
            firstName: nameParts[0] || '',
            lastName: nameParts.slice(1).join(' ') || '',
            phone: currentUser.phoneNumber || '',
        }));
    }
  }, [currentUser]);

  const shippingCost = cartTotal > 0 ? 50 : 0; 
  const totalAmount = cartTotal + shippingCost;
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleCountryChange = (value) => {
    setFormData(prev => ({ ...prev, country: value, postalCode: '' })); // تفريغ الرمز البريدي عند تغيير الدولة
    if (formErrors.country) {
      setFormErrors(prev => ({ ...prev, country: null, postalCode: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!cartItems || cartItems.length === 0) return;

    const errors = validateForm(formData);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      toast({ title: "بيانات غير مكتملة", description: "يرجى مراجعة الحقول التي عليها علامة حمراء.", variant: "destructive" });
      return;
    }
    
    setIsSubmitting(true);
    try {
      const countryLabel = countries.find(c => c.value === formData.country)?.label || formData.country;
      const orderData = {
        userId: currentUser ? currentUser.uid : null,
        shipping: {
            fullName: `${formData.firstName.trim()} ${formData.lastName.trim()}`, 
            phone: formData.phone, 
            address: formData.address, 
            city: formData.city, 
            country: countryLabel,
            postalCode: formData.postalCode,
        },
        userEmail: formData.email,
        items: cartItems.map(item => ({ id: item.id, name: item.name, quantity: item.quantity, price: item.price, imageUrl: item.image || null })),
        subtotal: cartTotal,
        shippingCost: shippingCost,
        total: totalAmount,
        status: 'pending',
        paymentMethod: formData.paymentMethod,
        createdAt: Timestamp.now(),
      };
      
      const docRef = await addDoc(collection(db, 'orders'), orderData);
      
      const batch = writeBatch(db);
      cartItems.forEach(item => {
        const productRef = doc(db, "products", item.id);
        batch.update(productRef, { stock: increment(-item.quantity) });
      });
      await batch.commit();

      // --- كود إرسال الإيميلات ---
      const orderItemsHtml = cartItems.map(item => `
        <tr>
          <td style="padding:8px; border-bottom:1px solid #ddd;">${item.name}</td>
          <td style="padding:8px; border-bottom:1px solid #ddd; text-align:center;">${item.quantity}</td>
          <td style="padding:8px; border-bottom:1px solid #ddd; text-align:right;">${(item.price * item.quantity).toLocaleString('ar-EG', { style: 'currency', currency: 'EGP' })}</td>
        </tr>
      `).join('');

      const emailParams = {
        to_name: orderData.shipping.fullName,
        to_email: orderData.userEmail,
        order_id: docRef.id,
        order_total: totalAmount.toLocaleString('ar-EG', { style: 'currency', currency: 'EGP' }),
        order_address: `${orderData.shipping.address}, ${orderData.shipping.city}, ${orderData.shipping.country}`,
        order_items_html: orderItemsHtml,
        customer_phone: orderData.shipping.phone,
        payment_method: "الدفع عند الاستلام",
        order_subtotal: cartTotal.toLocaleString('ar-EG', { style: 'currency', currency: 'EGP' }),
        order_shipping_cost: shippingCost.toLocaleString('ar-EG', { style: 'currency', currency: 'EGP' }),
        from_name: "متجر Right Water",
        support_email: "rightwater156@gmail.com",
        client_email: orderData.userEmail, // لإيميل التاجر
        reply_to: orderData.userEmail,
      };

      try {
        // إرسال الإيميل للعميل
        await emailjs.send('service_0p2k5ih', 'template_bu792mf', emailParams, 'xpSKf6d4h11LzEOLz');
        // إرسال الإيميل للتاجر
        await emailjs.send('service_0p2k5ih', 'template_tboeo2t', { ...emailParams, to_email: "rightwater156@gmail.com"}, 'xpSKf6d4h11LzEOLz');
      } catch (emailError) {
        console.error("فشل إرسال الإيميل:", emailError);
        // لا توقف العملية بسبب فشل الإيميل، لكن يمكنك تسجيل الخطأ
      }
      
      clearCart();
      toast({ title: "🎉 تم إرسال طلبك بنجاح!", description: `شكراً لك. رقم طلبك هو: ${docRef.id}`, className: "bg-green-500 text-white", duration: 7000 });
      navigate(`/order-success/${docRef.id}`, { state: { orderData: { id: docRef.id, ...orderData } } });

    } catch (error) {
      console.error("Error placing order: ", error);
      toast({ title: "حدث خطأ", description: "لم نتمكن من إتمام طلبك. يرجى المحاولة لاحقاً.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground">جاري التحقق من السلة...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-4xl font-extrabold text-center mb-8 text-primary">إتمام عملية الدفع</motion.h1>
      <div className="grid lg:grid-cols-3 gap-8 items-start">
        <motion.form onSubmit={handleSubmit} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-2 space-y-4 bg-card p-6 rounded-xl shadow-xl">
           <h2 className="text-xl font-semibold border-b pb-2 mb-4">معلومات الشحن</h2>
           <div className="grid md:grid-cols-2 gap-4">
            <div>
                <Label htmlFor="firstName">الاسم الأول</Label>
                <Input id="firstName" name="firstName" value={formData.firstName} onChange={handleChange} required className={formErrors.firstName ? 'border-destructive' : ''} />
                {formErrors.firstName && <p className="text-destructive text-xs mt-1">{formErrors.firstName}</p>}
            </div>
            <div>
                <Label htmlFor="lastName">الاسم الأخير</Label>
                <Input id="lastName" name="lastName" value={formData.lastName} onChange={handleChange} required className={formErrors.lastName ? 'border-destructive' : ''} />
                {formErrors.lastName && <p className="text-destructive text-xs mt-1">{formErrors.lastName}</p>}
            </div>
            <div>
                <Label htmlFor="email">البريد الإلكتروني</Label>
                <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required className={formErrors.email ? 'border-destructive' : ''} />
                {formErrors.email && <p className="text-destructive text-xs mt-1">{formErrors.email}</p>}
            </div>
            <div>
                <Label htmlFor="phone">رقم الهاتف</Label>
                <Input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} required className={formErrors.phone ? 'border-destructive' : ''} />
                {formErrors.phone && <p className="text-destructive text-xs mt-1">{formErrors.phone}</p>}
            </div>
            <div className="md:col-span-2">
                <Label htmlFor="address">العنوان بالتفصيل (الشارع، رقم المبنى، إلخ)</Label>
                <Input id="address" name="address" value={formData.address} onChange={handleChange} required className={formErrors.address ? 'border-destructive' : ''} />
                {formErrors.address && <p className="text-destructive text-xs mt-1">{formErrors.address}</p>}
            </div>
             <div>
              <Label htmlFor="country">الدولة</Label>
              <Combobox
                options={countries}
                value={formData.country}
                onSelect={handleCountryChange}
                placeholder="اختر الدولة..."
                searchPlaceholder="ابحث عن دولة..."
                emptyPlaceholder="لم يتم العثور على الدولة."
                triggerClassName={formErrors.country ? 'border-destructive' : ''}
              />
              {formErrors.country && <p className="text-destructive text-xs mt-1">{formErrors.country}</p>}
            </div>
            <div>
                <Label htmlFor="city">المدينة / المحافظة</Label>
                <Input id="city" name="city" value={formData.city} onChange={handleChange} required className={formErrors.city ? 'border-destructive' : ''} />
                {formErrors.city && <p className="text-destructive text-xs mt-1">{formErrors.city}</p>}
            </div>
            <div className="md:col-span-2">
                <Label htmlFor="postalCode">الرمز البريدي (اختياري)</Label>
                <Input id="postalCode" name="postalCode" value={formData.postalCode} onChange={handleChange} className={formErrors.postalCode ? 'border-destructive' : ''} />
                {formErrors.postalCode && <p className="text-destructive text-xs mt-1">{formErrors.postalCode}</p>}
            </div>
          </div>
          <Button type="submit" className="w-full mt-6" size="lg" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Lock className="mr-2 h-4 w-4" />}
            {isSubmitting ? "جاري تنفيذ الطلب..." : "تأكيد الطلب والدفع عند الاستلام"}
          </Button>
        </motion.form>
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="sticky top-24">
          <Card className="p-6 shadow-xl rounded-xl bg-card">
             <CardHeader className="p-0 mb-4"><CardTitle className="text-center text-lg font-semibold text-primary">ملخص طلبك</CardTitle></CardHeader>
              <CardContent className="p-0">
                  <div className="max-h-60 overflow-y-auto pr-2 custom-scrollbar space-y-3 mb-3">
                      {cartItems.map(item => (
                          <div key={item.id} className="flex justify-between items-center border-b pb-2">
                              <div className="flex items-center gap-3">
                                <img src={item.image} alt={item.name} className="w-12 h-12 rounded-md object-cover" />
                                <div className="text-sm">
                                  <p className="font-semibold">{item.name}</p>
                                  <p className="text-muted-foreground">الكمية: {item.quantity}</p>
                                </div>
                              </div>
                              <p className="text-sm font-medium">{(item.price * item.quantity).toLocaleString('ar-EG', { style: 'currency', currency: 'EGP' })}</p>
                          </div>
                      ))}
                  </div>
                  <div className="pt-3 border-t space-y-2">
                      <div className="flex justify-between text-muted-foreground"><span>المجموع الفرعي:</span><span>{cartTotal.toLocaleString('ar-EG', { style: 'currency', currency: 'EGP' })}</span></div>
                      {shippingCost > 0 && (<div className="flex justify-between text-muted-foreground"><span>تكلفة الشحن:</span><span>{shippingCost.toLocaleString('ar-EG', { style: 'currency', currency: 'EGP' })}</span></div>)}
                      <div className="flex justify-between pt-2 border-t font-semibold text-lg"><span>الإجمالي الكلي:</span><span>{totalAmount.toLocaleString('ar-EG', { style: 'currency', currency: 'EGP' })}</span></div>
                  </div>
              </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default CheckoutPage;
