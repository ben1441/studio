import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

// In a deployed environment like Vercel or Firebase App Hosting,
// service account credentials will be set as environment variables.
// For local development, you need to set FIREBASE_SERVICE_ACCOUNT
// in your .env.local file.
try {
  if (!getApps().length) {
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      initializeApp({
        credential: cert(serviceAccount),
      });
    } else {
      // This is for environments like Firebase App Hosting where the SDK
      // is automatically configured.
      initializeApp();
    }
  }
} catch (error) {
  console.error('Firebase Admin initialization error:', error);
}

const adminDb = getFirestore();

export { adminDb, FieldValue };
