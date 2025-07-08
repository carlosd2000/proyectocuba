// scripts/syncTransaccionesRealtime.js
import { db } from '../firebase/config';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import localforage from '../stores/localStorage';
import { obtenerBancoPadre } from './FunctionBancoPadre';

export function observarTransacciones(userId, callback) {
  obtenerBancoPadre().then(bancoId => {
    if (!bancoId) return;

    const transRef = collection(db, `bancos/${bancoId}/transacciones`);
    const q = query(transRef, where("userId", "==", userId), orderBy("updatedAt", "desc"));

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const transacciones = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      await localforage.setItem(`transacciones_${userId}`, transacciones);
      callback(transacciones); // Actualiza la UI
    });

    return unsubscribe;
  });
}
