import { initializeApp } from "firebase/app";//modulos de firebase 
import { getFirestore } from "firebase/firestore";//traer base de datos
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';
//las variables de entorno conexion
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Configura persistencia
setPersistence(auth, browserLocalPersistence)
  .then(() => console.log("Persistencia configurada"))
  .catch((error) => console.error("Error en persistencia:", error));

export { db, auth };
