// firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCCM46chLApkRjx350UEFzq3Kp8oaOzSZ4",
  authDomain: "communityapp-90378.firebaseapp.com",
  projectId: "communityapp-90378",
  storageBucket: "communityapp-90378.firebasestorage.app",
  messagingSenderId: "425832859509",
  appId: "1:425832859509:web:e379c142725c86a1f0b53c",
  measurementId: "G-V8J3ZYEGV4"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
