// استيراد حزمة الأدمن
const admin = require('firebase-admin');

// استيراد مفتاح حساب الخدمة الذي حملته
// !!! غيّر اسم الملف لاسم الملف الذي حملته
const serviceAccount = require('right-water-firebase-adminsdk-fbsvc-b72831e386.json');

// تهيئة تطبيق الأدمن
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// !!! ضع الـ UID الخاص بحسابك هنا
const uid = 'hoIGjbMl4AbEEX4LCQeTx8YNfXB2';

// تعيين صلاحية الأدمن للمستخدم
admin.auth().setCustomUserClaims(uid, { admin: true })
  .then(() => {
    console.log(`Success! User ${uid} is now an admin.`);
    process.exit(0); // إنهاء السكربت بنجاح
  })
  .catch((error) => {
    console.error('Error setting custom claims:', error);
    process.exit(1); // إنهاء السكربت بخطأ
  });
