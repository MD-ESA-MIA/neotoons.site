import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { firebaseConfig, isFirebaseConfigured } from "./firebase-config";

let app;
let db: any = null;
let auth: any = null;

if (isFirebaseConfigured()) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    db = getFirestore(app);
    auth = getAuth(app);
    console.log("🔥 Firebase initialized successfully.");
  } catch (error) {
    console.error("❌ Firebase initialization failed:", error);
  }
} else {
  console.warn("⚠️ Firebase is not configured. Using local mock data mode.");
}

export { db, auth };
export const firebaseEnabled = isFirebaseConfigured();
