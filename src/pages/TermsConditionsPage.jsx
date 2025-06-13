import React from 'react';
import { motion } from 'framer-motion';
import { FileText, UserCheck, ShoppingBag, ShieldCheck, AlertTriangle, Mail } from 'lucide-react';

const TermsConditionsPage = () => {
  const sections = [
    {
      icon: <FileText size={28} className="text-sky-500" />,
      title: "1. مقدمة وقبول الشروط",
      content: "مرحبًا بك في موقع رايت واتر. باستخدامك لموقعنا وخدماتنا، فإنك توافق على الالتزام بهذه الشروط والأحكام. إذا كنت لا توافق على أي جزء من هذه الشروط، فيجب عليك عدم استخدام خدماتنا. نحتفظ بالحق في تعديل هذه الشروط في أي وقت، وستصبح التعديلات سارية فور نشرها.",
    },
    {
      icon: <UserCheck size={28} className="text-sky-500" />,
      title: "2. استخدام الموقع وحساب المستخدم",
      content: "يجب أن يكون عمرك 18 عامًا على الأقل لاستخدام خدماتنا وإنشاء حساب. أنت مسؤول عن الحفاظ على سرية معلومات حسابك وكلمة المرور، وعن جميع الأنشطة التي تحدث تحت حسابك. يجب عليك إخطارنا فورًا بأي استخدام غير مصرح به لحسابك.",
    },
    {
      icon: <ShoppingBag size={28} className="text-sky-500" />,
      title: "3. المنتجات والطلبات",
      content: "نسعى جاهدين لعرض معلومات دقيقة عن المنتجات، بما في ذلك الأسعار والمواصفات. ومع ذلك، قد تحدث أخطاء. نحتفظ بالحق في تصحيح أي أخطاء ورفض أو إلغاء أي طلبات تم تقديمها بناءً على معلومات غير صحيحة. جميع الطلبات تخضع للتوفر.",
    },
    {
      icon: <ShieldCheck size={28} className="text-sky-500" />,
      title: "4. الملكية الفكرية",
      content: "جميع المحتويات الموجودة على هذا الموقع، بما في ذلك النصوص والرسومات والشعارات والصور والبرامج، هي ملك لشركة رايت واتر أو مورديها ومحمية بموجب قوانين حقوق النشر.",
    },
    {
      icon: <AlertTriangle size={28} className="text-sky-500" />,
      title: "5. تحديد المسؤولية",
      content: "إلى أقصى حد يسمح به القانون، لن تكون شركة رايت واتر مسؤولة عن أي أضرار مباشرة أو غير مباشرة تنشأ عن استخدامك لخدماتنا.",
    },
    {
      icon: <FileText size={28} className="text-sky-500" />,
      title: "6. القانون الحاكم",
      content: "تخضع هذه الشروط والأحكام وتُفسر وفقًا لقوانين جمهورية مصر العربية.",
    },
    {
      icon: <Mail size={28} className="text-sky-500" />,
      title: "7. معلومات الاتصال",
      content: "إذا كان لديك أي أسئلة حول هذه الشروط والأحكام، يرجى التواصل معنا عبر صفحة 'اتصل بنا'.",
    },
  ];

  return (
    <div className="bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 py-12 md:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="text-center mb-12 md:mb-16"
        >
          <FileText className="mx-auto text-sky-500 mb-4 h-16 w-16" />
          <h1 className="text-4xl md:text-5xl font-extrabold text-sky-600 dark:text-sky-400 mb-3">
            الشروط والأحكام
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            آخر تحديث: 8 يونيو 2024
          </p>
        </motion.div>

        <div className="max-w-3xl mx-auto bg-white dark:bg-slate-800 p-6 sm:p-10 rounded-xl shadow-2xl space-y-10">
          {sections.map((section, index) => (
            <motion.section
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="flex items-start space-x-4 rtl:space-x-reverse mb-4">
                <div className="flex-shrink-0 p-2 bg-sky-100 dark:bg-sky-700/30 rounded-full mt-1">
                  {section.icon}
                </div>
                <h2 className="text-2xl sm:text-3xl font-semibold text-slate-700 dark:text-slate-200">
                  {section.title}
                </h2>
              </div>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                {section.content}
              </p>
            </motion.section>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TermsConditionsPage;
