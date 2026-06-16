import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyB7g09v4HBaepi5XBx4ApP9kNdDK_Tk1Y4",
  authDomain: "bodegacontrol-413e2.firebaseapp.com",
  projectId: "bodegacontrol-413e2",
  storageBucket: "bodegacontrol-413e2.firebasestorage.app",
  messagingSenderId: "351532802310",
  appId: "1:351532802310:web:ee936fa98bb6a68dc1fe87",
  measurementId: "G-B027B0N7PN"
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const appId = 'bodega-central';
