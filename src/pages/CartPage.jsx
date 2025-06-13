// src/pages/CartPage.jsx

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, PlusCircle, MinusCircle, ShoppingCart, ArrowLeft, CreditCard, PackageX } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import { useCart } from '@/contexts/CartContext';


const CartPage = () => {
  const { cartItems, updateItemQuantity, removeItemFromCart, cartTotal } = useCart();
  const { toast } = useToast();
  const navigate = useNavigate();

  const shippingCost = cartTotal > 0 ? 50 : 0; 
  const totalWithShipping = cartTotal + shippingCost;

  // --- بداية التعديل ---
  // تم تعديل هذه الدالة بالكامل
  const handleCheckout = () => {
    if (cartItems.length === 0) {
      toast({
        title: "سلة التسوق فارغة",
        description: "الرجاء إضافة منتجات إلى السلة قبل المتابعة للدفع.",
        variant: "destructive",
      });
      return;
    }
    
    const itemsExceedingStock = cartItems.filter(item => item.quantity > item.stock);
    if (itemsExceedingStock.length > 0) {
        toast({
            title: "كمية غير متوفرة",
            description: `يرجى تعديل الكميات لـ: ${itemsExceedingStock.map(i => i.name).join(', ')}. المخزون المتاح أقل من المطلوب.`,
            variant: "destructive",
        });
        return;
    }

    // هنا نقوم بتمرير كل البيانات بشكل منفصل لصفحة الدفع
    navigate('/checkout', { 
      state: { 
        cartItems: cartItems, 
        subtotal: cartTotal,      // المجموع الفرعي
        shippingCost: shippingCost, // تكلفة الشحن
        total: totalWithShipping, // الإجمالي الكلي
        fromCart: true 
      } 
    });
  };
  // --- نهاية التعديل ---

  return (
    <div className="container mx-auto px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-10 text-center"
      >
        <h1 className="text-5xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
          <ShoppingCart className="inline-block h-12 w-12 mr-3" /> سلة التسوق
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          راجع طلبك وقم بإجراء التعديلات اللازمة قبل المتابعة إلى الدفع.
        </p>
      </motion.div>

      {cartItems.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="text-center py-16"
        >
          <img alt="سلة تسوق فارغة" className="mx-auto w-64 h-64 mb-6 opacity-70" src="https://images.unsplash.com/photo-1641833278434-50f92b93d65a" />
          <h2 className="text-3xl font-semibold text-foreground mb-4">سلة التسوق فارغة!</h2>
          <p className="text-muted-foreground mb-8">
            لم تقم بإضافة أي منتجات إلى سلتك بعد. تصفح منتجاتنا الرائعة!
          </p>
          <Link to="/products">
            <Button size="lg" className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity">
              <ShoppingCart className="ml-2 h-5 w-5" /> تصفح المنتجات
            </Button>
          </Link>
        </motion.div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-8 items-start">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-2 space-y-6"
          >
            <AnimatePresence>
              {cartItems.map(item => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 50, transition: { duration: 0.3 } }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                >
                  <Card className="flex flex-col sm:flex-row items-center p-4 glassmorphism-card overflow-hidden">
                    <img
                      src={item.image || "https://images.unsplash.com/photo-1600857080039-639f0a2c6f93?auto=format&fit=crop&w=100&q=60"}
                      alt={item.name}
                      className="w-24 h-24 object-cover rounded-md mb-4 sm:mb-0 sm:mr-4 sm:ml-4"
                    />
                    <div className="flex-grow text-center sm:text-right">
                      <Link to={`/products/${item.id}`}>
                        <h3 className="text-lg font-semibold text-primary hover:underline">{item.name}</h3>
                      </Link>
                      <p className="text-sm text-muted-foreground">
                        السعر: {(item.price || 0).toLocaleString('ar-EG', { style: 'currency', currency: 'EGP' })}
                      </p>
                       {item.stock <= 0 && <p className="text-xs text-red-500 flex items-center justify-center sm:justify-start"><PackageX className="ml-1 h-3 w-3"/> نفذ المخزون</p>}
                       {item.stock > 0 && item.quantity > item.stock && <p className="text-xs text-red-500">الكمية المطلوبة تتجاوز المخزون ({item.stock})</p>}
                    </div>
                    <div className="flex items-center space-x-3 space-x-reverse my-4 sm:my-0 sm:mx-4">
                      <Button variant="ghost" size="icon" onClick={() => updateItemQuantity(item.id, item.quantity - 1)} disabled={item.quantity <= 1}>
                        <MinusCircle className="h-5 w-5 text-primary" />
                      </Button>
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => {
                            const newQuantity = parseInt(e.target.value);
                            if (!isNaN(newQuantity)) {
                                updateItemQuantity(item.id, newQuantity);
                            }
                        }}
                        min="1"
                        max={item.stock}
                        className="w-16 text-center bg-background/70 border-primary/30"
                        disabled={item.stock <= 0}
                      />
                      <Button variant="ghost" size="icon" onClick={() => updateItemQuantity(item.id, item.quantity + 1)} disabled={item.quantity >= item.stock || item.stock <= 0}>
                        <PlusCircle className="h-5 w-5 text-primary" />
                      </Button>
                    </div>
                    <p className="font-semibold text-lg text-foreground my-2 sm:my-0 sm:mr-4 sm:ml-4">
                      الإجمالي: {((item.price || 0) * item.quantity).toLocaleString('ar-EG', { style: 'currency', currency: 'EGP' })}
                    </p>
                    <Button variant="ghost" size="icon" onClick={() => removeItemFromCart(item.id)} className="text-red-500 hover:text-red-700">
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-1"
          >
            <Card className="p-6 glassmorphism-card shadow-xl sticky top-24">
              <CardHeader className="p-0 mb-6">
                <CardTitle className="text-2xl font-bold text-primary text-center">ملخص الطلب</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-0">
                <div className="flex justify-between text-muted-foreground">
                  <span>المجموع الفرعي</span>
                  <span>{cartTotal.toLocaleString('ar-EG', { style: 'currency', currency: 'EGP' })}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>تكلفة الشحن</span>
                  <span>{shippingCost.toLocaleString('ar-EG', { style: 'currency', currency: 'EGP' })}</span>
                </div>
                <hr className="my-2 border-border/50" />
                <div className="flex justify-between text-xl font-bold text-foreground">
                  <span>الإجمالي الكلي</span>
                  <span>{totalWithShipping.toLocaleString('ar-EG', { style: 'currency', currency: 'EGP' })}</span>
                </div>
              </CardContent>
              <CardFooter className="p-0 mt-8 flex flex-col space-y-3">
                <Button onClick={handleCheckout} size="lg" className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity text-lg py-3" disabled={cartItems.some(item => item.quantity > item.stock || item.stock <= 0) || cartItems.length === 0}>
                  <CreditCard className="ml-2 h-5 w-5" /> المتابعة إلى الدفع
                </Button>
                {cartItems.some(item => item.quantity > item.stock || item.stock <= 0) && (
                    <p className="text-xs text-red-500 text-center">يرجى تعديل الكميات للمنتجات غير المتوفرة أو التي تجاوزت المخزون.</p>
                )}
                <Link to="/products" className="w-full">
                  <Button variant="outline" size="lg" className="w-full text-primary border-primary hover:bg-primary/10">
                    <ArrowLeft className="ml-2 h-5 w-5" /> متابعة التسوق
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
