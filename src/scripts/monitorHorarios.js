import { db } from '../firebase/config.js';
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
import { getAuth } from 'firebase/auth';

const HORARIOS = ['dia', 'tarde', 'noche'];
const AJUSTE_HORARIO_CUBA = 1; // +1 hora para ajustar a Cuba (UTC-4)

// Estado para manejar conexión
const estadoConexion = {
  online: navigator.onLine,
  horariosPerdidos: [] // Horarios que pasaron mientras estaba offline
};

// Configurar listeners de conexión
function configurarListenersConexion(userId) {
  window.addEventListener('online', async () => {
    estadoConexion.online = true;
    console.log('[CONEXIÓN] Conexión restablecida');
    await procesarHorariosPerdidos(userId);
  });
  
  window.addEventListener('offline', () => {
    estadoConexion.online = false;
    console.log('[CONEXIÓN] Sin conexión');
  });
}

// Ajustar hora a zona horaria de Cuba
function ajustarHoraCuba(fecha) {
  const ajustada = new Date(fecha);
  ajustada.setHours(ajustada.getHours() + AJUSTE_HORARIO_CUBA);
  return ajustada;
}

// Capitalizar primera letra (Dia, Tarde, Noche)
function capitalizarHorario(horario) {
  return horario.charAt(0).toUpperCase() + horario.slice(1).toLowerCase();
}

// Función principal para cerrar candados
async function cerrarCandados(horario, userId) {
  try {
    const horarioCapitalizado = capitalizarHorario(horario);
    const batch = writeBatch(db);
    
        // Obtener configuración del horario primero
    const horarioRef = doc(db, 'hora', horario);
    const horarioSnap = await getDoc(horarioRef);
    
    if (!horarioSnap.exists()) {
      console.log(`[CANDADOS] Configuración no encontrada para ${horario}`);
      return { success: false };
    }
    
    const config = horarioSnap.data();
    const horaCierre = new Date();
    horaCierre.setHours(
      parseInt(config.hh) || 0,
      parseInt(config.mm) || 0,
      parseInt(config.ss) || 0,
      0
    );
    const horaCierreAjustada = horaCierre;

    // Obtener todas las apuestas abiertas para este horario
    const q = query(
      collection(db, 'apuestas'),
      where('id_listero', '==', userId),
      where('horario', '==', horarioCapitalizado),
      where('candadoAbierto', '==', true)
    );
    
    const snapshot = await getDocs(q);
    let actualizadas = 0;
    
    // Verificar cada apuesta individualmente
    for (const apuestaDoc of snapshot.docs) {
      const esAntigua = await fueCreadaAntesDelCierre(apuestaDoc, horaCierreAjustada);
      
      if (esAntigua) {
        batch.update(apuestaDoc.ref, {
          candadoAbierto: false,
          ultimaActualizacion: serverTimestamp()
        });
        actualizadas++;
      } else {
        console.log(`[CANDADOS] Apuesta ${apuestaDoc.id} creada después del cierre, manteniendo abierta`);
      }
    }
    
    if (actualizadas > 0) {
      await batch.commit();
      console.log(`[CANDADOS] Actualizados ${actualizadas} candados para ${horarioCapitalizado}`);
      return { success: true, updated: actualizadas };
    }
    
    return { success: true, updated: 0 };
    
  } catch (error) {
    console.error(`[ERROR] Cerrando candados para ${horario}:`, error);
    return { success: false, error };
  }
}

// Verificar si algún horario pasó durante la desconexión
async function verificarHorariosPerdidos(userId) {
  const ahora = ajustarHoraCuba(new Date());
  
  for (const horario of HORARIOS) {
    try {
      const docSnap = await getDoc(doc(db, 'hora', horario));
      if (!docSnap.exists()) continue;
      
      const config = docSnap.data();
      const horaCierre = new Date();
      horaCierre.setHours(
        parseInt(config.hh) || 0,
        parseInt(config.mm) || 0,
        parseInt(config.ss) || 0,
        0
      );
      
      // Si la hora actual es posterior a la hora de cierre
      if (ahora > horaCierre) {
        console.log(`[HORARIO PERDIDO] ${horario} pasó durante la desconexión`);
        await cerrarCandados(horario, userId);
      }
    } catch (error) {
      console.error(`[ERROR] Verificando horario ${horario}:`, error);
    }
  }
}

// Procesar horarios que pasaron offline al reconectarse
async function procesarHorariosPerdidos(userId) {
  if (!estadoConexion.online) return;
  
  console.log('[PROCESANDO] Verificando horarios perdidos...');
  await verificarHorariosPerdidos(userId);
}

// Monitor principal que se ejecuta cada segundo
export function iniciarMonitorHorarios() {
  const auth = getAuth();
  const usuarioActual = auth.currentUser;
  
  if (!usuarioActual) {
    console.warn('[MONITOR] Usuario no autenticado');
    return null;
  }
  
  const userId = usuarioActual.uid;
  console.log(`[MONITOR] Iniciando para usuario ${userId}`);
  
  // Configurar listeners de conexión
  configurarListenersConexion(userId);
  
  const intervalId = setInterval(async () => {
    if (!estadoConexion.online) return;
    
    try {
      const ahora = ajustarHoraCuba(new Date());
      const hh = ahora.getHours();
      const mm = ahora.getMinutes();
      const ss = ahora.getSeconds();
      
      for (const horario of HORARIOS) {
        const docSnap = await getDoc(doc(db, 'hora', horario));
        if (!docSnap.exists()) continue;
        
        const config = docSnap.data();
        if (hh === parseInt(config.hh) && 
            mm === parseInt(config.mm) && 
            ss === parseInt(config.ss)) {
          console.log(`[HORARIO] Coincide ${horario}`);
          await cerrarCandados(horario, userId);
        }
      }
    } catch (error) {
      console.error('[ERROR] En intervalo:', error);
    }
  }, 1000);
  
  return () => {
    clearInterval(intervalId);
    console.log('[MONITOR] Detenido');
  };
}

// Función para verificar si una apuesta fue creada antes del cierre
async function fueCreadaAntesDelCierre(apuestaDoc, horaCierre) {
  try {
    const apuestaData = apuestaDoc.data();
    let fechaCreacion;
    
    // Obtener la fecha de creación de la apuesta
    if (apuestaData.sincronizadoEn) {
      fechaCreacion = apuestaData.sincronizadoEn.toDate();
    } else if (apuestaData.creadoEn) {
      fechaCreacion = apuestaData.creadoEn.toDate();
    } else {
      // Si no hay fecha de creación, asumimos que es antigua
      return true;
    }
    
    // Comparar con la hora de cierre (ambas ajustadas a Cuba)
    const fechaCreacionAjustada = ajustarHoraCuba(fechaCreacion);
    return fechaCreacionAjustada <= horaCierre;
    
  } catch (error) {
    console.error('Error verificando fecha apuesta:', error);
    // En caso de error, asumimos que es antigua para ser conservadores
    return true;
  }
}
