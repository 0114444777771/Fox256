
import React from 'react';
import { Facebook, Twitter, Instagram, Linkedin, Droplets } from 'lucide-react';
import { motion } from 'framer-motion';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <motion.footer 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="bg-gradient-to-r from-water-blue-dark to-water-blue text-primary-foreground py-12 px-4"
    >
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-right">
        <div>
          <div className="flex items-center justify-center md:justify-start mb-4">
            <Droplets size={32} className="mr-2" />
            <span className="text-2xl font-bold">رايت ووتر</span>
          </div>
          <p className="text-sm text-blue-100">
            نلتزم بتوفير أنظمة معالجة مياه وحلول شرب صحية عالية الجودة لضمان حياة أفضل.
          </p>
        </div>
        
        <div>
          <p className="text-xl font-semibold mb-4">روابط سريعة</p>
          <ul className="space-y-2">
            <li><a href="/" className="hover:text-water-blue-light transition-colors">الرئيسية</a></li>
            <li><a href="/products" className="hover:text-water-blue-light transition-colors">المنتجات</a></li>
            <li><a href="/about" className="hover:text-water-blue-light transition-colors">عن الشركة</a></li>
            <li><a href="/contact" className="hover:text-water-blue-light transition-colors">اتصل بنا</a></li>
          </ul>
        </div>

        <div>
          <p className="text-xl font-semibold mb-4">تابعنا</p>
          <div className="flex justify-center md:justify-start space-x-4 space-x-reverse mb-4">
            <a href="#" className="hover:text-water-blue-light transition-colors"><Facebook size={24} /></a>
            <a href="#" className="hover:text-water-blue-light transition-colors"><Twitter size={24} /></a>
            <a href="#" className="hover:text-water-blue-light transition-colors"><Instagram size={24} /></a>
            <a href="#" className="hover:text-water-blue-light transition-colors"><Linkedin size={24} /></a>
          </div>
          <p className="text-sm text-blue-100">
            العنوان: 123 شارع النيل، القاهرة، مصر
            <br />
            الهاتف: +20 2 12345678
          </p>
        </div>
      </div>
      <div className="mt-8 pt-8 border-t border-water-blue-light/30 text-center text-sm text-blue-100">
        <p>&copy; {currentYear} شركة رايت ووتر. جميع الحقوق محفوظة. العملة: جنيه مصري (EGP)</p>
      </div>
    </motion.footer>
  );
};

export default Footer;
