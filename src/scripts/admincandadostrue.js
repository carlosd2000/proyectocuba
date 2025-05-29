import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, writeBatch, doc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDX6xZUooE0ih3Dl804NC9m7_ko4zYDLUo",
  authDomain: "proyectocuba-7ca95.firebaseapp.com",
  projectId: "proyectocuba-7ca95",
  storageBucket: "proyectocuba-7ca95.firebasestorage.app",
  messagingSenderId: "795699802884",
  appId: "1:795699802884:web:cbfb6d31bc30862f041651"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const desbloquearApuestas = async () => {
  try {
    const apuestasRef = collection(db, "bancos/vj2Ady2beCMwsbZJe9h4EiXXJBg2/apuestas");
    const snapshot = await getDocs(apuestasRef);
    const batch = writeBatch(db);
    let contador = 0;

    snapshot.forEach((d) => {
      const docRef = doc(db, "bancos/vj2Ady2beCMwsbZJe9h4EiXXJBg2/apuestas", d.id);
      batch.set(docRef, { candadoAbierto: true }, { merge: true }); // usar set con merge
      contador++;
    });

    await batch.commit();
    console.log(`✅ Se actualizaron ${contador} apuestas correctamente.`);
  } catch (error) {
    console.error("❌ Error al actualizar las apuestas:", error);
  } finally {
    process.exit();
  }
};

desbloquearApuestas();
