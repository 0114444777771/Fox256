// src/components/admin/UserManagement.jsx

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { db, auth, sendPasswordResetEmail } from '@/firebase';
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';

// --- استيراد المكونات والأيقونات ---
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { MoreHorizontal, Edit, Trash2, KeyRound, Loader2, Users, Search, UserX } from 'lucide-react';

// 🔥 --- 1. تحديد هوية المدير الخارق --- 🔥
const SUPER_ADMIN_UID = 'hoIGjbMl4AbEEX4LCQeTx8YNfXB2';

const UserManagement = () => {
    const { currentUser } = useAuth(); // للتحقق من هوية المستخدم الحالي
    const { toast } = useToast();
    
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [currentUserToEdit, setCurrentUserToEdit] = useState(null);
    const [isUpdating, setIsUpdating] = useState(false);

    // التحقق إذا كان المستخدم الحالي هو المدير الخارق
    const isSuperAdmin = currentUser?.uid === SUPER_ADMIN_UID;

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const usersSnapshot = await getDocs(collection(db, 'users'));
            const usersList = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setUsers(usersList);
        } catch (error) {
            console.error("Error fetching users:", error);
            toast({ title: "خطأ", description: "فشل في تحميل قائمة المستخدمين.", variant: "destructive" });
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const filteredUsers = useMemo(() => {
        return users.filter(user =>
            user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.phone?.includes(searchTerm)
        );
    }, [users, searchTerm]);

    const openEditModal = (user) => {
        setCurrentUserToEdit({ ...user });
        setIsEditModalOpen(true);
    };

    const handleUpdateUser = async (e) => {
        e.preventDefault();
        if (!currentUserToEdit) return;
        
        setIsUpdating(true);
        try {
            const userRef = doc(db, 'users', currentUserToEdit.id);
            await updateDoc(userRef, {
                displayName: currentUserToEdit.displayName,
                phone: currentUserToEdit.phone,
                role: currentUserToEdit.role,
            });
            toast({ title: "تم التحديث", description: `تم تحديث بيانات ${currentUserToEdit.displayName}.` });
            setIsEditModalOpen(false);
            fetchUsers(); // إعادة تحميل القائمة
        } catch (error) {
            console.error("Error updating user:", error);
            toast({ title: "خطأ", description: "فشل تحديث بيانات المستخدم.", variant: "destructive" });
        } finally {
            setIsUpdating(false);
        }
    };
    
    const handleDeleteUser = async (userId, displayName) => {
      if(userId === SUPER_ADMIN_UID) {
        toast({ title: "غير مسموح", description: "لا يمكن حذف حساب المدير الخارق.", variant: "destructive" });
        return;
      }
      try {
        await deleteDoc(doc(db, 'users', userId));
        toast({ title: "تم الحذف", description: `تم حذف حساب المستخدم ${displayName}.`, className: "bg-red-500 text-white" });
        fetchUsers();
      } catch (error) {
        console.error("Error deleting user:", error);
        toast({ title: "خطأ", description: "فشل حذف المستخدم.", variant: "destructive" });
      }
    };

    const handleSendPasswordReset = async (email, displayName) => {
        if (!email) {
          toast({ title: "خطأ", description: "لا يوجد بريد إلكتروني مسجل لهذا المستخدم.", variant: "destructive" });
          return;
        }
    
        if (!window.confirm(`هل أنت متأكد أنك تريد إرسال رابط إعادة تعيين كلمة المرور إلى ${displayName} (${email})؟`)) {
          return;
        }
    
        try {
          await sendPasswordResetEmail(auth, email, { url: `${window.location.origin}/login` });
          toast({ title: "تم الإرسال بنجاح", description: `تم إرسال رابط إعادة تعيين كلمة المرور إلى ${email}.`, className: "bg-green-500 text-white" });
        } catch (error) {
          console.error("Error sending password reset email: ", error);
          toast({ title: "فشل الإرسال", description: "حدث خطأ أثناء محاولة إرسال البريد الإلكتروني.", variant: "destructive" });
        }
    };
    
    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 flex items-center">
                    <Users className="mr-3 rtl:ml-3" /> إدارة المستخدمين
                </h1>
                <div className="relative w-full max-w-sm">
                    <Input placeholder="ابحث بالاسم، البريد الإلكتروني..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10 rtl:pr-10" />
                    <Search className="absolute left-3 rtl:right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-64"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>
            ) : filteredUsers.length === 0 ? (
                <div className="text-center py-10"><UserX className="mx-auto h-16 w-16 text-slate-400 mb-4" /><p className="text-xl text-slate-600">لا يوجد مستخدمون يطابقون بحثك.</p></div>
            ) : (
                <div className="bg-white dark:bg-slate-800 shadow-md rounded-lg overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>الاسم</TableHead>
                                <TableHead>البريد الإلكتروني</TableHead>
                                <TableHead>الهاتف</TableHead>
                                <TableHead>الدور</TableHead>
                                <TableHead>تاريخ التسجيل</TableHead>
                                <TableHead className="text-center">الإجراءات</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredUsers.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell className="font-medium">{user.displayName || 'غير محدد'}</TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>{user.phone || '-'}</TableCell>
                                    <TableCell><span className={`px-2 py-1 text-xs rounded-full ${user.role === 'admin' ? 'bg-sky-100 text-sky-800' : 'bg-slate-100 text-slate-800'}`}>{user.role === 'admin' ? 'مدير' : 'عميل'}</span></TableCell>
                                    <TableCell>{user.createdAt ? new Date(user.createdAt.seconds * 1000).toLocaleDateString('ar-EG') : '-'}</TableCell>
                                    <TableCell className="text-center">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal /></Button></DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => openEditModal(user)}><Edit className="mr-2 h-4 w-4" /> تعديل</DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleSendPasswordReset(user.email, user.displayName)}><KeyRound className="mr-2 h-4 w-4" /> إعادة تعيين كلمة المرور</DropdownMenuItem>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <DropdownMenuItem onSelect={(e) => e.preventDefault()} disabled={user.id === SUPER_ADMIN_UID} className="text-red-600 focus:text-red-600">
                                                            <Trash2 className="mr-2 h-4 w-4" /> حذف
                                                        </DropdownMenuItem>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent dir="rtl">
                                                        <AlertDialogHeader><AlertDialogTitle>تأكيد الحذف</AlertDialogTitle><AlertDialogDescription>هل أنت متأكد أنك تريد حذف حساب {user.displayName}؟ لا يمكن التراجع عن هذا الإجراء.</AlertDialogDescription></AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>إلغاء</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => handleDeleteUser(user.id, user.displayName)} className="bg-destructive hover:bg-destructive/90">حذف</AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}

            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent dir="rtl">
                    <DialogHeader><DialogTitle>تعديل بيانات المستخدم</DialogTitle></DialogHeader>
                    {currentUserToEdit && (
                        <form onSubmit={handleUpdateUser} className="space-y-4 pt-4">
                            <div><Label htmlFor="displayName">الاسم الكامل</Label><Input id="displayName" value={currentUserToEdit.displayName} onChange={(e) => setCurrentUserToEdit({...currentUserToEdit, displayName: e.target.value})} /></div>
                            <div><Label htmlFor="phone">رقم الهاتف</Label><Input id="phone" value={currentUserToEdit.phone || ''} onChange={(e) => setCurrentUserToEdit({...currentUserToEdit, phone: e.target.value})} /></div>
                            <div>
                                <Label htmlFor="role">الدور</Label>
                                {/* 🔥🔥 2. التحقق من صلاحية المدير الخارق هنا 🔥🔥 */}
                                <Select
                                    disabled={!isSuperAdmin || currentUserToEdit.id === SUPER_ADMIN_UID}
                                    value={currentUserToEdit.role}
                                    onValueChange={(value) => setCurrentUserToEdit({...currentUserToEdit, role: value})}
                                >
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="user">عميل</SelectItem>
                                        <SelectItem value="admin">مدير</SelectItem>
                                    </SelectContent>
                                </Select>
                                {!isSuperAdmin && <p className="text-xs text-muted-foreground mt-1">فقط المدير الخارق يمكنه تغيير الأدوار.</p>}
                            </div>
                            <DialogFooter>
                                <Button type="submit" disabled={isUpdating}>{isUpdating ? <Loader2 className="animate-spin" /> : "حفظ التغييرات"}</Button>
                                <DialogClose asChild><Button type="button" variant="outline">إلغاء</Button></DialogClose>
                            </DialogFooter>
                        </form>
                    )}
                </DialogContent>
            </Dialog>
        </motion.div>
    );
};

export default UserManagement;
