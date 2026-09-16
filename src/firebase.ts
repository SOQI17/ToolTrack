import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyB7g09v4HBaepi5XBx4ApP9kNdDK_Tk1Y4",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "bodegacontrol-413e2.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "bodegacontrol-413e2",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "bodegacontrol-413e2.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "351532802310",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:351532802310:web:ee936fa98bb6a68dc1fe87",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-B027B0N7PN"
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const appId = 'bodega-central';
