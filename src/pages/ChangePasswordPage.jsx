// src/pages/ChangePasswordPage.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, KeyRound, Lock, ShieldCheck } from 'lucide-react';

const ChangePasswordPage = () => {
  const { reauthenticateAndChangePassword } = useAuth(); // سننشئ هذه الدالة
  const { toast } = useToast();
  const navigate = useNavigate();

  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (passwords.newPassword !== passwords.confirmPassword) {
      setError("كلمة المرور الجديدة وتأكيدها غير متطابقين.");
      return;
    }
    if (passwords.newPassword.length < 6) {
      setError("كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل.");
      return;
    }

    setLoading(true);
    try {
      await reauthenticateAndChangePassword(passwords.currentPassword, passwords.newPassword);
      toast({
        title: "✅ تم تغيير كلمة المرور بنجاح!",
        description: "تم تحديث كلمة مرورك. سيتم تسجيل خروجك الآن للأمان.",
        className: "bg-green-500 text-white",
      });
      // يفضل تسجيل الخروج بعد تغيير كلمة المرور للأمان
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/wrong-password') {
        setError("كلمة المرور الحالية التي أدخلتها غير صحيحة.");
      } else {
        setError("حدث خطأ ما. يرجى المحاولة مرة أخرى.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-12 px-4 flex justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg"
      >
        <Card>
          <CardHeader className="text-center">
            <KeyRound className="mx-auto h-12 w-12 text-primary" />
            <CardTitle className="text-2xl font-bold mt-2">تغيير كلمة المرور</CardTitle>
            <CardDescription>لأمان حسابك، أدخل كلمة مرورك الحالية أولاً.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="currentPassword">كلمة المرور الحالية</Label>
                <Input id="currentPassword" name="currentPassword" type="password" value={passwords.currentPassword} onChange={handleChange} required />
              </div>
              <div>
                <Label htmlFor="newPassword">كلمة المرور الجديدة</Label>
                <Input id="newPassword" name="newPassword" type="password" value={passwords.newPassword} onChange={handleChange} required />
              </div>
              <div>
                <Label htmlFor="confirmPassword">تأكيد كلمة المرور الجديدة</Label>
                <Input id="confirmPassword" name="confirmPassword" type="password" value={passwords.confirmPassword} onChange={handleChange} required />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <ShieldCheck className="mr-2 h-4 w-4" />}
                {loading ? 'جاري التحديث...' : 'تحديث كلمة المرور'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default ChangePasswordPage;
