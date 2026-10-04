import { getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY || 'demo-api-key',
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || 'demo.firebaseapp.com',
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || 'demo',
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || 'demo.appspot.com',
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || '0',
    appId: process.env.REACT_APP_FIREBASE_APP_ID || '1:0:web:demo',
    measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
