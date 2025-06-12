// src/components/admin/ProductManagement.jsx

import React, { useState, useEffect } from 'react';
import { db, storage } from '@/firebase';
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { collection, doc, updateDoc, addDoc, deleteDoc, runTransaction, onSnapshot } from 'firebase/firestore';
import imageCompression from 'browser-image-compression';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog.jsx";
import { PlusCircle, Edit, Trash2, PackagePlus, Loader2, AlertTriangle, Search, FilterX, ImagePlus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import { Progress } from '@/components/ui/progress.jsx';

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { toast } = useToast();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [newProduct, setNewProduct] = useState({ name: '', category: '', price: 0, description: '', image: '', stock: 0, originalPrice: null });
  
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  
  const [stockUpdate, setStockUpdate] = useState({ amount: 0, type: 'add' });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setLoading(true);
    const productsCollectionRef = collection(db, 'products');
    const unsubscribe = onSnapshot(productsCollectionRef, (snapshot) => {
      const productList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProducts(productList);
      setLoading(false);
      setError(null);
    }, (err) => {
      console.error("Error fetching products: ", err);
      setError("حدث خطأ أثناء تحميل المنتجات.");
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleInputChange = (e, formSetter) => {
    const { name, value, type } = e.target;
    formSetter(prev => ({ ...prev, [name]: type === 'number' ? parseFloat(value) || 0 : value }));
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({ title: "ملف غير صالح", description: "يرجى اختيار ملف صورة.", variant: "destructive" });
      return;
    }

    setImagePreview(URL.createObjectURL(file));

    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1024,
      useWebWorker: true,
      initialQuality: 0.7
    };

    try {
      toast({ title: "جاري ضغط الصورة...", description: "هذه العملية سريعة جداً." });
      const compressedFile = await imageCompression(file, options);
      setImageFile(compressedFile);
      toast({ title: "✅ الصورة جاهزة للرفع!", className: "bg-green-500 text-white" });
    } catch (error) {
      console.error("Image compression error: ", error);
      toast({ title: "خطأ في ضغط الصورة", description: "سيتم رفع الصورة الأصلية.", variant: "destructive" });
      setImageFile(file);
    }
  };

  const resetImageState = () => {
    setImageFile(null);
    setImagePreview('');
    setUploadProgress(0);
    setIsUploading(false);
    const fileInput = document.getElementById('file-upload');
    if(fileInput) fileInput.value = '';
  };
  
  const uploadImageAndGetURL = (file) => {
    return new Promise((resolve, reject) => {
      if (!file) {
        reject(new Error("No file provided."));
        return;
      }
      setIsUploading(true);
      const storageRef = ref(storage, `products/${Date.now()}_${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on('state_changed',
        (snapshot) => setUploadProgress((snapshot.bytesTransferred / snapshot.totalBytes) * 100),
        (error) => {
          setIsUploading(false);
          toast({ title: "فشل رفع الصورة", description: error.message, variant: "destructive" });
          reject(error);
        },
        () => getDownloadURL(uploadTask.snapshot.ref).then(url => {
          setIsUploading(false);
          resolve(url);
        })
      );
    });
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!newProduct.name || newProduct.price <= 0) {
      toast({ title: "بيانات غير كاملة", description: "يرجى إدخال اسم المنتج وسعره.", variant: "destructive" });
      return;
    }
    if (!imageFile) {
      toast({ title: "صورة المنتج مطلوبة", description: "يرجى اختيار صورة للمنتج.", variant: "destructive" });
      return;
    }

    try {
      const imageUrl = await uploadImageAndGetURL(imageFile);
      await addDoc(collection(db, 'products'), {
        ...newProduct,
        image: imageUrl,
        price: Number(newProduct.price),
        stock: Number(newProduct.stock),
        originalPrice: newProduct.originalPrice ? Number(newProduct.originalPrice) : null,
      });
      toast({ title: "✅ تم إضافة المنتج", description: `تم إضافة "${newProduct.name}" بنجاح.`, className: "bg-green-500 text-white" });
      setIsAddModalOpen(false);
      resetImageState();
      setNewProduct({ name: '', category: '', price: 0, description: '', image: '', stock: 0, originalPrice: null });
    } catch (err) {
      toast({ title: "❌ خطأ في الإضافة", description: err.message, variant: "destructive" });
    }
  };

  const handleEditProduct = async (e) => {
    e.preventDefault();
    if (!currentProduct || !currentProduct.name || currentProduct.price <= 0) {
      toast({ title: "بيانات غير كاملة", variant: "destructive" });
      return;
    }

    try {
      let imageUrl = currentProduct.image;
      if (imageFile) {
        imageUrl = await uploadImageAndGetURL(imageFile);
      }
      
      const productRef = doc(db, 'products', currentProduct.id);
      await updateDoc(productRef, {
        ...currentProduct,
        image: imageUrl,
        price: Number(currentProduct.price),
        stock: Number(currentProduct.stock),
        originalPrice: currentProduct.originalPrice ? Number(currentProduct.originalPrice) : null,
      });
      
      toast({ title: "✅ تم تعديل المنتج", description: `تم تعديل "${currentProduct.name}" بنجاح.`, className: "bg-green-500 text-white" });
      setIsEditModalOpen(false);
      resetImageState();
      setCurrentProduct(null);
    } catch (err) {
      toast({ title: "❌ خطأ في التعديل", description: err.message, variant: "destructive" });
    }
  };

  const handleDeleteProduct = async (productId, productName) => {
     if (!window.confirm(`هل أنت متأكد أنك تريد حذف المنتج "${productName}"؟ هذا الإجراء لا يمكن التراجع عنه.`)) {
        return;
    }
    try {
      await deleteDoc(doc(db, 'products', productId));
      toast({ title: "🗑️ تم حذف المنتج", description: `تم حذف "${productName}" بنجاح.`, className: "bg-red-500 text-white" });
    } catch (err) {
      toast({ title: "❌ خطأ في الحذف", description: err.message, variant: "destructive" });
    }
  };

  const handleUpdateStock = async (e) => {
    e.preventDefault();
    if (!currentProduct) return;
    try {
      const productRef = doc(db, 'products', currentProduct.id);
      await runTransaction(db, async (transaction) => {
        const sfDoc = await transaction.get(productRef);
        if (!sfDoc.exists()) throw new Error("المنتج غير موجود!");
        let newStock = stockUpdate.type === 'add' ? (sfDoc.data().stock || 0) + Number(stockUpdate.amount) : Number(stockUpdate.amount);
        if (newStock < 0) newStock = 0;
        transaction.update(productRef, { stock: newStock });
      });
      toast({ title: "📦 تم تحديث المخزون", className: "bg-green-500 text-white" });
      setIsStockModalOpen(false);
      setCurrentProduct(null);
      setStockUpdate({ amount: 0, type: 'add' });
    } catch (err) {
      toast({ title: "❌ خطأ في تحديث المخزون", description: err.message, variant: "destructive" });
    }
  };

  const openEditModal = (product) => {
    resetImageState();
    setCurrentProduct({ ...product });
    setIsEditModalOpen(true);
  };
  const openStockModal = (product) => {
    setCurrentProduct(product);
    setStockUpdate({ amount: 0, type: 'add' });
    setIsStockModalOpen(true);
  };

  const renderProductForm = (productData, setProductData, handleSubmit, isEdit = false) => (
    <form onSubmit={handleSubmit} className="space-y-4 text-right max-h-[70vh] overflow-y-auto p-1">
        <div><Label htmlFor="name">اسم المنتج</Label><Input id="name" name="name" value={productData.name} onChange={(e) => handleInputChange(e, setProductData)} required /></div>
        <div><Label htmlFor="category">الفئة</Label><Input id="category" name="category" value={productData.category} onChange={(e) => handleInputChange(e, setProductData)} /></div>
        <div className="grid grid-cols-2 gap-4">
            <div><Label htmlFor="price">السعر (ج.م)</Label><Input id="price" name="price" type="number" value={productData.price} onChange={(e) => handleInputChange(e, setProductData)} required min="0" step="0.01" /></div>
            <div><Label htmlFor="originalPrice">السعر الأصلي (اختياري)</Label><Input id="originalPrice" name="originalPrice" type="number" value={productData.originalPrice || ''} onChange={(e) => handleInputChange(e, setProductData)} min="0" step="0.01" /></div>
        </div>
        <div><Label htmlFor="stock">المخزون</Label><Input id="stock" name="stock" type="number" value={productData.stock} onChange={(e) => handleInputChange(e, setProductData)} required min="0" /></div>
        <div><Label htmlFor="description">الوصف</Label><Textarea id="description" name="description" value={productData.description} onChange={(e) => handleInputChange(e, setProductData)} /></div>

        <div>
            <Label>صورة المنتج</Label>
            <div className="mt-2 flex justify-center rounded-lg border border-dashed border-input px-6 py-10">
                <div className="text-center">
                    {imagePreview ? (
                        <div className="relative mx-auto"><img src={imagePreview} alt="معاينة" className="mx-auto h-32 w-auto object-contain rounded-md" /><Button variant="ghost" size="icon" className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-500/80 text-white hover:bg-red-600" onClick={resetImageState}><X className="h-4 w-4" /></Button></div>
                    ) : isEdit && productData.image ? (
                         <img src={productData.image} alt="الصورة الحالية" className="mx-auto h-32 w-auto object-contain rounded-md" />
                    ) : (
                        <ImagePlus className="mx-auto h-12 w-12 text-gray-300" strokeWidth={1} />
                    )}
                    <div className="mt-4 flex text-sm leading-6 text-gray-600 justify-center"><label htmlFor="file-upload" className="relative cursor-pointer rounded-md bg-white font-semibold text-primary focus-within:outline-none focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 hover:text-primary/80"><span>{imagePreview || (isEdit && productData.image) ? 'تغيير الصورة' : 'اختر صورة'}</span><Input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/*" onChange={handleImageChange} /></label></div>
                    <p className="text-xs leading-5 text-gray-600">PNG, JPG, GIF</p>
                </div>
            </div>
            {isUploading && <div className="mt-2"><Progress value={uploadProgress} className="w-full" /><p className="text-xs text-center mt-1">جاري الرفع... {Math.round(uploadProgress)}%</p></div>}
        </div>
        
        <DialogFooter className="pt-4">
            <Button type="submit" disabled={isUploading}>{isUploading ? <Loader2 className="animate-spin mr-2" /> : (isEdit ? "حفظ التعديلات" : "إضافة المنتج")}</Button>
            <Button type="button" variant="outline" onClick={() => { isEdit ? setIsEditModalOpen(false) : setIsAddModalOpen(false); resetImageState(); }}>إلغاء</Button>
        </DialogFooter>
    </form>
  );

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.category && product.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) return <div className="flex items-center justify-center p-10"><Loader2 className="h-12 w-12 animate-spin text-primary" /><p className="ml-4 text-lg text-muted-foreground">جاري تحميل المنتجات...</p></div>;
  if (error) return <div className="p-10 text-center"><AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" /><p className="text-lg text-destructive">{error}</p></div>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h2 className="text-2xl font-semibold text-primary">إدارة المنتجات</h2>
        <div className="w-full sm:w-auto flex items-center space-x-2 space-x-reverse">
            <Search className="h-5 w-5 text-muted-foreground" />
            <Input type="text" placeholder="ابحث بالاسم أو الفئة..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="max-w-sm" />
            {searchTerm && <Button variant="ghost" size="icon" onClick={() => setSearchTerm('')}><FilterX className="h-5 w-5 text-muted-foreground"/></Button>}
        </div>
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild><Button onClick={() => { resetImageState(); setIsAddModalOpen(true); }}><PlusCircle className="mr-2 h-5 w-5" /> إضافة منتج جديد</Button></DialogTrigger>
          <DialogContent className="sm:max-w-lg text-right"><DialogHeader><DialogTitle className="text-primary">إضافة منتج جديد</DialogTitle></DialogHeader>{renderProductForm(newProduct, setNewProduct, handleAddProduct)}</DialogContent>
        </Dialog>
      </div>

      {filteredProducts.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">لا توجد منتجات تطابق بحثك أو لم يتم إضافة منتجات بعد.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border shadow-sm bg-card">
          <Table>
            <TableHeader><TableRow className="bg-muted/50">
              <TableHead className="text-right w-[100px]">الصورة</TableHead>
              <TableHead className="text-right">المنتج</TableHead>
              <TableHead className="text-right">الفئة</TableHead>
              <TableHead className="text-right">السعر (ج.م)</TableHead>
              <TableHead className="text-right">المخزون</TableHead>
              <TableHead className="text-center w-[180px]">الإجراءات</TableHead>
            </TableRow></TableHeader>
            <TableBody><AnimatePresence>
              {filteredProducts.map((product) => (
                <motion.tr key={product.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="hover:bg-muted/30 transition-colors">
                  <TableCell>
                    <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-md overflow-hidden flex-shrink-0">
                      <img src={product.image || 'https://via.placeholder.com/64'} alt={product.name} className="w-full h-full object-cover" />
                    </div>
                  </TableCell>
                  <TableCell className="font-medium text-primary">{product.name}</TableCell>
                  <TableCell>{product.category || '-'}</TableCell>
                  <TableCell>{(product.price || 0).toLocaleString('ar-EG')}</TableCell>
                  <TableCell className={product.stock <= 5 ? (product.stock === 0 ? 'text-red-500 font-bold' : 'text-yellow-500 font-semibold') : ''}>
                    {product.stock || 0}
                  </TableCell>
                  <TableCell className="text-center"><div className="flex justify-center items-center space-x-1 space-x-reverse">
                    <Button variant="ghost" size="icon" className="text-green-500 hover:text-green-700" onClick={() => openStockModal(product)}><PackagePlus className="h-5 w-5" /></Button>
                    <Button variant="ghost" size="icon" className="text-blue-500 hover:text-blue-700" onClick={() => openEditModal(product)}><Edit className="h-5 w-5" /></Button>
                    <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700" onClick={() => handleDeleteProduct(product.id, product.name)}><Trash2 className="h-5 w-5" /></Button>
                  </div></TableCell>
                </motion.tr>
              ))}
            </AnimatePresence></TableBody>
          </Table>
        </div>
      )}

      {/* Edit Product Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={(isOpen) => { if (!isOpen) resetImageState(); setIsEditModalOpen(isOpen); }}>
        <DialogContent className="sm:max-w-lg text-right"><DialogHeader><DialogTitle className="text-primary">تعديل المنتج: {currentProduct?.name}</DialogTitle></DialogHeader>{currentProduct && renderProductForm(currentProduct, setCurrentProduct, handleEditProduct, true)}</DialogContent>
      </Dialog>
      
      {/* Update Stock Modal */}
      <Dialog open={isStockModalOpen} onOpenChange={setIsStockModalOpen}>
        <DialogContent className="sm:max-w-md text-right"><DialogHeader><DialogTitle className="text-primary">تحديث مخزون: {currentProduct?.name}</DialogTitle><DialogDescription>المخزون الحالي: {currentProduct?.stock || 0}</DialogDescription></DialogHeader>
          <form onSubmit={handleUpdateStock} className="space-y-4 pt-2">
            <div><Label htmlFor="stockAmount">الكمية</Label><Input id="stockAmount" name="amount" type="number" value={stockUpdate.amount} onChange={(e) => handleInputChange(e, setStockUpdate)} required /></div>
            <div>
              <Label htmlFor="updateType">نوع التحديث</Label>
              <select id="updateType" name="type" value={stockUpdate.type} onChange={(e) => handleInputChange(e, setStockUpdate)} className="w-full mt-1 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                <option value="add">إضافة إلى المخزون (يمكن استخدام - للخصم)</option>
                <option value="set">تعيين قيمة جديدة للمخزون</option>
              </select>
            </div>
            <DialogFooter className="pt-4"><Button type="submit">تحديث المخزون</Button><Button type="button" variant="outline" onClick={() => setIsStockModalOpen(false)}>إلغاء</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default ProductManagement;
