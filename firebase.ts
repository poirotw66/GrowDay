/**
 * Firebase initialization for Auth (Google) and Firestore (game state sync).
 * Set VITE_FIREBASE_* in .env.local - see docs/FIREBASE_SETUP.md.
 */

import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, doc, getDoc, getDocFromServer, setDoc, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';

// Helper to clean environment variables (remove quotes and trailing commas)
const cleanEnvVar = (value: string | undefined): string | undefined => {
  if (!value) return undefined;
  return value.trim().replace(/^["']|["'],?\s*$/g, '');
};

const firebaseConfig = {
  apiKey: cleanEnvVar(import.meta.env.VITE_FIREBASE_API_KEY),
  authDomain: cleanEnvVar(import.meta.env.VITE_FIREBASE_AUTH_DOMAIN),
  projectId: cleanEnvVar(import.meta.env.VITE_FIREBASE_PROJECT_ID),
  storageBucket: cleanEnvVar(import.meta.env.VITE_FIREBASE_STORAGE_BUCKET),
  messagingSenderId: cleanEnvVar(import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID),
  appId: cleanEnvVar(import.meta.env.VITE_FIREBASE_APP_ID),
};

function getFirebase(): { app: FirebaseApp; auth: Auth; db: Firestore; storage: FirebaseStorage } | null {
  if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
    return null;
  }
  const app = getApps().length === 0 ? initializeApp(firebaseConfig) : (getApps()[0] as FirebaseApp);
  const auth = getAuth(app);
  const db = getFirestore(app);
  const storage = getStorage(app);
  return { app, auth, db, storage };
}

export const firebase = getFirebase();
export const auth = firebase?.auth ?? null;
export const db = firebase?.db ?? null;
export const storage = firebase?.storage ?? null;
export const isFirebaseEnabled = Boolean(firebase);

// Debug helper: Log Firebase config status (only in development or if explicitly enabled)
if (typeof window !== 'undefined') {
  const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const debugEnabled = new URLSearchParams(window.location.search).has('debug-firebase');
  
  if (isDev || debugEnabled) {
    console.group('🔥 Firebase Configuration Status');
    console.log('API Key:', firebaseConfig.apiKey ? '✅ Set' : '❌ Missing');
    console.log('Auth Domain:', firebaseConfig.authDomain || '❌ Missing');
    console.log('Project ID:', firebaseConfig.projectId || '❌ Missing');
    console.log('Storage Bucket:', firebaseConfig.storageBucket || '❌ Missing');
    console.log('Firebase Initialized:', isFirebaseEnabled ? '✅ Yes' : '❌ No');
    console.log('Auth Available:', auth ? '✅ Yes' : '❌ No');
    console.log('Firestore Available:', db ? '✅ Yes' : '❌ No');
    console.groupEnd();
  }
}

const USERS_COLLECTION = 'users';
const GAME_STATE_FIELD = 'gameState';
const UPDATED_AT_FIELD = 'updatedAt';

export async function getGameStateForUser(uid: string): Promise<unknown | null> {
  if (!db) {
    throw new Error('Firestore is not initialized. Please check your Firebase configuration.');
  }
  const ref = doc(db, USERS_COLLECTION, uid);
  // Force read from server to avoid stale cache (e.g. after delete habit)
  try {
    const snap = await getDocFromServer(ref);
    if (!snap.exists()) return null;
    const data = snap.data();
    return data[GAME_STATE_FIELD] ?? null;
  } catch (e) {
    // Fallback to cache if offline
    try {
      const snap = await getDoc(ref);
      if (!snap.exists()) return null;
      const data = snap.data();
      return data[GAME_STATE_FIELD] ?? null;
    } catch (fallbackError) {
      console.error('Failed to read from Firestore (both server and cache)', fallbackError);
      throw e; // Throw original error
    }
  }
}

/**
 * Firestore does not accept undefined as a field value. Serialize via JSON to strip
 * undefined (e.g. habit.petNickname, DayLog.position) before writing.
 * Use full document write (no merge) so the entire gameState is replaced and not merged.
 */
export async function setGameStateForUser(uid: string, gameState: unknown): Promise<void> {
  if (!db) {
    throw new Error('Firestore is not initialized. Please check your Firebase configuration.');
  }
  const ref = doc(db, USERS_COLLECTION, uid);
  const sanitized = JSON.parse(JSON.stringify(gameState));
  await setDoc(ref, { [GAME_STATE_FIELD]: sanitized, [UPDATED_AT_FIELD]: new Date().toISOString() });
}
