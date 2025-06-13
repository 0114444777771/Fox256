// src/components/admin/OrderManagement.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom'; //
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button.jsx';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
import { Dialog, DialogContent } from '@/components/ui/dialog.jsx';
import { Checkbox } from '@/components/ui/checkbox.jsx';
import { useToast } from '@/components/ui/use-toast';
import { db, collection, onSnapshot, query as firestoreQuery, orderBy, doc, updateDoc, deleteDoc, writeBatch, where } from '@/firebase';
import { Loader2, PackageSearch, Search, ListFilter, ArrowRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { OrderDetailsModalContent } from '@/components/admin/OrderDetailsModalContent.jsx';
import { OrderTable } from '@/components/admin/OrderTable.jsx';
import { OrderFilters } from '@/components/admin/OrderFilters.jsx';
import { OrderPagination } from '@/components/admin/OrderPagination.jsx';
import { formatPrice, formatDate, getStatusInfo, statusOptions } from '@/lib/orderUtils.js';

const ITEMS_PER_PAGE = 10;

const OrderManagement = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [currentOrderDetails, setCurrentOrderDetails] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  
  useEffect(() => {
    setLoading(true);
    let q = firestoreQuery(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    if (statusFilter !== 'all') {
      q = firestoreQuery(collection(db, 'orders'), where('status', '==', statusFilter), orderBy('createdAt', 'desc'));
    }

    const unsubscribe = onSnapshot(q, 
      (querySnapshot) => {
        const ordersData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setOrders(ordersData);
        setLoading(false);
        setError(null);
      }, 
      (err) => {
        console.error("Error fetching orders: ", err);
        setError("فشل في تحميل الطلبات. يرجى المحاولة مرة أخرى.");
        setLoading(false);
        toast({ title: "خطأ", description: "فشل في تحميل الطلبات.", variant: "destructive" });
      }
    );
    return () => unsubscribe();
  }, [statusFilter, toast]);

  const filteredOrders = useMemo(() => orders.filter(order =>
    (order.id.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (order.shipping?.fullName && order.shipping.fullName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (order.userEmail && order.userEmail.toLowerCase().includes(searchTerm.toLowerCase()))
  ), [orders, searchTerm]);

  const paginatedOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredOrders.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredOrders, currentPage]);

  const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, { status: newStatus, updatedAt: new Date() });
      toast({ title: "تم التحديث", description: `تم تحديث حالة الطلب.` });
    } catch (err) {
      toast({ title: "خطأ", description: "فشل تحديث حالة الطلب.", variant: "destructive" });
    }
  };

  const handleBulkStatusUpdate = async (newStatus) => {
    if (selectedOrders.length === 0 || newStatus === 'all') {
      toast({ title: "تنبيه", description: "يرجى تحديد طلب واحد على الأقل وحالة صالحة للتحديث." });
      return;
    }
    const batch = writeBatch(db);
    selectedOrders.forEach(orderId => {
      batch.update(doc(db, 'orders', orderId), { status: newStatus, updatedAt: new Date() });
    });
    try {
      await batch.commit();
      toast({ title: "تم التحديث الجماعي", description: `تم تحديث حالة ${selectedOrders.length} طلبات.` });
      setSelectedOrders([]);
    } catch (err) {
      toast({ title: "خطأ", description: "فشل التحديث الجماعي للحالات.", variant: "destructive" });
    }
  };

  const handleDeleteOrder = async (orderId) => {
    try {
      await deleteDoc(doc(db, 'orders', orderId));
      toast({ title: "تم الحذف", description: "تم حذف الطلب بنجاح." });
    } catch (err) {
      toast({ title: "خطأ", description: "فشل حذف الطلب.", variant: "destructive" });
    }
  };

  const handleSelectOrder = (orderId, checked) => {
    setSelectedOrders(prev => checked ? [...prev, orderId] : prev.filter(id => id !== orderId));
  };

  const handleSelectAll = (checked) => {
    setSelectedOrders(checked ? paginatedOrders.map(o => o.id) : []);
  };

  const openDetailsModal = (order) => {
    setCurrentOrderDetails(order);
    setIsDetailsModalOpen(true);
  };
  
  const handleLogoUpload = (event) => {
    const file = event.target.files[0];
    if (file) setLogoPreview(URL.createObjectURL(file));
  };
  
  const changePage = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
      setSelectedOrders([]); 
    }
  };

  if (loading) return <div className="flex justify-center items-center h-[calc(100vh-200px)]"><Loader2 className="h-16 w-16 text-sky-500 animate-spin" /></div>;
  if (error) return <div className="text-center py-10 text-red-500">{error}</div>;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100 flex items-center">
          <ListFilter className="mr-3 rtl:ml-3 rtl:mr-0" size={32} />
          إدارة الطلبات
        </h1>
        <Button variant="outline" onClick={() => navigate('/admin')}>
          <ArrowRight className="ml-2 h-4 w-4" />
          الرجوع للوحة التحكم
        </Button>
      </div>

      <OrderFilters searchTerm={searchTerm} setSearchTerm={setSearchTerm} statusFilter={statusFilter} setStatusFilter={setStatusFilter} statusOptions={statusOptions} selectedOrders={selectedOrders} handleBulkStatusUpdate={handleBulkStatusUpdate} setSelectedOrders={setSelectedOrders} setCurrentPage={setCurrentPage} />

      {paginatedOrders.length === 0 ? (
        <div className="text-center py-12"><PackageSearch className="mx-auto h-16 w-16 text-slate-400 dark:text-slate-500 mb-4" /><p className="text-xl text-slate-600 dark:text-slate-400">لا توجد طلبات تطابق بحثك.</p></div>
      ) : (
        <>
          <OrderTable orders={paginatedOrders} selectedOrders={selectedOrders} handleSelectOrder={handleSelectOrder} handleSelectAll={handleSelectAll} openDetailsModal={openDetailsModal} handleStatusChange={handleStatusChange} handleDeleteOrder={handleDeleteOrder} formatDate={formatDate} formatPrice={formatPrice} getStatusInfo={getStatusInfo} statusOptions={statusOptions} />
          {totalPages > 1 && <OrderPagination currentPage={currentPage} totalPages={totalPages} changePage={changePage} totalItems={filteredOrders.length} />}
        </>
      )}

      <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
        <OrderDetailsModalContent order={currentOrderDetails} logoPreview={logoPreview} handleLogoUpload={handleLogoUpload} formatDate={formatDate} formatPrice={formatPrice} getStatusInfo={getStatusInfo} />
      </Dialog>
    </motion.div>
  );
};

export default OrderManagement;
