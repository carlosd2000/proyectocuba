import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, writeBatch } from "firebase/firestore";

// Usa la misma configuración que ya tienes
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
const db = getFirestore(app);

// Función para actualizar todas las apuestas
const desbloquearApuestas = async () => {
  try {
    // 1. Obtener referencia a la colección
    const apuestasRef = collection(db, "apuestas");
    
    // 2. Obtener todos los documentos
    const snapshot = await getDocs(apuestasRef);
    
    // 3. Crear un batch para múltiples escrituras
    const batch = writeBatch(db);
    let contador = 0;
    
    // 4. Preparar las actualizaciones
    snapshot.forEach(doc => {
      batch.update(doc.ref, { candadoAbierto: true });
      contador++;
    });
    
    // 5. Ejecutar el batch
    await batch.commit();
    
    console.log(`✅ Se actualizaron ${contador} apuestas correctamente.`);
  } catch (error) {
    console.error("❌ Error al actualizar las apuestas:", error);
  } finally {
    process.exit(); // Terminar el proceso
  }
};

// Ejecutar la función
desbloquearApuestas();

//                      node src/scripts/admincandadostrue.js