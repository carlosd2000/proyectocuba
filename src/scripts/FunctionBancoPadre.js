    // FunctionBancoPadre.js
    import { db, auth } from '../firebase/config';
    import { doc, getDoc, collection, getDocs } from 'firebase/firestore';

    export function getCachedBancoId() {
    try {
        return localStorage.getItem('cachedBancoId') || null;
    } catch (error) {
        console.error('Error al leer cachedBancoId:', error);
        return null;
    }
    }

    function setCachedBancoId(bancoId) {
    try {
        if (bancoId) {
        localStorage.setItem('cachedBancoId', bancoId);
        } else {
        localStorage.removeItem('cachedBancoId');
        }
    } catch (error) {
        console.error('Error al guardar cachedBancoId:', error);
    }
    }

    export async function obtenerBancoPadre() {
    // Primero intentamos con el cache
    const cachedId = getCachedBancoId();
    if (cachedId) return cachedId;
    
    try {
        const userId = auth.currentUser?.uid;
        if (!userId) {
        console.error("Usuario no autenticado");
        return null;
        }

        // Buscar en bancos/{bancoId}/listeros/{userId}
        const bancosSnapshot = await getDocs(collection(db, 'bancos'));
        
        for (const bancoDoc of bancosSnapshot.docs) {
        const bancoId = bancoDoc.id;
        
        // 1. Buscar en listeros directos del banco
        const listeroRef = doc(db, `bancos/${bancoId}/listeros/${userId}`);
        const listeroSnap = await getDoc(listeroRef);
        if (listeroSnap.exists()) {
            setCachedBancoId(bancoId);
            return bancoId;
        }

        // 2. Buscar en colectores
        const colectoresSnapshot = await getDocs(collection(db, `bancos/${bancoId}/colectores`));
        
        for (const colectorDoc of colectoresSnapshot.docs) {
            const colectorId = colectorDoc.id;
            const listeroRef = doc(db, `bancos/${bancoId}/colectores/${colectorId}/listeros/${userId}`);
            const listeroSnap = await getDoc(listeroRef);
            if (listeroSnap.exists()) {
            setCachedBancoId(bancoId);
            return bancoId;
            }
        }
        }

        console.error("No se encontró el banco padre para este usuario");
        return null;
    } catch (error) {
        console.error("Error obteniendo banco padre:", error);
        return null;
    }
}