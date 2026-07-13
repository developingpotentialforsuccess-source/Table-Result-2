import { initializeApp } from 'firebase/app';
import { initializeFirestore } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

export const isFirebaseConfigured = () => {
  return firebaseConfig && 
         firebaseConfig.projectId !== 'remixed-project-id' && 
         firebaseConfig.apiKey !== 'remixed-api-key' &&
         firebaseConfig.apiKey !== '';
};

const app = initializeApp(firebaseConfig);

export const db = initializeFirestore(app, {
  ignoreUndefinedProperties: true,
});
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
