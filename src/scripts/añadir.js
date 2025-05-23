// src/scripts/añadir.js
import { db, auth } from '../firebase/config';
import { serverTimestamp, updateDoc, doc, setDoc, getDoc, deleteDoc } from 'firebase/firestore';
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
function guardarEnLocal(docAGuardar, esEdicion = false) {
  try {
    const pendientes = JSON.parse(localStorage.getItem('apuestasPendientes') || '[]');
    
    if (esEdicion) {
      // Modo edición: Reemplazar el registro existente
      const index = pendientes.findIndex(p => p.uuid === docAGuardar.uuid);
      if (index !== -1) {
        pendientes[index] = docAGuardar;
      } else {
        pendientes.push(docAGuardar);
      }
    } else {
      // Modo creación: Añadir nuevo registro
      const existe = pendientes.some(p => p.uuid === docAGuardar.uuid);
      if (!existe) {
        pendientes.push(docAGuardar);
      }
    }
    
    localStorage.setItem('apuestasPendientes', JSON.stringify(pendientes));
    // 🔽 Notifica a los listeners que cambió el localStorage
    window.dispatchEvent(new Event('apuestas-locales-actualizadas'));
    return true;
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
  
  // Determinar el ID correcto para Firebase y el UUID para identificación única
  let firebaseId = modoEdicion.value && idEdicion.value ? idEdicion.value : generarUUID();
  let uuid = firebaseId;

  // Si estamos editando online, obtener el UUID original del documento
  if (modoEdicion.value && navigator.onLine) {
    try {
      const docRef = doc(db, 'apuestas', firebaseId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists() && docSnap.data().uuid) {
        uuid = docSnap.data().uuid;
      }
    } catch (error) {
      console.error('Error obteniendo UUID original:', error);
    }
  }

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
      uuid, // Usamos el mismo UUID para mantener consistencia
      horaCuba24: hora24,
      candadoAbierto: true,
      timestampLocal: timestamp
    };

    // 6. Agregar circuloSolo si es válido
    if (circuloSoloValido) {
      docAGuardar.circuloSolo = Number(circuloSolo);
    }

    // 6.1 Guardar según conexión
    if (!navigator.onLine) {
      docAGuardar.creadoEn = new Date().toISOString();
      docAGuardar.estado = 'Pendiente';
      
      const guardado = guardarEnLocal(docAGuardar, modoEdicion.value);
      
            // Calcular el totalGlobal sumando todas las apuestas pendientes (incluyendo la recién guardada)
      let pendientes = [];
      try {
        pendientes = JSON.parse(localStorage.getItem('apuestasPendientes') || '[]');
      } catch (e) {
        pendientes = [];
      }
      const totalGlobalPendientes = pendientes.reduce((sum, a) => sum + (Number(a.totalGlobal) || 0), 0);

      return { 
        success: guardado, 
        offline: true,
        uuid,
        firebaseId,
        hora: hora24,
        esEdicion: modoEdicion.value,
        totalGlobalPendientes,
      };
    }

    // 7. Lógica diferente para edición vs creación
    if (modoEdicion.value && idEdicion.value) {
      await updateDoc(doc(db, 'apuestas', firebaseId), docAGuardar);
      
      return { 
        success: true, 
        message: `Datos actualizados a las ${hora24}`,
        horaExacta: hora24,
        docId: firebaseId,
        uuid
      };
    } 
    else {
      const docRef = doc(db, 'apuestas', firebaseId);
      docAGuardar.creadoEn = serverTimestamp();
      await setDoc(docRef, docAGuardar);

      return { 
        success: true, 
        uuid,
        firebaseId,
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
    
    const serverTime = await obtenerHoraServidor();

    for (const apuesta of pendientes) {
      try {
        const docRef = doc(db, 'apuestas', apuesta.uuid);
        const snap = await getDoc(docRef);
        
        if (!snap.exists()) {
          console.log(`[SYNC] Subiendo apuesta ${apuesta.uuid}`);
          
          // Verificar si está fuera de tiempo
          const fueraDeTiempo = await verificarFueraDeTiempo(apuesta.horario, apuesta, serverTime);

          await setDoc(docRef, {
            ...apuesta,
            creadoEn: apuesta.creadoEn ? new Date(apuesta.creadoEn) : serverTimestamp(),
            sincronizadoEn: serverTimestamp(),
            estado: fueraDeTiempo ? 'FueraDeTiempo' : 'Cargado',
            candadoAbierto: !fueraDeTiempo
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
      localStorage.setItem('apuestasPendientes', JSON.stringify(nuevosPendientes))
      window.dispatchEvent(new Event('apuestas-locales-actualizadas'))
      console.log(`[SYNC] ${pendientesExitosos.length} apuestas sincronizadas`);
    }
  } catch (error) {
    console.error('[SYNC] Error general:', error);
  } finally {
    syncPending = false;
    // Notifica a DailyPlay que debe recalcular el total local
    window.dispatchEvent(new Event('apuestas-sincronizadas'));
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

// Función para obtener hora del servidor (agregar con las demás funciones)
async function obtenerHoraServidor() {
  const tempDocRef = doc(db, "temp", "serverTimeCheck");
  await setDoc(tempDocRef, { timestamp: serverTimestamp() });
  const docSnap = await getDoc(tempDocRef);
  await deleteDoc(tempDocRef);

  const rawTimestamp = docSnap.data().timestamp;
  const date = rawTimestamp.toDate();

  // Aumentar 1 hora (3600000 ms = 1 hora)
  const fechaAjustada = new Date(date.getTime() + 3600000);

  console.log('Hora original:', date);
  console.log('Hora ajustada +1h:', fechaAjustada);

  return {
    toDate: () => fechaAjustada,
    toMillis: () => fechaAjustada.getTime()
  };
}


// Función para verificar si está fuera de tiempo (agregar con las demás funciones)
async function verificarFueraDeTiempo(horario, apuestaData, serverTime) {
  try {
    // 1. Obtener hora del servidor    
    // 2. Obtener configuración del horario
    const horarioRef = doc(db, 'hora', horario.toLowerCase());
    const horarioSnap = await getDoc(horarioRef);
    
    if (!horarioSnap.exists()) return false;
    
    const config = horarioSnap.data();
    
    // 3. Crear fecha límite para comparación
    const horaCierre = new Date(serverTime.toDate());
    horaCierre.setHours(
      parseInt(config.hh) || 0,
      parseInt(config.mm) || 0,
      parseInt(config.ss) || 0,
      0
    );
    
    // 4. Comparación principal: hora del servidor vs hora de cierre
    const horarioYaPaso = serverTime.toMillis() > horaCierre.getTime();
    
        // Si el horario no ha pasado, no está fuera de tiempo
    if (!horarioYaPaso) return false;
    
    // 5. Nueva lógica: Verificar fechas de creación y sincronización
    if (apuestaData) {
      const creadoEnBase = apuestaData.creadoEn?.toDate?.() || new Date(apuestaData.creadoEn);
      const creadoEn = new Date(creadoEnBase.getTime() + 3600000); // Sumar 1 hora (3600000 ms)
      const creadoAntesDeCierre = creadoEn.getTime() < horaCierre.getTime();
      console.error('creado en:', creadoEn);
      return creadoAntesDeCierre;
    }
    
    return false;
  } catch (error) {
    console.error('Error verificando horario:', error);
    return false; // En caso de error, no marcar como fuera de tiempo
  }
}