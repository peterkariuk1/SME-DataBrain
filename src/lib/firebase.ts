import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

/** Optional but handy exports */

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBTcEO8cJj9_h9hNKPJKIBsnbC29Eyb43g",
  authDomain: "sme-databrain.firebaseapp.com",
  projectId: "sme-databrain",
  storageBucket: "sme-databrain.firebasestorage.app",
  messagingSenderId: "904385697944",
  appId: "1:904385697944:web:c70a3750cc1d62233098ed",
  measurementId: "G-0MWM42ZNKZ"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
