import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, KeyRound, ShoppingCart, LogOut } from 'lucide-react';

const ProfileLayout = () => {
    const { currentUser, signOut } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();

    const handleSignOut = async () => {
        try {
          await signOut();
          toast({ title: "تم تسجيل الخروج بنجاح!" });
          navigate('/');
        } catch (error) {
          toast({ title: "خطأ في تسجيل الخروج", description: error.message, variant: "destructive" });
        }
    };
    
    const navLinkClass = ({ isActive }) =>
    `flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors ${
      isActive
        ? 'bg-primary/10 text-primary'
        : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
    }`;

    return (
        <div className="grid md:grid-cols-4 gap-8">
            <aside className="md:col-span-1">
                <Card>
                    <CardContent className="p-4">
                        <div className="text-center mb-6 pt-4">
                             <img src={currentUser?.photoURL || `https://ui-avatars.com/api/?name=${currentUser?.displayName || 'User'}&background=random`} alt="User Avatar" className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-primary/50" />
                            <h3 className="font-bold text-lg">{currentUser?.displayName}</h3>
                            <p className="text-sm text-muted-foreground">{currentUser?.email}</p>
                        </div>
                        <nav className="space-y-2">
                            <NavLink to="/profile" end className={navLinkClass}>
                                <User className="mr-3 rtl:ml-3 h-4 w-4" />
                                معلومات الحساب
                            </NavLink>
                            <NavLink to="/profile/orders" className={navLinkClass}>
                                <ShoppingCart className="mr-3 rtl:ml-3 h-4 w-4" />
                                طلباتي
                            </NavLink>
                            <NavLink to="/profile/change-password" className={navLinkClass}>
                                <KeyRound className="mr-3 rtl:ml-3 h-4 w-4" />
                                تغيير كلمة المرور
                            </NavLink>
                            <button onClick={handleSignOut} className={`${navLinkClass({isActive: false})} w-full text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20`}>
                                <LogOut className="mr-3 rtl:ml-3 h-4 w-4" />
                                تسجيل الخروج
                            </button>
                        </nav>
                    </CardContent>
                </Card>
            </aside>
            <main className="md:col-span-3">
                <Card>
                    <CardContent className="p-6">
                        <Outlet />
                    </CardContent>
                </Card>
            </main>
        </div>
    );
};

export default ProfileLayout;
