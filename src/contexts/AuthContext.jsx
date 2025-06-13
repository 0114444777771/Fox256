// src/contexts/AuthContext.jsx (النسخة النهائية والمعدلة)

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
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/firebase';
import { Loader2 } from 'lucide-react';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true); // حالة تحميل واحدة شاملة

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true); // نبدأ التحميل عند تغير حالة المستخدم
      if (user) {
        // إذا وجد مستخدم، نقوم بتعيينه وجلب صلاحياته
        setCurrentUser(user);
        try {
          // 🔥🔥 الكود الأساسي للتحقق من صلاحيات الأدمن 🔥🔥
          // نجلب الـ ID token الخاص بالمستخدم ونجبره على التحديث
          // هذا يضمن أننا نحصل على أحدث Custom Claims
          const idTokenResult = await user.getIdTokenResult(true);
          
          // نتحقق من وجود claim اسمه admin وقيمته true
          setIsAdmin(!!idTokenResult.claims.admin);
          
        } catch (error) {
          console.error("خطأ في التحقق من صلاحيات الأدمن:", error);
          setIsAdmin(false);
        }
      } else {
        // إذا لم يكن هناك مستخدم، نعيد كل شيء لوضعه الافتراضي
        setCurrentUser(null);
        setIsAdmin(false);
      }
      setLoading(false); // انتهى التحميل
    });

    return () => unsubscribe();
  }, []);

  // --- دوال المصادقة (لا يوجد تغيير هنا) ---
  const signUp = async (email, password, displayName) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    await updateProfile(user, { displayName });
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      displayName: displayName,
      email: user.email,
      createdAt: serverTimestamp(),
      role: 'user' // تعيين دور افتراضي
    });
    // لا حاجة لـ setCurrentUser هنا، onAuthStateChanged ستقوم بذلك
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
      url: `${window.location.origin}/login`
    });
  };

  const updateUserProfile = async (updates) => {
    if (!currentUser) return Promise.reject(new Error("No user is currently signed in."));
    await updateProfile(currentUser, updates);
    setCurrentUser({ ...auth.currentUser });
  };
  
  const reauthenticateAndChangePassword = async (currentPassword, newPassword) => {
    if (!currentUser) throw new Error("No user is currently signed in.");
    const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
    await reauthenticateWithCredential(currentUser, credential);
    await firebaseUpdatePassword(currentUser, newPassword);
  };

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
    reauthenticateAndChangePassword,
  };

  // لا نعرض أي شيء أثناء التحميل الأولي
  if (loading && !currentUser) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
        <p className="ml-4 text-xl text-foreground">جاري التحميل...</p>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
