import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Printer, UploadCloud } from 'lucide-react';

export const OrderDetailsModalContent = ({ order, logoPreview, handleLogoUpload, formatDate, formatPrice, getStatusInfo }) => {
  const printRef = useRef(null);

  const handlePrintInvoice = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write('<html><head><title>فاتورة طلب</title>');
    printWindow.document.write('<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css">');
    printWindow.document.write('<style>body { direction: rtl; font-family: "Cairo", sans-serif; padding: 20px; } @media print { body { -webkit-print-color-adjust: exact; } .no-print { display: none; } }</style>');
    printWindow.document.write('</head><body>');
    if (printRef.current) {
      printWindow.document.write(printRef.current.innerHTML);
    }
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  const safeOrder = order || {};
  // --- بداية التعديلات ---
  const shippingInfo = safeOrder.shipping || {};

  const displayName = shippingInfo.fullName || 'غير متوفر';
  const displayEmail = safeOrder.userEmail || 'غير متوفر';
  const displayPhone = shippingInfo.phone || 'غير متوفر';
  const displayAddress = shippingInfo.address || 'غير متوفر';
  const displayCity = shippingInfo.city || 'غير متوفر';
  const displayCountry = shippingInfo.country || 'غير متوفر';
  const displayPostalCode = shippingInfo.postalCode || '';
  const displayNotes = shippingInfo.notes || '';

  const safeItems = safeOrder.items || [];
  
  // نقرأ من الحقول الصحيحة القادمة من Firestore
  const subtotalAmount = safeOrder.subtotal || 0;
  const shippingCost = safeOrder.shippingCost || 0;
  const totalAmount = safeOrder.total || 0;
  
  const statusInfo = getStatusInfo(safeOrder.status);
  // --- نهاية التعديلات ---

  return (
    <>
      <div ref={printRef}>
        <DialogHeader className="p-6 border-b dark:border-slate-700">
          <div className="flex justify-between items-center">
            <DialogTitle className="text-2xl font-bold text-sky-600 dark:text-sky-400">
              تفاصيل الطلب #{safeOrder.id ? safeOrder.id.slice(0, 8) : 'غير محدد'}
            </DialogTitle>
            {logoPreview && <img src={logoPreview} alt="شعار المتجر" className="h-12 max-w-[150px] object-contain" />}
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">تاريخ الطلب: {formatDate(safeOrder.createdAt)}</p>
          <Badge className={`${statusInfo.color} ${statusInfo.textColor} text-xs`}>
            {statusInfo.label}
          </Badge>
        </DialogHeader>
        <div className="p-6 max-h-[60vh] overflow-y-auto space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-lg mb-2 text-slate-700 dark:text-slate-200">معلومات العميل</h3>
              <p><strong>الاسم:</strong> {displayName}</p>
              <p><strong>البريد:</strong> {displayEmail}</p>
              <p><strong>الهاتف:</strong> {displayPhone}</p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2 text-slate-700 dark:text-slate-200">عنوان الشحن</h3>
              <p>{displayAddress}</p>
              <p>{displayCity}{displayPostalCode && `, ${displayPostalCode}`}</p>
              <p>{displayCountry}</p>
              {displayNotes && <p className="text-sm text-slate-500 dark:text-slate-400">ملاحظات: {displayNotes}</p>}
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-2 text-slate-700 dark:text-slate-200">المنتجات المطلوبة</h3>
            {safeItems.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">المنتج</TableHead>
                    <TableHead className="text-right">الكمية</TableHead>
                    <TableHead className="text-right">السعر</TableHead>
                    <TableHead className="text-right">الإجمالي</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {safeItems.map(item => (
                    <TableRow key={item.id || item.name}>
                      <TableCell>
                        <div className="flex items-center">
                          <img src={item.imageUrl || 'https://via.placeholder.com/50'} alt={item.name || 'منتج'} className="w-10 h-10 object-cover rounded-md ml-3 rtl:mr-3" />
                          {item.name || 'اسم المنتج غير متوفر'}
                        </div>
                      </TableCell>
                      <TableCell>{item.quantity || 0}</TableCell>
                      <TableCell>{formatPrice(item.price)}</TableCell>
                      <TableCell>{formatPrice((item.price || 0) * (item.quantity || 0))}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-slate-500 dark:text-slate-400">لا توجد منتجات في هذا الطلب.</p>
            )}
          </div>
          <div className="text-right border-t dark:border-slate-700 pt-4 mt-4">
            <p><strong>المجموع الفرعي:</strong> {formatPrice(subtotalAmount)}</p>
            <p><strong>تكلفة الشحن:</strong> {formatPrice(shippingCost)}</p>
            <p className="text-xl font-bold"><strong>الإجمالي الكلي:</strong> {formatPrice(totalAmount)}</p>
          </div>
        </div>
      </div>
      <DialogFooter className="p-6 border-t dark:border-slate-700 flex-col sm:flex-row gap-2">
        <div className="flex items-center gap-2 no-print">
          <label htmlFor="logoUploadModal" className="cursor-pointer">
            <Button variant="outline" asChild>
              <span><UploadCloud className="mr-2 rtl:ml-2 rtl:mr-0 h-4 w-4" /> تحميل شعار</span>
            </Button>
            <Input id="logoUploadModal" type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
          </label>
          <Button onClick={handlePrintInvoice} className="bg-green-500 hover:bg-green-600 text-white">
            <Printer className="mr-2 rtl:ml-2 rtl:mr-0 h-4 w-4" /> طباعة الفاتورة
          </Button>
        </div>
        <DialogClose asChild className="no-print">
          <Button variant="outline">إغلاق</Button>
        </DialogClose>
      </DialogFooter>
    </>
  );
};
