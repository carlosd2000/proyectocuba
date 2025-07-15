// scripts/obtenerTransacciones.js
import { db } from '../firebase/config';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import localforage from '../stores/localStorage';
import { useAuthStore } from '@/stores/authStore'

export async function obtenerTransacciones(userId) {
  try {
    const authStore = useAuthStore()
    const bancoId = authStore.bancoId
    if (!bancoId) return [];

    const transRef = collection(db, `bancos/${bancoId}/transacciones`);
    const q = query(transRef, where("userId", "==", userId), orderBy("updatedAt", "desc"));

    const snapshot = await getDocs(q);
    const transacciones = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    await localforage.setItem(`transacciones_${userId}`, transacciones);
    return transacciones;
  } catch (error) {
    console.error('Error al obtener transacciones:', error);
    return [];
  }
}
