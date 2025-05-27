import { 
  collection, 
  onSnapshot, 
  deleteDoc, 
  doc, 
  updateDoc, 
  getDocs, 
  getDoc, 
  query, 
  where 
} from 'firebase/firestore';
import { db, auth } from '../firebase/config';
import { ref, onUnmounted } from 'vue';

// Estado reactivo para apuestas
export const apuestas = ref([]);

// Cache para el ID del banco
let cachedBancoId = null;

/**
 * Obtiene el ID del banco padre del usuario actual
 */
async function obtenerBancoPadre() {
  if (cachedBancoId) return cachedBancoId;

  try {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error("Usuario no autenticado");

    // Buscar en todos los bancos
    const bancosSnapshot = await getDocs(collection(db, 'bancos'));
    
    for (const bancoDoc of bancosSnapshot.docs) {
      const bancoId = bancoDoc.id;
      
      // 1. Buscar en listeros directos del banco
      const listeroRef = doc(db, `bancos/${bancoId}/listeros/${userId}`);
      const listeroSnap = await getDoc(listeroRef);
      if (listeroSnap.exists()) {
        cachedBancoId = bancoId;
        return bancoId;
      }

      // 2. Buscar en listeros de colectores del banco
      const colectoresSnapshot = await getDocs(
        collection(db, `bancos/${bancoId}/colectores`)
      );
      
      for (const colectorDoc of colectoresSnapshot.docs) {
        const listeroRef = doc(
          db, 
          `bancos/${bancoId}/colectores/${colectorDoc.id}/listeros/${userId}`
        );
        const listeroSnap = await getDoc(listeroRef);
        if (listeroSnap.exists()) {
          cachedBancoId = bancoId;
          return bancoId;
        }
      }
    }

    throw new Error("No se encontró el banco padre para este usuario");
  } catch (error) {
    console.error("Error obteniendo banco padre:", error);
    throw error;
  }
}

/**
 * Obtener apuestas en tiempo real con la nueva estructura
 */
export const obtenerApuestas = async () => {
  try {
    const bancoId = await obtenerBancoPadre();
    const apuestasRef = collection(db, `bancos/${bancoId}/apuestas`);

    const unsubscribe = onSnapshot(
      apuestasRef, 
      (querySnapshot) => {
        apuestas.value = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          // Asegurar valores por defecto
          candadoAbierto: doc.data().candadoAbierto ?? false,
          creadoEn: doc.data().creadoEn,
          nombre: doc.data().nombre || 'Sin nombre',
          tipo: doc.data().tipo || 'tiros',
          horario: doc.data().horario || 'Dia'
        }))
        .sort((a, b) => {
          // Ordenar por fecha de creación (más reciente primero)
          const fechaA = a.creadoEn?.toDate?.()?.getTime() || 0;
          const fechaB = b.creadoEn?.toDate?.()?.getTime() || 0;
          return fechaB - fechaA;
        });
      },
      (error) => {
        console.error('Error en la suscripción a apuestas:', error);
      }
    );

    // Retornar función para desuscribirse
    return unsubscribe;
  } catch (error) {
    console.error('Error al configurar la suscripción:', error);
    // Retornar una función vacía para mantener la interfaz consistente
    return () => {};
  }
};

/**
 * Función para manejar el almacenamiento local de forma segura
 */
const getLocalStorageArray = (key) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error(`Error al leer ${key} del localStorage:`, error);
    return [];
  }
};

/**
 * Eliminar una apuesta (online/offline)
 */
export const eliminarApuesta = async (id, esPendiente = false) => {
  try {
    if (esPendiente) {
      // Solo para apuestas pendientes (offline)
      return { success: true, offline: true };
    }

    // Para apuestas normales (Firebase)
    if (navigator.onLine) {
      const bancoId = await obtenerBancoPadre();
      await deleteDoc(doc(db, `bancos/${bancoId}/apuestas`, id));
      return { success: true };
    } else {
      // Guardar para sincronización posterior
      const eliminaciones = getLocalStorageArray('eliminacionesPendientes');
      const eliminacion = { 
        id, 
        bancoId: cachedBancoId,
        timestamp: new Date().toISOString() 
      };
      
      if (!eliminaciones.some(e => e.id === id)) {
        eliminaciones.push(eliminacion);
        localStorage.setItem('eliminacionesPendientes', JSON.stringify(eliminaciones));
      }
      return { success: true, offline: true };
    }
  } catch (error) {
    console.error('Error eliminando apuesta:', error);
    return { 
      success: false, 
      error,
      message: error.message || 'Error al eliminar la apuesta'
    };
  }
};

/**
 * Sincronizar eliminaciones pendientes
 */
export const sincronizarEliminaciones = async () => {
  if (!navigator.onLine) return;

  const eliminaciones = getLocalStorageArray('eliminacionesPendientes');
  if (eliminaciones.length === 0) return;

  try {
    const resultados = await Promise.allSettled(
      eliminaciones.map(({id, bancoId}) => 
        deleteDoc(doc(db, `bancos/${bancoId}/apuestas`, id))
      )
    );

    // Filtrar solo las exitosas
    const exitosas = eliminaciones.filter((_, index) => 
      resultados[index].status === 'fulfilled'
    );

    // Actualizar localStorage
    if (exitosas.length === eliminaciones.length) {
      localStorage.removeItem('eliminacionesPendientes');
    } else {
      const fallidas = eliminaciones.filter((_, index) => 
        resultados[index].status === 'rejected'
      );
      localStorage.setItem('eliminacionesPendientes', JSON.stringify(fallidas));
    }

    console.log(`Sincronizadas ${exitosas.length} eliminaciones`);
  } catch (error) {
    console.error('Error general en sincronizarEliminaciones:', error);
  }
};

/**
 * Editar una apuesta
 */
export const editarApuesta = async (id, datosActualizados) => {
  try {
    const bancoId = await obtenerBancoPadre();
    await updateDoc(
      doc(db, `bancos/${bancoId}/apuestas`, id), 
      {
        ...datosActualizados,
        actualizadoEn: new Date().toISOString()
      }
    );
    return { success: true };
  } catch (error) {
    console.error('Error actualizando apuesta:', error);
    return { 
      success: false, 
      error,
      message: error.message || 'Error al actualizar la apuesta'
    };
  }
};

/**
 * Obtener apuestas por filtros
 */
export const obtenerApuestasFiltradas = async (filtros = {}) => {
  try {
    const bancoId = await obtenerBancoPadre();
    const apuestasRef = collection(db, `bancos/${bancoId}/apuestas`);
    
    // Construir condiciones de filtrado
    const condiciones = [];
    if (filtros.horario) {
      condiciones.push(where('horario', '==', filtros.horario));
    }
    if (filtros.tipo) {
      condiciones.push(where('tipo', '==', filtros.tipo));
    }
    if (filtros.id_listero) {
      condiciones.push(where('id_listero', '==', filtros.id_listero));
    }
    if (filtros.candadoAbierto !== undefined) {
      condiciones.push(where('candadoAbierto', '==', filtros.candadoAbierto));
    }

    // Ejecutar consulta
    const q = query(apuestasRef, ...condiciones);
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error obteniendo apuestas filtradas:', error);
    throw error;
  }
};

/**
 * Listener para cambios de conexión
 */
if (typeof window !== 'undefined') {
  // Sincronizar al detectar conexión
  window.addEventListener('online', () => {
    setTimeout(sincronizarEliminaciones, 1000);
  });

  // Sincronizar al cargar si hay conexión
  if (navigator.onLine) {
    setTimeout(() => {
      sincronizarEliminaciones();
    }, 2000);
  }
}