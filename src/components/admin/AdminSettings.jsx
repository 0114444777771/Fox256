// src/components/admin/AdminSettings.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button.jsx';
import { ArrowRight, Settings } from 'lucide-react';

const AdminSettings = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100 flex items-center">
            <Settings className="mr-3 rtl:ml-3 rtl:mr-0" size={32} />
            الإعدادات
        </h1>
        <Button variant="outline" onClick={() => navigate('/admin')}>
          <ArrowRight className="ml-2 h-4 w-4" />
          الرجوع إلى لوحة التحكم
        </Button>
      </div>
      <div className="p-6 bg-white dark:bg-slate-800 rounded-lg shadow-md">
        <p>هذه الصفحة مخصصة لإعدادات المسؤول.</p>
        <p>يمكنك إضافة الحقول والنماذج اللازمة هنا لتغيير إعدادات الموقع.</p>
      </div>
    </div>
  );
};

export default AdminSettings;
