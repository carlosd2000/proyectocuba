import { db, auth } from '../firebase/config.js';
import { 
  doc, 
  getDoc, 
  collection, 
  query, 
  where, 
  getDocs, 
  writeBatch,
  serverTimestamp,
} from 'firebase/firestore';

const HORARIOS = ['dia', 'tarde', 'noche'];
const HORARIOS_CAPITALIZADOS = ['Dia', 'Tarde', 'Noche'];

let cachedBancoId = null;
let monitorActivo = false;
let intervalId = null;
let horariosYaProcesados = new Set();

async function obtenerBancoPadre() {
  if (cachedBancoId) return cachedBancoId;

  try {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error("Usuario no autenticado");

    const bancosSnapshot = await getDocs(collection(db, 'bancos'));
    
    for (const bancoDoc of bancosSnapshot.docs) {
      const bancoId = bancoDoc.id;
      
      const listeroRef = doc(db, `bancos/${bancoId}/listeros/${userId}`);
      const listeroSnap = await getDoc(listeroRef);
      if (listeroSnap.exists()) {
        cachedBancoId = bancoId;
        return bancoId;
      }

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

function obtenerHoraCuba() {
  const ahora = new Date();
  const horaLocal = new Date(ahora.getTime() + (ahora.getTimezoneOffset() * 60000));
  const horaCuba = new Date(horaLocal.getTime() + (-4 * 3600000));
  return horaCuba;
}

function crearHoraCierre(config) {
  const hoy = obtenerHoraCuba();
  const horaCierre = new Date(hoy);
  horaCierre.setHours(
    parseInt(config.hh) || 0,
    parseInt(config.mm) || 0,
    parseInt(config.ss) || 0,
    0
  );
  return horaCierre;
}

function fueCreadaAntesDelCierre(apuestaData, horaCierre) {
  try {
    let fechaCreacion;
    
    if (apuestaData.sincronizadoEn) {
      fechaCreacion = apuestaData.sincronizadoEn.toDate();
    } else if (apuestaData.creadoEn && apuestaData.creadoEn.toDate) {
      fechaCreacion = apuestaData.creadoEn.toDate();
    } else if (apuestaData.creadoEn) {
      fechaCreacion = new Date(apuestaData.creadoEn);
    } else {
      console.warn('Apuesta sin fecha de creación, se considera antigua');
      return true;
    }
    
    return fechaCreacion <= horaCierre;
    
  } catch (error) {
    console.error('Error verificando fecha de creación:', error);
    return true;
  }
}

async function cerrarCandadosHorario(horario) {
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) {
      console.warn('[CANDADOS] Usuario no autenticado');
      return { success: false };
    }

    const bancoId = await obtenerBancoPadre();
    const horarioCapitalizado = horario.charAt(0).toUpperCase() + horario.slice(1);
    
    console.log(`[CANDADOS] Procesando horario: ${horarioCapitalizado}`);
    
    const horarioRef = doc(db, 'hora', horario);
    const horarioSnap = await getDoc(horarioRef);
    
    if (!horarioSnap.exists()) {
      console.log(`[CANDADOS] No existe configuración para ${horario}`);
      return { success: false };
    }
    
    const config = horarioSnap.data();
    const horaCierre = crearHoraCierre(config);
    
    console.log(`[CANDADOS] Hora de cierre para ${horarioCapitalizado}: ${horaCierre.toLocaleTimeString()}`);
    
    const apuestasRef = collection(db, `bancos/${bancoId}/apuestas`);
    const q = query(
      apuestasRef,
      where('horario', '==', horarioCapitalizado),
      where('candadoAbierto', '==', true)
    );
    
    const snapshot = await getDocs(q);
    console.log(`[CANDADOS] Encontradas ${snapshot.docs.length} apuestas abiertas para ${horarioCapitalizado}`);
    
    if (snapshot.empty) {
      return { success: true, updated: 0 };
    }
    
    const batch = writeBatch(db);
    let actualizadas = 0;
    
    for (const apuestaDoc of snapshot.docs) {
      const apuestaData = apuestaDoc.data();
      const esAntigua = fueCreadaAntesDelCierre(apuestaData, horaCierre);
      
      if (esAntigua) {
        console.log(`[CANDADOS] Cerrando candado para apuesta: ${apuestaDoc.id}`);
        batch.update(apuestaDoc.ref, {
          candadoAbierto: false,
          cerradoEn: serverTimestamp(),
          estado: 'Cerrado'
        });
        actualizadas++;
      }
    }
    
    if (actualizadas > 0) {
      await batch.commit();
      console.log(`[CANDADOS] ✅ Actualizados ${actualizadas} candados para ${horarioCapitalizado}`);
      
      // Notificar a la UI que los candados han sido actualizados
      window.dispatchEvent(new CustomEvent('candados-actualizados', {
        detail: {
          horario: horarioCapitalizado,
          actualizadas: actualizadas,
          timestamp: new Date().toISOString()
        }
      }));
    }
    
    return { success: true, updated: actualizadas };
    
  } catch (error) {
    console.error(`[ERROR] Cerrando candados para ${horario}:`, error);
    return { success: false, error };
  }
}

async function verificarYCerrarHorarios() {
  if (!navigator.onLine) {
    console.log('[CANDADOS] Sin conexión, saltando verificación');
    return;
  }

  try {
    const horaActual = obtenerHoraCuba();
    console.log(`[CANDADOS] Verificando horarios - Hora actual: ${horaActual.toLocaleTimeString()}`);

    for (const horario of HORARIOS) {
      try {
        const horarioRef = doc(db, 'hora', horario);
        const horarioSnap = await getDoc(horarioRef);
        
        if (!horarioSnap.exists()) {
          console.log(`[CANDADOS] No existe configuración para ${horario}`);
          continue;
        }
        
        const config = horarioSnap.data();
        const horaCierre = crearHoraCierre(config);
        
        const claveHorario = `${horario}-${horaActual.toDateString()}`;
        
        if (horaActual > horaCierre && !horariosYaProcesados.has(claveHorario)) {
          console.log(`[CANDADOS] ⏰ Horario ${horario} pasó (${horaCierre.toLocaleTimeString()}), cerrando candados...`);
          
          const resultado = await cerrarCandadosHorario(horario);
          
          if (resultado.success) {
            horariosYaProcesados.add(claveHorario);
            console.log(`[CANDADOS] ✅ Horario ${horario} procesado exitosamente`);
          }
        }
        
      } catch (error) {
        console.error(`[ERROR] Procesando horario ${horario}:`, error);
      }
    }
    
  } catch (error) {
    console.error('[ERROR] En verificación general de horarios:', error);
  }
}

function limpiarCacheHorarios() {
  const hoy = new Date().toDateString();
  const clavesActuales = Array.from(horariosYaProcesados).filter(clave => 
    clave.endsWith(hoy)
  );
  
  horariosYaProcesados.clear();
  clavesActuales.forEach(clave => horariosYaProcesados.add(clave));
  
  console.log('[CANDADOS] Cache de horarios limpiado');
}

export function iniciarMonitorHorarios() {
  if (monitorActivo) {
    console.log('[MONITOR] Ya está activo');
    return detenerMonitorHorarios;
  }
  
  const userId = auth.currentUser?.uid;
  if (!userId) {
    console.warn('[MONITOR] Usuario no autenticado');
    return null;
  }
  
  console.log(`[MONITOR] 🚀 Iniciando para usuario ${userId}`);
  monitorActivo = true;
  
  verificarYCerrarHorarios();
  
  intervalId = setInterval(() => {
    if (monitorActivo && navigator.onLine) {
      verificarYCerrarHorarios();
    }
  }, 30000);
  
  const cacheInterval = setInterval(limpiarCacheHorarios, 3600000);
  
  const handleOnline = () => {
    console.log('[MONITOR] 🔌 Conexión restablecida');
    setTimeout(verificarYCerrarHorarios, 1000);
  };
  
  const handleOffline = () => {
    console.log('[MONITOR] 📴 Sin conexión');
  };
  
  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);
  window.addEventListener('horario-cerrado', (event) => {
    const { turno } = event.detail;
    cerrarCandadosHorario(turno.toLowerCase());
});
  const detener = () => {
    console.log('[MONITOR] 🛑 Deteniendo...');
    monitorActivo = false;
    
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
    
    if (cacheInterval) {
      clearInterval(cacheInterval);
    }
    
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
    
    horariosYaProcesados.clear();
    console.log('[MONITOR] ✅ Detenido');
  };
  
  return detener;
}

export function detenerMonitorHorarios() {
  if (monitorActivo && intervalId) {
    clearInterval(intervalId);
    monitorActivo = false;
    intervalId = null;
    horariosYaProcesados.clear();
    console.log('[MONITOR] Detenido externamente');
  }
}

export async function forzarVerificacionHorarios() {
  console.log('[MONITOR] Forzando verificación...');
  await verificarYCerrarHorarios();
}