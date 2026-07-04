/**
 * Firebase configuration (optional — for apps needing Firebase alongside Supabase)
 * 
 * To use Firebase alongside Supabase:
 * 1. Install firebase: npm install firebase
 * 2. Set your Firebase config in VITE_FIREBASE_* environment variables
 * 3. Uncomment the Firebase imports below
 * 
 * Otherwise, this module can be safely deleted.
 */

// Uncomment when Firebase is needed:
// import { initializeApp } from 'firebase/app';
// import { getAuth, connectAuthEmulator } from 'firebase/auth';
// import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
// import { getStorage, connectStorageEmulator } from 'firebase/storage';
// import { getMessaging, getToken, onMessage } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || '',
};

let firebaseApp = null;
let firebaseAuth = null;
let firestore = null;
let firebaseStorage = null;
let messaging = null;

const isFirebaseConfigured = () => {
  return Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);
};

/**
 * Initialize Firebase (call once at app startup)
 * @returns {object|null} Firebase app instance or null if not configured
 */
export function initFirebase() {
  if (!isFirebaseConfigured()) {
    console.warn(
      'Firebase not configured. Set VITE_FIREBASE_* environment variables to enable Firebase features.'
    );
    return null;
  }

  if (firebaseApp) return firebaseApp;

  try {
    // Dynamic import to avoid bundling Firebase when not used
    // In production, you'd import statically:
    // firebaseApp = initializeApp(firebaseConfig);
    // firebaseAuth = getAuth(firebaseApp);
    // firestore = getFirestore(firebaseApp);
    // firebaseStorage = getStorage(firebaseApp);
    //
    // if (import.meta.env.DEV) {
    //   connectAuthEmulator(firebaseAuth, 'http://localhost:9099');
    //   connectFirestoreEmulator(firestore, 'localhost', 8080);
    //   connectStorageEmulator(firebaseStorage, 'localhost', 9199);
    // }

    console.log('Firebase initialized (config loaded)');
    return firebaseApp;
  } catch (err) {
    console.error('Firebase initialization error:', err);
    return null;
  }
}

/**
 * Get Firebase Auth instance
 * @returns {object|null}
 */
export function getFirebaseAuth() {
  if (!firebaseAuth && firebaseApp) {
    // firebaseAuth = getAuth(firebaseApp);
  }
  return firebaseAuth;
}

/**
 * Get Firestore instance
 * @returns {object|null}
 */
export function getFirestore() {
  if (!firestore && firebaseApp) {
    // firestore = getFirestore(firebaseApp);
  }
  return firestore;
}

/**
 * Get Firebase Storage instance
 * @returns {object|null}
 */
export function getFirebaseStorage() {
  if (!firebaseStorage && firebaseApp) {
    // firebaseStorage = getStorage(firebaseApp);
  }
  return firebaseStorage;
}

/**
 * Initialize Firebase Cloud Messaging (for push notifications)
 * @param {string} vapidKey - VAPID key for web push
 * @returns {Promise<object|null>} { token, messaging }
 */
export async function initMessaging(vapidKey) {
  if (!isFirebaseConfigured()) return null;

  try {
    // Uncomment when Firebase messaging package is installed:
    // messaging = getMessaging(firebaseApp);
    // const registration = await navigator.serviceWorker.ready;
    // const token = await getToken(messaging, {
    //   vapidKey,
    //   serviceWorkerRegistration: registration,
    // });
    // 
    // onMessage(messaging, (payload) => {
    //   console.log('FCM foreground message:', payload);
    //   // Handle foreground notification
    //   if (payload.notification) {
    //     // Show in-app notification
    //   }
    // });
    // 
    // return { token, messaging };

    return { token: null, messaging: null };
  } catch (err) {
    console.error('FCM initialization error:', err);
    return null;
  }
}

/**
 * Check if any Firebase service is configured and ready
 * @returns {boolean}
 */
export function isFirebaseReady() {
  return isFirebaseConfigured() && firebaseApp !== null;
}

export default {
  initFirebase,
  getFirebaseAuth,
  getFirestore,
  getFirebaseStorage,
  initMessaging,
  isFirebaseReady,
  firebaseConfig,
};
