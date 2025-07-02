// src/scripts/añadir.js
import { db, auth } from '../firebase/config';
import { serverTimestamp, updateDoc, doc, setDoc, getDoc, deleteDoc, collection, getDocs } from 'firebase/firestore';
import { filasFijas, filasExtra, calcularTotales, expandirApuestasGeneralCombinadas } from './operaciones';
import { ref } from 'vue';
import { obtenerHoraCuba } from './horacuba.js';
import { obtenerBancoPadre } from './FunctionBancoPadre.js';

async function ejemploUso() {
  const bancoId = await obtenerBancoPadre();
  console.log("Banco padre:", bancoId);
}

// Variables reactivas
export const nombreTemporal = ref('SinNombre');
export const tipoOrigen = ref('tiros');
export const horarioSeleccionado = ref(null);
export const hayHorariosDisponibles = ref(true)
export const modoEdicion = ref(false);
export const idEdicion = ref('');

let syncPending = false;
let cachedBancoId = null; // Cache para el ID del banco

/**
Genera un UUID único para cada apuesta
 */
function generarUUID() {
  return window.crypto?.randomUUID?.() || 
         Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function guardarEnLocal(docAGuardar, esEdicion = false) {
  try {
    const pendientes = JSON.parse(localStorage.getItem('apuestasPendientes') || '[]');
    
    if (esEdicion) {
      const index = pendientes.findIndex(p => p.uuid === docAGuardar.uuid);
      if (index !== -1) {
        pendientes[index] = docAGuardar;
      } else {
        pendientes.push(docAGuardar);
      }
    } else {
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
  horarioSeleccionado.value = horario;
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
  if (!hayHorariosDisponibles.value || !horarioSeleccionado.value) {
    return { 
      success: false, 
      message: "No hay horarios disponibles para enviar apuestas",
      code: "NO_HORARIOS"
    }
  }
  const { hora24, timestamp } = obtenerHoraCuba(); 
  try {
    const bancoId = await obtenerBancoPadre();
    if (!bancoId) {
      throw new Error("No se pudo determinar el banco padre");
    }
    let firebaseId = modoEdicion.value && idEdicion.value ? idEdicion.value : generarUUID();
    let uuid = firebaseId;

    // Si estamos editando online, obtener el UUID original
    if (modoEdicion.value && navigator.onLine) {
      try {
        const docRef = doc(db, `bancos/${bancoId}/apuestas`, firebaseId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && docSnap.data().uuid) {
          uuid = docSnap.data().uuid;
        }
      } catch (error) {
        console.error('Error obteniendo UUID original:', error);
      }
    }


    const filasExpandidaCombinadas = expandirApuestasGeneralCombinadas();

    // Calcular el total sumando los valores de los círculos de cada apuesta expandida
    let totalGlobal = 0;
    for (const fila of filasExpandidaCombinadas) {
      if (fila.circulo1) totalGlobal += Number(fila.circulo1);
      if (fila.circulo2) totalGlobal += Number(fila.circulo2);
    }
    // Si hay circuloSolo válido, súmalo:
    const circuloSolo = filasFijas.value[2]?.circuloSolo;
    const circuloSoloValido = circuloSolo !== '' && circuloSolo !== null && !isNaN(circuloSolo);
    if (circuloSoloValido) totalGlobal += Number(circuloSolo);

    // 3. Procesar filas
    const datosAGuardar = procesarFilas(filasExpandidaCombinadas, 'fija');

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
      horaCuba24: hora24,
      timestampLocal: timestamp,
      bancoId // Aseguramos que siempre tenga valor
    };

    // 6. Agregar circuloSolo si es válido
    if (circuloSoloValido) {
      docAGuardar.circuloSolo = Number(circuloSolo);
    }

    // 6.1 Guardar según conexión
    if (!navigator.onLine) {
      docAGuardar.creadoEn = new Date().toISOString();
      docAGuardar.estado = 'Pendiente';
      docAGuardar.bancoId = bancoId; // Asegurar que tenemos el bancoId para sincronizar luego
      
      const guardado = guardarEnLocal(docAGuardar, modoEdicion.value);
      
      return { 
        success: guardado, 
        offline: true,
        uuid,
        firebaseId,
        hora: hora24,
        esEdicion: modoEdicion.value
      };
    }

    // 7. Lógica diferente para edición vs creación
    const docPath = `bancos/${bancoId}/apuestas/${firebaseId}`;
    
    if (modoEdicion.value && idEdicion.value) {
      await updateDoc(doc(db, docPath), docAGuardar);
      
      return { 
        success: true, 
        message: `Datos actualizados a las ${hora24}`,
        horaExacta: hora24,
        docId: firebaseId,
        uuid
      };
    } 
    else {
      const docRef = doc(db, docPath);
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
// En añadir.js, modificar la función sincronizarPendientes
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
        let bancoId = apuesta.bancoId;
        if (!bancoId) {
          bancoId = await obtenerBancoPadre();
          if (!bancoId) {
            console.warn(`[SYNC] No se pudo obtener bancoId para ${apuesta.uuid}, omitiendo`);
            continue;
          }
        }
        // Usar bancoId en todas las referencias
        const docRef = doc(db, `bancos/${bancoId}/apuestas`, apuesta.uuid);
        const snap = await getDoc(docRef);
        
        if (!snap.exists()) {
          console.log(`[SYNC] Subiendo apuesta ${apuesta.uuid} al banco ${apuesta.bancoId}`);
          
          // Obtener configuración del horario específico de esta apuesta
          const horarioRef = doc(db, `bancos/${bancoId}/hora`, apuesta.horario.toLowerCase());
          const horarioSnap = await getDoc(horarioRef);
          
          let fueraDeTiempo = false;
          
          if (horarioSnap.exists()) {
            const config = horarioSnap.data();
            const horaCierre = new Date(serverTime.toDate());
            horaCierre.setHours(
              parseInt(config.hh) || 0,
              parseInt(config.mm) || 0,
              parseInt(config.ss) || 0,
              0
            );
            
            // Verificar si el horario de esta apuesta ya pasó
            // fueraDeTiempo = serverTime.toMillis() > horaCierre.getTime();
            
            // Si el horario ya pasó, verificar si fue creada antes del cierre
            // if (fueraDeTiempo && apuesta.creadoEn) {
            //   const creadoEn = new Date(apuesta.creadoEn);
            //   fueraDeTiempo = creadoEn.getTime() < horaCierre.getTime();
            // }

            fueraDeTiempo = await verificarFueraDeTiempo(apuesta.horario, { ...apuesta, bancoId }, serverTime);
            
          }
          
          await setDoc(docRef, {
            ...apuesta,
            creadoEn: apuesta.creadoEn ? new Date(apuesta.creadoEn) : serverTimestamp(),
            sincronizadoEn: serverTimestamp(),
            estado: fueraDeTiempo ? 'FueraDeTiempo' : 'Cargado',
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

// ================= FUNCIONES AUXILIARES =================
async function obtenerHoraServidor() {
  const tempDocRef = doc(db, "temp", "serverTimeCheck");
  await setDoc(tempDocRef, { timestamp: serverTimestamp() });
  const docSnap = await getDoc(tempDocRef);
  await deleteDoc(tempDocRef);

  const rawTimestamp = docSnap.data().timestamp;
  const date = rawTimestamp.toDate();
  const fechaAjustada = new Date(date.getTime() + 3600000); // +1 hora

  return {
    toDate: () => fechaAjustada,
    toMillis: () => fechaAjustada.getTime()
  };
}

async function verificarFueraDeTiempo(horario, apuestaData, serverTime) {
  try {
    let bancoId = apuestaData?.bancoId;
    if (!bancoId) {
      bancoId = await obtenerBancoPadre();
    }
    if (!bancoId) return false;

    const horarioRef = doc(db, `bancos/${bancoId}/hora`, horario.toLowerCase());
    const horarioSnap = await getDoc(horarioRef);
    
    if (!horarioSnap.exists()) return false;
    
    const config = horarioSnap.data();
    const horaCierre = new Date(serverTime.toDate());
    horaCierre.setHours(
      parseInt(config.hh) || 0,
      parseInt(config.mm) || 0,
      parseInt(config.ss) || 0,
      0
    );
    
    const horarioYaPaso = serverTime.toMillis() > horaCierre.getTime();
    if (!horarioYaPaso) return false;
    
    if (apuestaData) {
      const creadoEnBase = apuestaData.creadoEn?.toDate?.() || new Date(apuestaData.creadoEn);
      const creadoEn = new Date(creadoEnBase.getTime() + 3600000);
      const creadoAntesDeCierre = creadoEn.getTime() < horaCierre.getTime();
      return creadoAntesDeCierre;
    }
    
    return false;
  } catch (error) {
    console.error('Error verificando horario:', error);
    return false;
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