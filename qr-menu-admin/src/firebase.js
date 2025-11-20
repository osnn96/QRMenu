// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Firebase configuration - Environment variables'dan alınıyor
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Yapılandırmanın doğru yüklendiğini kontrol et
console.log("🔥 Firebase Config:", {
  apiKey: firebaseConfig.apiKey ? "✓ Var" : "❌ YOK",
  authDomain: firebaseConfig.authDomain,
  projectId: firebaseConfig.projectId
});

if (!firebaseConfig.apiKey) {
  console.error("❌ Firebase yapılandırması yüklenemedi! .env dosyasını kontrol edin.");
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);
console.log("✅ Firebase başlatıldı:", app.name);

// Firestore veritabanı servisini başlat ve dışa aktar
export const db = getFirestore(app); 
export const auth = getAuth(app);