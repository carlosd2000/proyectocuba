// src/scripts/añadir.js
import { db, auth } from '../firebase/config';
import { serverTimestamp, updateDoc, doc, setDoc, getDoc } from 'firebase/firestore';
import { filasFijas, filasExtra, calcularTotales } from './operaciones';
import { ref } from 'vue';
import { obtenerHoraCuba } from './horacuba.js';

// Variables reactivas
export const nombreTemporal = ref('SinNombre');
export const tipoOrigen = ref('tiros');
export const horarioSeleccionado = ref('Dia');
export const modoEdicion = ref(false);
export const idEdicion = ref('');

let syncPending = false;

/**
 * Genera un UUID único para cada apuesta
 */
function generarUUID() {
  return window.crypto?.randomUUID?.() || 
         Math.random().toString(36).slice(2) + Date.now().toString(36);
}

/**
 * Guarda apuestas pendientes en localStorage
 */
function guardarEnLocal(docAGuardar) {
  try {
    const pendientes = JSON.parse(localStorage.getItem('apuestasPendientes') || '[]');
    const existe = pendientes.some(p => p.uuid === docAGuardar.uuid);
    
    if (!existe) {
      pendientes.push(docAGuardar);
      localStorage.setItem('apuestasPendientes', JSON.stringify(pendientes));
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error guardando en localStorage:', error);
    return false;
  }
}

// ================= CONFIGURACIÓN =================
export function setNombre(nombre) {
  nombreTemporal.value = nombre?.trim() || 'SinNombre';
}

export function setTipoOrigen(tipo) {
  tipoOrigen.value = tipo || 'tiros';
}

export function setHorario(horario) {
  horarioSeleccionado.value = horario || 'Dia';
}

export function setModoEdicion(editar, id) {
  modoEdicion.value = editar;
  idEdicion.value = id || '';
}

// ================= PROCESAMIENTO DE DATOS =================
function procesarFilas(filas, tipo) {
  return filas.map((fila, index) => {
    if (index === 2 && tipo === 'fija') {
      const { circuloSolo, ...resto } = fila;
      fila = resto;
    }

    const filaProcesada = { tipo, fila: index + 1 };
    let tieneDatos = false;

    for (const clave in fila) {
      const valor = fila[clave];
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
  const { hora24, timestamp } = obtenerHoraCuba();
  const uuid = generarUUID();

  try {
    // 1. Calcular totales
    const { col3, col4, col5 } = calcularTotales(filasFijas, filasExtra);
    const totalGlobal = col3 + col4 + col5;

    // 2. Verificar círculo solo
    const circuloSolo = filasFijas.value[2]?.circuloSolo;
    const circuloSoloValido = circuloSolo !== '' && circuloSolo !== null && !isNaN(circuloSolo);

    // 3. Procesar filas
    const datosAGuardar = [
      ...procesarFilas(filasFijas.value, 'fija'),
      ...procesarFilas(filasExtra.value, 'extra')
    ];

    // 4. Validación
    if (datosAGuardar.length === 0 && !circuloSoloValido && totalGlobal === 0) {
      return { 
        success: false, 
        message: 'No hay datos válidos para guardar'
      };
    }

    // 5. Preparar documento final
    const docAGuardar = {
      nombre: nombreTemporal.value,
      totalGlobal,
      datos: datosAGuardar,
      id_listero: auth.currentUser?.uid || 'sin-autenticar',
      tipo: circuloSoloValido && tipoOrigen.value === "tiros" ? `${tipoOrigen.value}/candado` : tipoOrigen.value,
      horario: horarioSeleccionado.value,
      uuid,
      // Metadatos de hora
      horaCuba24: hora24,               // "17:25:43"
      candadoAbierto: true,         // "12/05/2025, 17:25:43"
      timestampLocal: timestamp         // 1744478743000
    };

    // 6. Agregar circuloSolo si es válido
    if (circuloSoloValido) {
      docAGuardar.circuloSolo = Number(circuloSolo);
    }

    // 6.1 Guardar según conexión
    if (!navigator.onLine) {
      docAGuardar.creadoEn = new Date().toISOString();
      docAGuardar.estado = 'Pendiente';
      const guardado = guardarEnLocal(docAGuardar);
      
      return { 
        success: guardado, 
        offline: true,
        uuid,
        
        hora: hora24
      };
    }

    // 7. Lógica diferente para edición vs creación
    if (modoEdicion.value && idEdicion.value) {
      await updateDoc(doc(db, 'apuestas', idEdicion.value), docAGuardar);
      
      return { 
        success: true, 
        message: `Datos actualizados a las ${hora24}`,
        horaExacta: hora24,
        docId: idEdicion.value
      };
    } 
    else {
      const docRef = doc(db, 'apuestas', uuid);
      docAGuardar.creadoEn = serverTimestamp();
      await setDoc(docRef, docAGuardar);

      return { 
        success: true, 
        uuid,
        message: `Datos guardados a las ${hora24}`,
        horaExacta: hora24,
        docId: docRef.id
      };
    }
  } catch (error) {
    console.error('Error al guardar:', error);

    const { hora24 } = obtenerHoraCuba();
    return { 
      success: false, 
      message: `Error a las ${hora24}: ${error.message}`,
      horaError: hora24
    };
  }
}

// ================= SINCRONIZACIÓN =================
export async function sincronizarPendientes() {
  if (!navigator.onLine || syncPending) return;
  
  syncPending = true;
  console.log('[SYNC] Iniciando sincronización de pendientes...');
  
  try {
    const pendientes = JSON.parse(localStorage.getItem('apuestasPendientes') || '[]');
    const pendientesExitosos = [];
    
    for (const apuesta of pendientes) {
      try {
        const docRef = doc(db, 'apuestas', apuesta.uuid);
        const snap = await getDoc(docRef);
        
        if (!snap.exists()) {
          console.log(`[SYNC] Subiendo apuesta ${apuesta.uuid}`);
          
          await setDoc(docRef, {
            ...apuesta,
            creadoEn: apuesta.creadoEn ? new Date(apuesta.creadoEn) : serverTimestamp(),
            sincronizadoEn: serverTimestamp(),
            estado: 'Cargado',
            candadoAbierto: true
          });
          pendientesExitosos.push(apuesta.uuid);
        }
      } catch (error) {
        console.error(`[SYNC] Error en apuesta ${apuesta.uuid}:`, error);
        break;
      }
    }
    
    if (pendientesExitosos.length > 0) {
      const nuevosPendientes = pendientes.filter(p => !pendientesExitosos.includes(p.uuid));
      localStorage.setItem('apuestasPendientes', JSON.stringify(nuevosPendientes));
      console.log(`[SYNC] ${pendientesExitosos.length} apuestas sincronizadas`);
    }
  } catch (error) {
    console.error('[SYNC] Error general:', error);
  } finally {
    syncPending = false;
  }
}

// ================= LISTENERS DE CONEXIÓN =================
if (typeof window !== 'undefined') {
  // Sincronizar inmediatamente si hay conexión
  if (navigator.onLine) {
    setTimeout(() => {
      if (!syncPending) {
        sincronizarPendientes();
      }
    }, 2000);
  }

  // Listener para cambios de conexión
  window.addEventListener('online', () => {
    if (!syncPending) {
      setTimeout(sincronizarPendientes, 1000);
    }
  });
}