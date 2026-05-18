// src/services/firebaseConfig.ts
import { getApp, getApps, initializeApp } from "firebase/app";
import { initializeAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Inyectamos las variables del .env
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

// Evitar inicializar múltiples veces con el Fast Refresh de Expo
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Inicializar Auth
const auth = initializeAuth(app);

// Inicializar la base de datos NoSQL
const db = getFirestore(app);

export { app, auth, db };
