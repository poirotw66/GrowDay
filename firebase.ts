/**
 * Firebase initialization for Auth (Google) and Firestore (game state sync).
 * Set VITE_FIREBASE_* in .env.local - see docs/FIREBASE_SETUP.md.
 */

import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, type Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

function getFirebase(): { app: FirebaseApp; auth: Auth; db: Firestore } | null {
  if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
    return null;
  }
  const app = getApps().length === 0 ? initializeApp(firebaseConfig) : (getApps()[0] as FirebaseApp);
  const auth = getAuth(app);
  const db = getFirestore(app);
  return { app, auth, db };
}

export const firebase = getFirebase();
export const auth = firebase?.auth ?? null;
export const db = firebase?.db ?? null;
export const isFirebaseEnabled = Boolean(firebase);

const USERS_COLLECTION = 'users';
const GAME_STATE_FIELD = 'gameState';
const UPDATED_AT_FIELD = 'updatedAt';

export async function getGameStateForUser(uid: string): Promise<unknown | null> {
  if (!db) return null;
  const ref = doc(db, USERS_COLLECTION, uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  const data = snap.data();
  return data[GAME_STATE_FIELD] ?? null;
}

export async function setGameStateForUser(uid: string, gameState: unknown): Promise<void> {
  if (!db) return;
  const ref = doc(db, USERS_COLLECTION, uid);
  await setDoc(ref, { [GAME_STATE_FIELD]: gameState, [UPDATED_AT_FIELD]: new Date().toISOString() }, { merge: true });
}
