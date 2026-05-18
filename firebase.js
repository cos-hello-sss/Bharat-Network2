import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDCikYTY71IMiF_Xskch02hvyR-mI3irP4",
  authDomain: "gram-ai-10b71.firebaseapp.com",
  databaseURL: "https://gram-ai-10b71-default-rtdb.firebaseio.com",
  projectId: "gram-ai-10b71",
  storageBucket: "gram-ai-10b71.firebasestorage.app",
  messagingSenderId: "1041436242531",
  appId: "1:1041436242531:web:94ef302cd31591f3247e56",
  measurementId: "G-Z6FYXWEEQX",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export default app;
