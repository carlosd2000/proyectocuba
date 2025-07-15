import { db, auth } from '../firebase/config';
import { serverTimestamp, updateDoc, doc, setDoc, getDoc, deleteDoc } from 'firebase/firestore';
import { filasFijas, filasExtra, expandirApuestasPorLinea } from './operaciones';
import { ref } from 'vue';
import { obtenerHoraCuba } from './horacuba.js';
import { useAuthStore } from '@/stores/authStore'

// Variables reactivas
export const nombreTemporal = ref('');
export const tipoOrigen = ref('tiros');
export const horarioSeleccionado = ref(null);
export const hayHorariosDisponibles = ref(true);
export const modoEdicion = ref(false);
export const idEdicion = ref('');
export const uuidGenerado = ref('');

const authStore = useAuthStore()

let syncPending = false;
let cachedBancoId = null;

// ================= CONFIGURACIÓN =================
export function setNombre(nombre) {
  nombreTemporal.value = nombre?.trim();
}

export function setTipoOrigen(tipo) {
  tipoOrigen.value = tipo || 'tiros';
}

export function setHorario(horario) {
  horarioSeleccionado.value = horario;
}

export function setModoEdicion(editar, id) {
  modoEdicion.value = editar;
  idEdicion.value = id || '';
}

// ================= FUNCIONES AUXILIARES =================
export function generarUUID() {
  return window.crypto?.randomUUID?.() || 
         Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function tomarUUID() {
  uuidGenerado.value = generarUUID();
  return uuidGenerado.value;
}

function guardarEnLocal(docAGuardar, esEdicion = false) {
  try {
    const pendientes = JSON.parse(localStorage.getItem('apuestasPendientes') || '[]');
    const pendientesArray = Array.isArray(pendientes) ? pendientes : [];
    
    if (esEdicion) {
      const index = pendientesArray.findIndex(p => p.uuid === docAGuardar.uuid);
      if (index !== -1) {
        pendientesArray[index] = docAGuardar;
      } else {
        pendientesArray.push(docAGuardar);
      }
    } else {
      const existe = pendientesArray.some(p => p.uuid === docAGuardar.uuid);
      if (!existe) {
        pendientesArray.push(docAGuardar);
      }
    }
    
    localStorage.setItem('apuestasPendientes', JSON.stringify(pendientesArray));
    window.dispatchEvent(new Event('apuestas-locales-actualizadas'));
    return true;
  } catch (error) {
    console.error('Error guardando en localStorage:', error);
    return false;
  }
}

// ================= PROCESAMIENTO DE DATOS =================
function procesarFilas(filas, tipo) {
  return filas.map((fila, index) => {
    // Eliminar circuloSolo de todas las filas
    const { circuloSolo, ...filaLimpia } = fila;

    const filaProcesada = { tipo, fila: index + 1 };
    let tieneDatos = false;

    for (const clave in filaLimpia) {
      const valor = filaLimpia[clave];
      if (valor !== '' && valor !== null && !isNaN(valor)) {
        filaProcesada[clave] = Number(valor);
        tieneDatos = true;
      }
    }

    return tieneDatos ? filaProcesada : null;
  }).filter(Boolean);
}

// ================= FUNCIÓN PRINCIPAL =================
export async function guardarDatos() {
  if (!hayHorariosDisponibles.value || !horarioSeleccionado.value) {
    return { 
      success: false, 
      message: "No hay horarios disponibles para enviar apuestas",
      code: "NO_HORARIOS"
    };
  }

  const { hora24, timestamp } = obtenerHoraCuba();
  try {
    const bancoId = authStore.bancoId;
    if (!bancoId) throw new Error("No se pudo determinar el banco padre");

    const uuid = modoEdicion.value && idEdicion.value ? idEdicion.value : generarUUID();

    // Procesamiento de datos
    const filasCombinadas = [...filasFijas.value, ...filasExtra.value];
    const filasExpandidas = expandirApuestasPorLinea(filasCombinadas);

    let totalGlobal = 0;
    for (const fila of filasExpandidas) {
      if (fila.circulo1) totalGlobal += Number(fila.circulo1);
      if (fila.circulo2) totalGlobal += Number(fila.circulo2);
    }

    const circuloSolo = filasFijas.value[2]?.circuloSolo;
    const circuloSoloValido = circuloSolo !== '' && circuloSolo !== null && !isNaN(circuloSolo);
    if (circuloSoloValido) totalGlobal += Number(circuloSolo);

    const datosAGuardar = procesarFilas(filasExpandidas, 'fija');

    if (datosAGuardar.length === 0 && !circuloSoloValido && totalGlobal === 0) {
      return { 
        success: false, 
        message: 'No hay datos válidos para guardar'
      };
    }

    // Preparar documento para guardar
    const docAGuardar = {
      id: uuid,
      nombre: nombreTemporal.value.trim() !== '' ? nombreTemporal.value : uuid.slice(0, 6),
      totalGlobal,
      datos: datosAGuardar,
      id_listero: auth.currentUser?.uid || 'sin-autenticar',
      tipo: circuloSoloValido && tipoOrigen.value === "tiros" ? `${tipoOrigen.value}/candado` : tipoOrigen.value,
      horario: horarioSeleccionado.value,
      uuid: uuid,
      horaCuba24: hora24,
      timestampLocal: timestamp,
      bancoId,
      estado: 'Cargado',
      fueraDeTiempo: false,
      creadoEn: serverTimestamp(),
      actualizadoEn: serverTimestamp()
    };

    if (circuloSoloValido) {
      docAGuardar.circuloSolo = Number(circuloSolo);
    }

    // Manejo offline
    if (!navigator.onLine) {
      docAGuardar.creadoEn = new Date().toISOString();
      docAGuardar.actualizadoEn = new Date().toISOString();
      
      if (modoEdicion.value) {
        docAGuardar.estado = 'EditadoOffline';
        const mutaciones = JSON.parse(localStorage.getItem('mutacionesPendientes') || '[]');
        
        const mutacionesFiltradas = mutaciones.filter(m => m.uuid !== uuid);
        
        mutacionesFiltradas.push({
          tipo: 'EDICION',
          uuid: uuid,
          nuevosDatos: docAGuardar,
          timestamp: Date.now()
        });

        localStorage.setItem('mutacionesPendientes', JSON.stringify(mutacionesFiltradas));
        
        const cacheStr = localStorage.getItem('apuestasFirebaseCache') || '{"data":[]}';
        const cache = JSON.parse(cacheStr);
        cache.data = cache.data.map(item => item.uuid === uuid ? docAGuardar : item);
        localStorage.setItem('apuestasFirebaseCache', JSON.stringify(cache));
      } 
      else {
        docAGuardar.estado = 'Pendiente';
        guardarEnLocal(docAGuardar, false);
      }

      return { 
        success: true, 
        offline: true,
        uuid,
        message: modoEdicion.value ?
          'Cambios guardados localmente. Se sincronizarán automáticamente cuando vuelvas a estar online' :
          'Apuesta guardada localmente. Se subirá a Firebase cuando vuelvas a estar online'
      };
    }

    // Manejo online
    const docPath = `bancos/${bancoId}/apuestas/${uuid}`;
    
    if (modoEdicion.value) {
      const { creadoEn, ...updateData } = docAGuardar;
      await updateDoc(doc(db, docPath), updateData);
      
      return { 
        success: true, 
        message: `Apuesta actualizada correctamente a las ${hora24}`,
        docId: uuid
      };
    } 
    else {
      const docRef = doc(db, docPath);
      await setDoc(docRef, docAGuardar);

      return { 
        success: true, 
        message: `Apuesta guardada correctamente a las ${hora24}`,
        docId: uuid
      };
    }
  } catch (error) {
    console.error('Error al guardar:', error);
    return { 
      success: false, 
      message: `Error: ${error.message}`,
      error: error.message
    };
  }
}

// ================= SINCRONIZACIÓN =================
export async function sincronizarPendientes() {
  if (!navigator.onLine || syncPending) return;
  
  syncPending = true;
  console.log('[SYNC] Iniciando sincronización de pendientes...');
  
  try {
    const pendientesStr = localStorage.getItem('apuestasPendientes') || '[]';
    const pendientes = JSON.parse(pendientesStr);
    const pendientesArray = Array.isArray(pendientes) ? pendientes : [];
    const pendientesExitosos = [];

    for (const apuesta of pendientesArray) {
      try {
        const bancoId = apuesta.bancoId || authStore.bancoId;
        if (!bancoId) continue;

        const docRef = doc(db, `bancos/${bancoId}/apuestas`, apuesta.uuid);
        const snap = await getDoc(docRef);
        
        if (snap.exists()) continue;

        await setDoc(docRef, {
          ...apuesta,
          creadoEn: serverTimestamp(),
          sincronizadoEn: serverTimestamp(),
          estado: 'Cargado'
        });

        pendientesExitosos.push(apuesta.uuid);
      } catch (error) {
        console.error(`[SYNC] Error en apuesta ${apuesta.uuid}:`, error);
      }
    }
    
    if (pendientesExitosos.length > 0) {
      const nuevosPendientes = pendientesArray.filter(p => !pendientesExitosos.includes(p.uuid));
      localStorage.setItem('apuestasPendientes', JSON.stringify(nuevosPendientes));
      window.dispatchEvent(new Event('apuestas-locales-actualizadas'));
    }
  } catch (error) {
    console.error('[SYNC] Error general:', error);
  } finally {
    syncPending = false;
  }
}

export async function sincronizarMutaciones() {
  if (!navigator.onLine || syncPending) return;
  
  syncPending = true;
  console.log('[SYNC] Iniciando sincronización de mutaciones...');
  
  try {
    const bancoId = authStore.bancoId
    if (!bancoId) {
      console.error('[SYNC] No se pudo obtener bancoId');
      return;
    }

    const mutaciones = JSON.parse(localStorage.getItem('mutacionesPendientes') || '[]');
    const mutacionesExitosas = [];

    for (const mutacion of mutaciones) {
      try {
        if (mutacion.tipo === 'EDICION') {
          const docRef = doc(db, `bancos/${bancoId}/apuestas`, mutacion.uuid);
          const docSnap = await getDoc(docRef);
          
          if (!docSnap.exists()) {
            console.log(`[SYNC] Documento ${mutacion.uuid} no existe, se omite`);
            continue;
          }

          const { id, creadoEn, ...datosActualizados } = mutacion.nuevosDatos;
          
          await updateDoc(docRef, {
            ...datosActualizados,
            estado: 'Cargado',
            fueraDeTiempo: false,
            actualizadoEn: serverTimestamp(),
            sincronizadoEn: serverTimestamp()
          });
        } 
        else if (mutacion.tipo === 'ELIMINACION') {
          const docRef = doc(db, `bancos/${bancoId}/apuestas`, mutacion.idOriginal);
          const docSnap = await getDoc(docRef);
          
          if (!docSnap.exists()) {
            console.log(`[SYNC] Documento a eliminar ${mutacion.idOriginal} no existe, se omite`);
            continue;
          }

          await deleteDoc(docRef);
          console.log(`[SYNC] Apuesta ${mutacion.idOriginal} eliminada`);
        }
        
        mutacionesExitosas.push(mutacion.timestamp);
      } catch (error) {
        console.error(`[SYNC] Error en mutación ${mutacion.timestamp}:`, error);
      }
    }

    if (mutacionesExitosas.length > 0) {
      const nuevasMutaciones = mutaciones.filter(m => 
        !mutacionesExitosas.includes(m.timestamp)
      );
      localStorage.setItem('mutacionesPendientes', JSON.stringify(nuevasMutaciones));
    }

    console.log(`[SYNC] ${mutacionesExitosas.length} mutaciones sincronizadas`);
  } catch (error) {
    console.error('[SYNC] Error general:', error);
  } finally {
    syncPending = false;
    window.dispatchEvent(new Event('apuestas-sincronizadas'));
  }
}

// ================= EVENT LISTENERS PARA SINCRONIZACIÓN =================
if (typeof window !== 'undefined') {
  window.addEventListener('online', async () => {
    console.log('[SYNC] Conexión restablecida, iniciando sincronización...');
    setTimeout(async () => {
      try {
        await Promise.all([sincronizarPendientes(), sincronizarMutaciones()]);
        console.log('[SYNC] Sincronización completa');
      } catch (error) {
        console.error('[SYNC] Error en sincronización automática:', error);
      }
    }, 3000);
  });

  if (navigator.onLine) {
    setTimeout(() => {
      if (!syncPending) {
        Promise.all([sincronizarPendientes(), sincronizarMutaciones()])
          .catch(err => console.error('Error en sincronización inicial:', err));
      }
    }, 2000);
  }
}