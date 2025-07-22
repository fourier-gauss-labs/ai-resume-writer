// Import the functions you need from the Firebase SDKs
import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFunctions, connectFunctionsEmulator } from "firebase/functions";
import { getStorage, connectStorageEmulator } from "firebase/storage";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";

// Firebase configuration using environment variables
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Initialize Firebase Functions
export const functions = getFunctions(app);

// Initialize Firebase Storage
export const storage = getStorage(app);

// Initialize Firebase Firestore
export const db = getFirestore(app);

// Connect to emulators in development based on environment variable
const useEmulator = process.env.NEXT_PUBLIC_FIREBASE_ENV === 'emulator';

if (useEmulator && typeof window !== 'undefined') {
    console.log('🔧 Connecting to Firebase emulators...');

    try {
        connectAuthEmulator(auth, 'http://localhost:9099');
    } catch {
        // Already connected or connection failed - ignore
    }

    try {
        connectFunctionsEmulator(functions, 'localhost', 5001);
    } catch {
        // Already connected or connection failed - ignore
    }

    try {
        connectStorageEmulator(storage, 'localhost', 9199);
    } catch {
        // Already connected or connection failed - ignore
    }

    try {
        connectFirestoreEmulator(db, 'localhost', 8080);
    } catch {
        // Already connected or connection failed - ignore
    }
} else if (typeof window !== 'undefined') {
    console.log('☁️ Using production Firebase services for development...');
    console.log('📍 Environment:', process.env.NEXT_PUBLIC_FIREBASE_ENV || 'cloud (default)');
}