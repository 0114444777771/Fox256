// src/components/ProductCard.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Star, PackageX } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import { useCart } from '@/contexts/CartContext'; // تأكد من أن مسار سلة التسوق صحيح

const ProductCard = ({ product }) => {
  const { toast } = useToast();
  // افترض أن لديك سياق (Context) للسلة بهذه الطريقة
  const { addItemToCart } = useCart();

  // التحقق من وجود المنتج أو بياناته
  if (!product) {
    return null; // لا تعرض أي شيء إذا لم يتم تمرير المنتج
  }

  const isOutOfStock = product.stock <= 0;

  const handleAddToCartClick = () => {
    // التحقق مرة أخرى قبل الإضافة
    if (isOutOfStock) {
      toast({
        title: "نفذ المخزون",
        description: `عفواً، منتج "${product.name}" غير متوفر حالياً.`,
        variant: "destructive",
      });
      return;
    }
    // افترض أن addItemToCart تتوقع كائن المنتج كاملاً
    addItemToCart(product, 1); // إضافة قطعة واحدة
    toast({
        title: "🛒 تمت الإضافة إلى السلة",
        description: `تم إضافة "${product.name}" إلى سلة التسوق.`,
        className: "bg-green-500 text-white",
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('ar-EG', { style: 'currency', currency: 'EGP' }).format(price || 0);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="w-full h-full"
    >
      <Card className={`overflow-hidden h-full flex flex-col group bg-white dark:bg-slate-800 border dark:border-slate-700 hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1 ${isOutOfStock ? 'opacity-70 bg-slate-50 dark:bg-slate-800/50' : ''}`}>
        <CardHeader className="p-0 relative">
          <Link to={`/products/${product.id}`} className={isOutOfStock ? 'pointer-events-none cursor-not-allowed' : ''}>
            {/* إطار الصورة */}
            <div className="aspect-square w-full overflow-hidden">
                <img  
                  alt={product.name || "صورة منتج"}
                  className="w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-110"
                  src={product.image || "https://via.placeholder.com/400?text=No+Image"} 
                />
            </div>
          </Link>

          {/* شارات الخصم ونفاذ المخزون */}
          {product.originalPrice && !isOutOfStock && (
            <Badge variant="destructive" className="absolute top-3 right-3 shadow-lg">
              خصم
            </Badge>
          )}
          {isOutOfStock && (
             <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/60 text-white text-sm font-bold px-4 py-2 rounded-md shadow-lg flex items-center backdrop-blur-sm">
              <PackageX className="mr-2 h-5 w-5" /> نفد المخزون
            </div>
          )}
        </CardHeader>
        
        <CardContent className="p-4 flex-grow flex flex-col">
          <div className="flex-grow">
            <span className="text-xs text-muted-foreground">{product.category || 'غير مصنف'}</span>
            <Link to={`/products/${product.id}`} className={isOutOfStock ? 'pointer-events-none' : ''}>
              <CardTitle className="text-base font-bold text-slate-800 dark:text-slate-200 hover:text-primary transition-colors mt-1 mb-2 h-12 overflow-hidden">
                {product.name || 'اسم المنتج غير متوفر'}
              </CardTitle>
            </Link>
            
            <div className="flex items-center text-sm text-slate-500 dark:text-slate-400 mb-3">
              <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
              <span>{product.rating || 0} ({product.reviews || 0} مراجعات)</span>
            </div>
          </div>

          <div>
            <div className="flex items-baseline space-x-2 space-x-reverse mb-2">
              <p className="text-xl font-extrabold text-primary">
                {formatPrice(product.price)}
              </p>
              {product.originalPrice && (
                <p className="text-sm text-muted-foreground line-through">
                  {formatPrice(product.originalPrice)}
                </p>
              )}
            </div>
             <p className="text-xs text-muted-foreground">المتاح: {product.stock || 0}</p>
          </div>
        </CardContent>

        <CardFooter className="p-3 border-t dark:border-slate-700/50 mt-auto">
          <Button 
            onClick={handleAddToCartClick} 
            className="w-full"
            disabled={isOutOfStock}
          >
            <ShoppingCart className="mr-2 h-4 w-4" /> 
            {isOutOfStock ? 'غير متوفر' : 'أضف إلى السلة'}
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default ProductCard;
