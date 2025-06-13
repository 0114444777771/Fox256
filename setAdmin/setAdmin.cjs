// ملف: setAdmin.cjs

// استخدام const هو ممارسة أفضل من var
const admin = require("firebase-admin");

// ==========================================================
// ⭐️⭐️⭐️ أدخل بيانات المستخدم هنا ⭐️⭐️⭐️
// ==========================================================
// احصل على الـ UID من صفحة Authentication في Firebase
const USER_UID_TO_MAKE_ADMIN = "hoIGjbMl4AbEEX4LCQeTx8YNfXB2"; 
// ==========================================================


// التحقق من أن المطور قد أدخل الـ UID
if (!USER_UID_TO_MAKE_ADMIN || USER_UID_TO_MAKE_ADMIN === "PUT_THE_REAL_USER_UID_HERE") {
  console.error("\n❌ خطأ: لم تقم بإدخال الـ UID الخاص بالمستخدم في السكربت.");
  console.error("الرجاء فتح ملف setAdmin.cjs وتعديل متغير USER_UID_TO_MAKE_ADMIN.\n");
  process.exit(1); // الخروج من السكربت
}


try {
  // تهيئة التطبيق باستخدام المفتاح الموجود في نفس المجلد
  // استخدام './' يعني "المجلد الحالي"
  const serviceAccount = require("./key.json");

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });

  console.log("تم الاتصال بـ Firebase بنجاح...");
  console.log(`جاري محاولة منح صلاحيات الأدمن للمستخدم: ${USER_UID_TO_MAKE_ADMIN}`);

  // تعيين الـ Custom Claim للمستخدم المحدد
  admin.auth().setCustomUserClaims(USER_UID_TO_MAKE_ADMIN, { admin: true })
    .then(() => {
      console.log("\n✅ نجاح! تم منح صلاحيات الأدمن للمستخدم.");
      console.log("قد يحتاج المستخدم لتسجيل الخروج والدخول مرة أخرى لترى التغييرات في التطبيق.\n");
      process.exit(0); // الخروج بنجاح
    })
    .catch((error) => {
      console.error("\n❌ خطأ أثناء تعيين الـ Claim:", error.message);
      process.exit(1); // الخروج مع رمز خطأ
    });

} catch (error) {
    // هذا سيكتشف الأخطاء مثل 'MODULE_NOT_FOUND' أو أخطاء تحليل JSON
    if (error.code === 'MODULE_NOT_FOUND') {
        console.error("\n❌ خطأ: لا يمكن العثور على ملف المفتاح 'key.json'.");
        console.error("تأكد من وجود الملف في نفس المجلد مع السكربت وأن اسمه صحيح.\n");
    } else {
        console.error("\n❌ خطأ فادح أثناء تهيئة التطبيق:", error.message);
    }
    process.exit(1); // الخروج مع رمز خطأ
}
