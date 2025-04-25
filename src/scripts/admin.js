import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { getFirestore, setDoc, doc } from "firebase/firestore";

// Configuración Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDX6xZUooE0ih3Dl804NC9m7_ko4zYDLUo",
  authDomain: "proyectocuba-7ca95.firebaseapp.com",
  projectId: "proyectocuba-7ca95",
  storageBucket: "proyectocuba-7ca95.firebasestorage.app",
  messagingSenderId: "795699802884",
  appId: "1:795699802884:web:cbfb6d31bc30862f041651"
  
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Crear usuario admin
const crearAdmin = async () => {
  const email = "adminroger@miapp.com";
  const password = "admin1234"; // Cambia esta contraseña luego
  const tipo = "admin"; // Importante: colección padre

  try {
    // 1. Crear en Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // 2. Guardar perfil en la colección "admin"
    await setDoc(doc(db, tipo, user.uid), {
      nombre: "SuperAdmin",
      email: email,
      tipo: "admin",
      rol: "superadmin",
      createdAt: new Date().toISOString()
    });

    console.log("✅ Usuario ADMIN creado y guardado en colección 'admin'");
  } catch (error) {
    console.error("❌ Error al crear admin:", error.message);
  }
};

crearAdmin();
