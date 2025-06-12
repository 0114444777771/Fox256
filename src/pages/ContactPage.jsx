import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Phone, Mail, MapPin, Send, Building, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea'; // Assuming you have a Textarea component
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Create Textarea if it doesn't exist
// You might need to create this file: src/components/ui/textarea.jsx
// Example content for textarea.jsx:
// import React from "react"
// import { cn } from "@/lib/utils"
// const Textarea = React.forwardRef(({ className, ...props }, ref) => {
//   return (
//     <textarea
//       className={cn(
//         "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
//         className
//       )}
//       ref={ref}
//       {...props}
//     />
//   )
// })
// Textarea.displayName = "Textarea"
// export { Textarea }


const ContactPage = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    console.log("Form submitted:", formData);
    toast({
      title: "📬 تم إرسال رسالتك بنجاح!",
      description: "شكراً لتواصلك معنا. سنقوم بالرد عليك في أقرب وقت ممكن.",
      className: "bg-green-500 text-white",
    });
    setFormData({ name: '', email: '', subject: '', message: '' });
    setIsSubmitting(false);
  };

  const contactInfo = [
    { icon: <Building className="h-8 w-8 text-primary" />, title: "المقر الرئيسي", details: ["123 شارع النيل، الجيزة، مصر"] },
    { icon: <Phone className="h-8 w-8 text-primary" />, title: "الهاتف", details: ["0123-456-7890", "02-2345-6789"] },
    { icon: <Mail className="h-8 w-8 text-primary" />, title: "البريد الإلكتروني", details: ["info@rightwater.com.eg", "sales@rightwater.com.eg"] },
    { icon: <Clock className="h-8 w-8 text-primary" />, title: "ساعات العمل", details: ["الأحد - الخميس: 9 صباحًا - 5 مساءً", "الجمعة والسبت: مغلق"] },
  ];

  return (
    <div className="container mx-auto px-4 py-12">
      <motion.section
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="text-center mb-16"
      >
        <h1 className="text-5xl md:text-6xl font-extrabold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
          تواصل معنا
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
          نحن هنا لمساعدتك! سواء كان لديك استفسار عن منتجاتنا، أو تحتاج إلى دعم فني، أو ترغب في مناقشة حلول مخصصة، فريقنا جاهز لخدمتك.
        </p>
      </motion.section>

      <div className="grid md:grid-cols-2 gap-12 items-start">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="space-y-8"
        >
          <h2 className="text-3xl font-bold text-primary mb-6">معلومات الاتصال</h2>
          {contactInfo.map((item, index) => (
            <Card key={index} className="glassmorphism-card overflow-hidden">
              <CardContent className="p-6 flex items-start space-x-4 space-x-reverse">
                <div className="flex-shrink-0 mt-1">{item.icon}</div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-1">{item.title}</h3>
                  {item.details.map((detail, i) => (
                    <p key={i} className="text-muted-foreground">{detail}</p>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
        >
          <Card className="glassmorphism-card p-6 md:p-8 shadow-xl">
            <CardHeader className="p-0 mb-6">
              <CardTitle className="text-3xl font-bold text-primary text-center">أرسل لنا رسالة</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="name" className="text-foreground font-medium">الاسم الكامل</Label>
                  <Input 
                    type="text" 
                    name="name" 
                    id="name" 
                    value={formData.name} 
                    onChange={handleChange} 
                    required 
                    className="mt-1 bg-background/70 border-primary/30 focus:border-primary"
                    placeholder="مثال: محمد أحمد"
                  />
                </div>
                <div>
                  <Label htmlFor="email" className="text-foreground font-medium">البريد الإلكتروني</Label>
                  <Input 
                    type="email" 
                    name="email" 
                    id="email" 
                    value={formData.email} 
                    onChange={handleChange} 
                    required 
                    className="mt-1 bg-background/70 border-primary/30 focus:border-primary"
                    placeholder="example@domain.com"
                  />
                </div>
                <div>
                  <Label htmlFor="subject" className="text-foreground font-medium">الموضوع</Label>
                  <Input 
                    type="text" 
                    name="subject" 
                    id="subject" 
                    value={formData.subject} 
                    onChange={handleChange} 
                    required 
                    className="mt-1 bg-background/70 border-primary/30 focus:border-primary"
                    placeholder="استفسار عن منتج..."
                  />
                </div>
                <div>
                  <Label htmlFor="message" className="text-foreground font-medium">رسالتك</Label>
                  <Textarea 
                    name="message" 
                    id="message" 
                    rows="5" 
                    value={formData.message} 
                    onChange={handleChange} 
                    required 
                    className="mt-1 bg-background/70 border-primary/30 focus:border-primary"
                    placeholder="اكتب رسالتك هنا..."
                  />
                </div>
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity text-lg py-3"
                >
                  {isSubmitting ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="ml-2 h-5 w-5 border-2 border-transparent border-t-white rounded-full"
                      />
                      جاري الإرسال...
                    </>
                  ) : (
                    <>
                      <Send className="ml-2 h-5 w-5" /> إرسال الرسالة
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.section
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.6 }}
        className="mt-16"
      >
        <h2 className="text-3xl font-bold text-primary text-center mb-8">موقعنا على الخريطة</h2>
        <div className="aspect-w-16 aspect-h-9 rounded-xl overflow-hidden shadow-2xl border-4 border-primary/30">
          {/* Replace with OpenStreetMap iframe or a map component */}
          <iframe
            src="https://www.openstreetmap.org/export/embed.html?bbox=31.198167800903324%2C30.03986893231807%2C31.20899200439453%2C30.04569608970079&amp;layer=mapnik&amp;marker=30.04278251960827%2C31.203579902648926"
            width="100%"
            height="450"
            style={{ border:0 }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="موقع شركة رايت ووتر"
          ></iframe>
        </div>
         <div className="text-center mt-4">
            <a 
                href="https://www.openstreetmap.org/?mlat=30.04278&mlon=31.20358#map=17/30.04278/31.20358" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
            >
                عرض خريطة أكبر
            </a>
        </div>
      </motion.section>
    </div>
  );
};

export default ContactPage;