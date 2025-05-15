// src/scripts/añadir.js
import { db, auth } from '../firebase/config';
import { collection, addDoc, serverTimestamp, updateDoc, doc, setDoc, getDoc } from 'firebase/firestore';
import { filasFijas, filasExtra, calcularTotales } from './operaciones';
import { ref } from 'vue'

// Variables reactivas
let nombreTemporal = ref('SinNombre')
let tipoOrigen = ref('tiros')
let horarioSeleccionado = ref('Dia')
let syncPending = false;
export const modoEdicion = ref(false)
export const idEdicion = ref('')


/**
 * Genera un UUID único para cada apuesta
 */
function generarUUID() {
  return window.crypto?.randomUUID?.() || 
         Math.random().toString(36).slice(2) + Date.now().toString(36);
}

/**
 * Guarda apuestas pendientes en localStorage con verificación de duplicados
 */
function guardarEnLocal(docAGuardar) {
  try {
    const pendientes = JSON.parse(localStorage.getItem('apuestasPendientes') || '[]');
    
    // Verificar si ya existe en localStorage
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

export async function sincronizarPendientes() {
  if (!navigator.onLine || syncPending) return;
  
  console.log('[SYNC] Iniciando sincronización de pendientes...');
  syncPending = true;
  
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
        }
        pendientesExitosos.push(apuesta.uuid);
      } catch (error) {
        console.error(`[SYNC] Error en apuesta ${apuesta.uuid}:`, error);
        break;
      }
    }
    
    // Actualizar localStorage
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


// ================= CONFIGURACIÓN =================
export function setNombre(nombre) {
  nombreTemporal = nombre?.trim() || 'SinNombre';
}

export function setTipoOrigen(tipo) {
  tipoOrigen = tipo || 'tiros';
}

export function setHorario(horario) {
  horarioSeleccionado = horario || 'Dia';
}

export function setModoEdicion(editar, id) {
  modoEdicion.value = editar
  idEdicion.value = id || ''
}



// ================= MANEJO DE HORAS =================
function obtenerHoraCuba() {
  const ahora = new Date();
  const opciones24h = {
    timeZone: 'America/Havana',
    hour12: false,
    hour: '2-digit',
    minute: '2-digit'
  };
  
  const opciones12h = {
    timeZone: 'America/Havana',
    hour12: true,
    hour: 'numeric',
    minute: '2-digit'
  };

  return {
    hora24: ahora.toLocaleTimeString('es-ES', opciones24h),
    hora12: ahora.toLocaleTimeString('es-ES', opciones12h),
    timestamp: ahora.getTime()
  };
}

export function formatearHoraCuba(horaString) {
  if (!horaString) return "--:-- --";
  
  try {
    // Convierte "HH:MM:SS" a "H:MM a.m./p.m."
    const [horas, minutos] = horaString.split(':');
    const hora12 = horas % 12 || 12;
    const periodo = horas < 12 ? 'a.m.' : 'p.m.';
    return `${hora12}:${minutos} ${periodo}`;
  } catch (e) {
    console.error("Error formateando hora:", e);
    return "--:-- --";
  }
}

// ================= PROCESAMIENTO DE DATOS =================
function procesarFilas(filas, tipo) {
  return filas.map((fila, index) => {
    // Excluir circuloSolo específicamente de la fila 3
    if (index === 2 && tipo === 'fija') {
      const { circuloSolo, ...resto } = fila;
      fila = resto;
    }

    const filaProcesada = { tipo, fila: index + 1 };
    let tieneDatos = false;

    // Procesar solo valores numéricos válidos
    for (const clave in fila) {
      const valor = fila[clave];
      if (valor !== '' && valor !== null && !isNaN(valor)) {
        filaProcesada[clave] = Number(valor);
        tieneDatos = true;
      }
    }

    return tieneDatos ? filaProcesada : null;
  }).filter(Boolean); // Eliminar filas sin datos
}

// ================= FUNCIÓN PRINCIPAL =================
export async function guardarDatos() {
  const { hora24, hora12, fechaCompleta, timestamp } = obtenerHoraCuba();
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
        message: 'No hay datos válidos para guardar',
        
      };
    }

    // 5. Preparar documento final
    const docAGuardar = {
      nombre: nombreTemporal,
      totalGlobal,
      datos: datosAGuardar,
      creadoEn: serverTimestamp(),        // Timestamp Firebase (UTC)
      id_listero: auth.currentUser?.uid || 'sin-autenticar',
      tipo: circuloSoloValido && tipoOrigen === "tiros" ? `${tipoOrigen}/candado` : tipoOrigen,
      horario: horarioSeleccionado,
      uuid,
      // Metadatos de hora
      horaCuba24: hora24,               // "17:25:43"
      horaCuba12: hora12,               // "5:25 p.m."
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
      // Modo edición - actualizar documento existente
      await updateDoc(doc(db, 'apuestas', idEdicion.value), docAGuardar);
      
      return { 
        success: true, 
        message: `Datos actualizados a las ${hora24}`,
        horaExacta: hora24,
        docId: idEdicion.value
      };
    } else {
      // Modo creación - agregar nuevo documento
      docAGuardar.creadoEn = serverTimestamp();
      docAGuardar.estado = 'Cargado';
    
      const docRef = doc(db, 'apuestas', uuid);
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
// ================= INICIALIZACIÓN =================
// Configurar listener para sincronización automática
if (typeof window !== 'undefined') {
  // Sincronizar inmediatamente si hay conexión
  if (navigator.onLine) {
    setTimeout(() => {
      if (!syncPending) {
        sincronizarPendientes();
      }
    }, 2000); // Pequeño delay para asegurar que todo está cargado
  }

  // Listener para cambios de conexión
  window.addEventListener('online', () => {
    if (!syncPending) {
      setTimeout(sincronizarPendientes, 1000);
    }
  });
}