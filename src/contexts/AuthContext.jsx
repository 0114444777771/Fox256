// src/contexts/AuthContext.js

import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  signOut as firebaseSignOut, 
  sendPasswordResetEmail,
  updatePassword as firebaseUpdatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  updateProfile,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { auth, db } from '@/firebase';
import { Loader2 } from 'lucide-react';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          const adminDoc = await getDoc(doc(db, "admins", user.uid));
          setIsAdmin(adminDoc.exists());
        } catch (error) {
          console.error("خطأ في التحقق من الصلاحيات:", error);
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // --- دوال المصادقة ---

  const signUp = async (email, password, displayName) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    await updateProfile(user, { displayName });
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      displayName: displayName,
      email: user.email,
      createdAt: serverTimestamp(),
      role: 'user'
    });
    setCurrentUser(auth.currentUser);
    return user;
  };

  const signIn = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const signOut = () => {
    return firebaseSignOut(auth);
  };

  const sendPasswordReset = (email) => {
    return sendPasswordResetEmail(auth, email, {
      url: `${window.location.origin}/login` // يوجه المستخدم لصفحة الدخول بعد إعادة التعيين
    });
  };

  const updateUserProfile = async (updates) => {
    if (!currentUser) return Promise.reject(new Error("No user is currently signed in."));
    await updateProfile(currentUser, updates);
    setCurrentUser({ ...auth.currentUser });
  };
  
  // --- بداية الدالة الجديدة والمحسّنة لتغيير كلمة المرور ---
  /**
   * دالة آمنة لتغيير كلمة المرور.
   * تقوم أولاً بإعادة مصادقة المستخدم ثم تغيير كلمة المرور.
   */
  const reauthenticateAndChangePassword = async (currentPassword, newPassword) => {
    if (!currentUser) throw new Error("No user is currently signed in.");
    
    // 1. إنشاء "بيانات اعتماد" باستخدام كلمة المرور الحالية
    const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
    
    // 2. إعادة المصادقة باستخدام بيانات الاعتماد هذه
    await reauthenticateWithCredential(currentUser, credential);
    
    // 3. إذا نجحت الخطوة السابقة، قم بتحديث كلمة المرور
    await firebaseUpdatePassword(currentUser, newPassword);
  };
  // --- نهاية الدالة الجديدة ---

  // تجميع كل القيم والدوال
  const value = {
    currentUser,
    isAdmin,
    loading,
    signUp,
    signIn,
    signOut,
    sendPasswordReset,
    updateUserProfile,
    reauthenticateAndChangePassword, // <-- الدالة الجديدة بدلاً من الدالتين القديمتين
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
        <p className="ml-4 text-xl text-foreground">جاري تحميل بيانات المستخدم...</p>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
