// src/components/admin/ProductManagement.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, storage } from '@/firebase';
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { collection, doc, updateDoc, addDoc, deleteDoc, runTransaction, onSnapshot, orderBy } from 'firebase/firestore';
import imageCompression from 'browser-image-compression';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table.jsx";
import { Button } from "@/components/ui/button.jsx";
import { Input } from "@/components/ui/input.jsx";
import { Label } from "@/components/ui/label.jsx";
import { Textarea } from "@/components/ui/textarea.jsx";
import { Card } from "@/components/ui/card.jsx";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog.jsx";
import { PlusCircle, Edit, Trash2, Package, Loader2, AlertTriangle, Search, FilterX, ImagePlus, X, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import { Progress } from '@/components/ui/progress.jsx';

const ProductManagement = () => {
  const navigate = useNavigate();
  // ... (باقي الكود كما هو)
  
  // باقي الـ state والـ functions زي ما هي بالظبط
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
    const q = query(collection(db, 'products'), orderBy('name'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }, (err) => {
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

    const options = { maxSizeMB: 1, maxWidthOrHeight: 1024, useWebWorker: true, initialQuality: 0.7 };

    try {
      toast({ title: "جاري ضغط الصورة..." });
      const compressedFile = await imageCompression(file, options);
      setImageFile(compressedFile);
      toast({ title: "✅ الصورة جاهزة للرفع!", className: "bg-green-500 text-white" });
    } catch (error) {
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
      if (!file) { reject(new Error("No file provided.")); return; }
      setIsUploading(true);
      const storageRef = ref(storage, `products/${Date.now()}_${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on('state_changed',
        (snapshot) => setUploadProgress((snapshot.bytesTransferred / snapshot.totalBytes) * 100),
        (error) => { setIsUploading(false); reject(error); },
        () => getDownloadURL(uploadTask.snapshot.ref).then(url => { setIsUploading(false); resolve(url); })
      );
    });
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!newProduct.name || newProduct.price <= 0 || !imageFile) {
      toast({ title: "بيانات ناقصة", description: "الرجاء إدخال اسم وسعر وصورة المنتج.", variant: "destructive" });
      return;
    }
    
    try {
      const imageUrl = await uploadImageAndGetURL(imageFile);
      await addDoc(collection(db, 'products'), { ...newProduct, image: imageUrl });
      toast({ title: "✅ تم إضافة المنتج", className: "bg-green-500 text-white" });
      setIsAddModalOpen(false);
      resetImageState();
      setNewProduct({ name: '', category: '', price: 0, description: '', image: '', stock: 0, originalPrice: null });
    } catch (err) {
      toast({ title: "❌ خطأ في الإضافة", description: err.message, variant: "destructive" });
    }
  };

  const handleEditProduct = async (e) => {
    e.preventDefault();
    if (!currentProduct) return;
    
    try {
      let imageUrl = currentProduct.image;
      if (imageFile) imageUrl = await uploadImageAndGetURL(imageFile);
      
      const productRef = doc(db, 'products', currentProduct.id);
      await updateDoc(productRef, { ...currentProduct, image: imageUrl });
      
      toast({ title: "✅ تم تعديل المنتج", className: "bg-green-500 text-white" });
      setIsEditModalOpen(false);
      resetImageState();
      setCurrentProduct(null);
    } catch (err) {
      toast({ title: "❌ خطأ في التعديل", description: err.message, variant: "destructive" });
    }
  };

  const handleDeleteProduct = async (productId, productName) => {
     if (!window.confirm(`هل أنت متأكد أنك تريد حذف المنتج "${productName}"؟`)) return;
    try {
      await deleteDoc(doc(db, 'products', productId));
      toast({ title: "🗑️ تم حذف المنتج", className: "bg-red-500 text-white" });
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
        transaction.update(productRef, { stock: Math.max(0, newStock) });
      });
      toast({ title: "📦 تم تحديث المخزون", className: "bg-green-500 text-white" });
      setIsStockModalOpen(false);
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
        {/* ... (Form fields remain the same) ... */}
    </form>
  );

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.category && product.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) return <div className="flex items-center justify-center p-10"><Loader2 className="h-12 w-12 animate-spin text-primary" /><p className="ml-4 text-lg text-muted-foreground">جاري تحميل المنتجات...</p></div>;
  if (error) return <div className="p-10 text-center"><AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" /><p className="text-lg text-destructive">{error}</p></div>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-100 flex items-center">
          <Package className="mr-3" />إدارة المنتجات
        </h2>
        <Button variant="outline" onClick={() => navigate('/admin')}>
          <ArrowRight className="ml-2 h-4 w-4" />
          الرجوع للوحة التحكم
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="relative w-full sm:w-auto"><Search className="absolute left-3 rtl:right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" /><Input type="text" placeholder="ابحث..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="max-w-sm pl-10 rtl:pr-10" /></div>
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}><DialogTrigger asChild><Button onClick={() => { resetImageState(); setIsAddModalOpen(true); }}><PlusCircle className="mr-2 h-5 w-5" /> إضافة منتج</Button></DialogTrigger><DialogContent className="sm:max-w-lg text-right"><DialogHeader><DialogTitle>إضافة منتج جديد</DialogTitle></DialogHeader>{renderProductForm(newProduct, setNewProduct, handleAddProduct)}</DialogContent></Dialog>
      </div>
      {/* ... (Rest of the component JSX) ... */}
    </motion.div>
  );
};

export default ProductManagement;
