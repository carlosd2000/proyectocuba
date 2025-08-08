import { deleteDoc, doc } from 'firebase/firestore'
import { db } from '../firebase/config'
import { ref } from 'vue'
import { useAuthStore } from '@/stores/authStore'

// Estado reactivo para apuestas
export const apuestas = ref([])
const authStore = useAuthStore()

// Eliminar una apuesta (online/offline)
export const eliminarApuesta = async (id, esPendiente = false) => {
  try {

    if (navigator.onLine && !esPendiente) {
      const bancoId = authStore.bancoId
      await deleteDoc(doc(db, `bancos/${bancoId}/apuestas`, id));
      return { success: true };
    }
    
    return { success: true, offline: true };
  } catch (error) {
    console.error('Error eliminando apuesta:', error);
    return { success: false, error };
  }
};

export const sincronizarEliminaciones = async () => {
  if (!navigator.onLine) {
    return { success: false, message: 'offline' };
  }

  try {
    const eliminacionesStr = localStorage.getItem('eliminacionesPermanentes') || '{}';
    const eliminaciones = JSON.parse(eliminacionesStr);
    const idsAEliminar = Object.keys(eliminaciones).filter(id => eliminaciones[id] === true);
    

    if (idsAEliminar.length === 0) {
      return { success: true, count: 0 };
    }

    const bancoId = authStore.bancoId;
    if (!bancoId) {
      console.error('[SYNC-ELIM] No se pudo obtener bancoId');
      return { success: false, message: 'no-banco-id' };
    }

    const resultados = await Promise.allSettled(
      idsAEliminar.map(id => 
        deleteDoc(doc(db, `bancos/${bancoId}/apuestas`, id))
      )
    );

    let exitosas = 0;
    const eliminacionesActualizadas = {...eliminaciones};

    resultados.forEach((resultado, index) => {
      const id = idsAEliminar[index];
      if (resultado.status === 'fulfilled') {
        delete eliminacionesActualizadas[id];
        exitosas++;
      } else {
        console.error(`[SYNC-ELIM] Error eliminando ${id}:`, resultado.reason);
      }
    });

    localStorage.setItem('eliminacionesPermanentes', JSON.stringify(eliminacionesActualizadas));
    
    return { 
      success: exitosas === idsAEliminar.length, 
      count: exitosas,
      total: idsAEliminar.length
    };
  } catch (error) {
    console.error('[SYNC-ELIM] Error general:', error);
    return { success: false, error: error.message };
  }
};