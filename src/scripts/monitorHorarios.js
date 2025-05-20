import { db } from '../firebase/config.js';
import { 
  doc, 
  getDoc, 
  collection, 
  query, 
  where, 
  getDocs, 
  writeBatch,
  serverTimestamp
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
    
    // Obtener todas las apuestas abiertas para este horario
    const q = query(
      collection(db, 'apuestas'),
      where('id_listero', '==', userId),
      where('horario', '==', horarioCapitalizado),
      where('candadoAbierto', '==', true)
    );
    
    const snapshot = await getDocs(q);
    
    // Cerrar todas las apuestas encontradas
    snapshot.forEach(doc => {
      batch.update(doc.ref, {
        candadoAbierto: false,
        ultimaActualizacion: serverTimestamp()
      });
    });
    
    await batch.commit();
    console.log(`[CANDADOS] Cerrados ${snapshot.size} candados para ${horarioCapitalizado}`);
    
  } catch (error) {
    console.error(`[ERROR] Cerrando candados para ${horario}:`, error);
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
      const horaCierreAjustada = ajustarHoraCuba(horaCierre);
      
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