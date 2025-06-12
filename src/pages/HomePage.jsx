
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Droplets, ShieldCheck, Zap, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const FeatureCard = ({ icon, title, description, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 50 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
  >
    <Card className="text-center h-full glassmorphism-card hover:shadow-2xl transition-shadow duration-300">
      <CardHeader>
        <div className="mx-auto bg-gradient-to-br from-primary to-secondary text-white rounded-full p-4 w-fit mb-4">
          {icon}
        </div>
        <CardTitle className="text-2xl text-primary">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-foreground/80 text-base">{description}</CardDescription>
      </CardContent>
    </Card>
  </motion.div>
);

const HomePage = () => {
  return (
    <div className="space-y-16">
      <motion.section 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="text-center py-16 md:py-24 bg-gradient-to-br from-water-blue/20 via-water-green/10 to-transparent rounded-xl shadow-lg"
      >
        <div className="container mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-block p-4 bg-gradient-to-r from-primary to-secondary rounded-full mb-6 shadow-md"
          >
            <Droplets size={64} className="text-white" />
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-5xl md:text-6xl font-extrabold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary"
          >
            مياه نقية لحياة صحية مع رايت ووتر
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="text-xl md:text-2xl text-foreground/80 mb-10 max-w-3xl mx-auto"
          >
            نقدم حلولاً مبتكرة لمعالجة المياه وأنظمة شرب صحية تضمن لك ولعائلتك مياهاً آمنة ونقية كل يوم.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <Link to="/products">
              <Button size="lg" className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-lg px-10 py-6 rounded-full shadow-lg transform hover:scale-105 transition-transform duration-300">
                اكتشف منتجاتنا
              </Button>
            </Link>
          </motion.div>
        </div>
      </motion.section>

      <section className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-12 text-primary">لماذا تختار رايت ووتر؟</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <FeatureCard 
            icon={<Droplets size={40} />} 
            title="جودة لا تضاهى" 
            description="نستخدم أحدث التقنيات لضمان أعلى معايير نقاء المياه."
            delay={0.2}
          />
          <FeatureCard 
            icon={<ShieldCheck size={40} />} 
            title="حلول موثوقة" 
            description="منتجاتنا مصممة لتدوم طويلاً وتوفر أداءً يمكن الاعتماد عليه."
            delay={0.4}
          />
          <FeatureCard 
            icon={<Zap size={40} />} 
            title="تركيب سريع" 
            description="فريقنا المحترف يضمن تركيباً سلساً وفعالاً لأنظمتنا."
            delay={0.6}
          />
          <FeatureCard 
            icon={<Users size={40} />} 
            title="دعم فني متميز" 
            description="نقدم دعماً فنياً شاملاً وخدمة عملاء استثنائية."
            delay={0.8}
          />
        </div>
      </section>

      <section className="container mx-auto px-4 py-12">
        <div className="bg-gradient-to-r from-secondary to-primary text-white p-10 rounded-xl shadow-xl text-center md:text-right">
          <div className="md:flex md:items-center md:justify-between">
            <div className="mb-6 md:mb-0">
              <h2 className="text-3xl font-bold mb-3">هل أنت مستعد لتحسين جودة مياهك؟</h2>
              <p className="text-lg opacity-90">تواصل معنا اليوم للحصول على استشارة مجانية واكتشف الحل الأمثل لاحتياجاتك.</p>
            </div>
            <Link to="/contact">
              <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-primary text-lg px-8 py-4 rounded-full transform hover:scale-105 transition-transform duration-300">
                اتصل بنا الآن
              </Button>
            </Link>
          </div>
        </div>
      </section>
      
      <section className="container mx-auto px-4 text-center">
        <h2 className="text-4xl font-bold text-center mb-8 text-primary">منتجاتنا المميزة</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <motion.div whileHover={{ y: -10 }} className="cursor-pointer">
            <Card className="overflow-hidden glassmorphism-card">
              <img  alt="فلتر مياه منزلي" className="w-full h-56 object-cover" src="https://envs.sh/g9Z.jpg" />
              <CardHeader>
                <CardTitle className="text-primary">فلتر مياه منزلي</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>نظام تنقية متعدد المراحل يوفر مياه شرب نقية وصحية.</CardDescription>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div whileHover={{ y: -10 }} className="cursor-pointer">
            <Card className="overflow-hidden glassmorphism-card">
              <img  alt="محطة تحلية مياه صغيرة" className="w-full h-56 object-cover" src="https://images.unsplash.com/photo-1614195975309-a3baf592274f" />
              <CardHeader>
                <CardTitle className="text-primary">محطة تحلية صغيرة</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>حل مثالي لتحويل المياه المالحة إلى مياه عذبة صالحة للشرب.</CardDescription>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div whileHover={{ y: -10 }} className="cursor-pointer">
            <Card className="overflow-hidden glassmorphism-card">
              <img  alt="نظام معالجة مياه صناعي" className="w-full h-56 object-cover" src="https://images.unsplash.com/photo-1614195975309-a3baf592274f" />
              <CardHeader>
                <CardTitle className="text-primary">أنظمة معالجة صناعية</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>حلول مخصصة لمعالجة المياه للاستخدامات الصناعية المختلفة.</CardDescription>
              </CardContent>
            </Card>
          </motion.div>
        </div>
        <Link to="/products" className="mt-10 inline-block">
          <Button size="lg" variant="link" className="text-primary text-lg hover:text-secondary">
            عرض جميع المنتجات &rarr;
          </Button>
        </Link>
      </section>
    </div>
  );
};

export default HomePage;
