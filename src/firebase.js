// src/firebase.js - النسخة النهائية والمركزية (مُوصى بها)

import { initializeApp } from "firebase/app";
import { 
  getAuth, GoogleAuthProvider, FacebookAuthProvider, TwitterAuthProvider, 
  createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, 
  sendPasswordResetEmail, updateProfile, signInWithPopup, updatePassword, 
  reauthenticateWithCredential, EmailAuthProvider 
} from "firebase/auth";
import { 
  getFirestore, collection, doc, addDoc, getDoc, getDocs, updateDoc, 
  deleteDoc, query, where, orderBy, limit, onSnapshot, serverTimestamp, 
  Timestamp, writeBatch, increment 
} from "firebase/firestore";
import { 
  getStorage, ref, uploadBytes, getDownloadURL, deleteObject 
} from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

// تأكد من أن هذه البيانات صحيحة ومأخوذة من مشروعك على Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBVkdyjJi3l-QB1KpSQJle_P9ujHQ2LTn0", // هام: هذا المفتاح يجب أن يكون سريًا في المشاريع الحقيقية باستخدام متغيرات البيئة
  authDomain: "right-water.firebaseapp.com",
  projectId: "right-water",
  storageBucket: "right-water.appspot.com", // الصيغة الصحيحة عادةً تكون .appspot.com
  messagingSenderId: "134412024932",
  appId: "1:134412024932:web:be47e36b50f087e2a87371",
  measurementId: "G-0RZ3XYPXR7"
};

// تهيئة الخدمات
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const analytics = getAnalytics(app); // تهيئة Analytics

// تهيئة موفري المصادقة
const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();
const twitterProvider = new TwitterAuthProvider();

// --- تصدير مركزي لكل شيء ---
// أي ملف الآن يمكنه استيراد أي من هذه الدوال بسهولة
export {
  // الخدمات الأساسية
  db,
  auth,
  storage,
  analytics,

  // موفري المصادقة
  googleProvider,
  facebookProvider,
  twitterProvider,

  // دوال المصادقة (Auth)
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
  signInWithPopup,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  
  // دوال Firestore
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  writeBatch,
  increment,
  
  // دوال التخزين (Storage)
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject
};
