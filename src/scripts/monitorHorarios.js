// src/scripts/monitorHorarios.js
import { db } from '../firebase/config.js';
import { 
  doc, 
  getDoc, 
  collection, 
  query, 
  where, 
  getDocs, 
  updateDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const HORARIOS = ['dia', 'tarde', 'noche'];

console.log('[1] Módulo monitorHorarios cargado correctamente');

const capitalizarPrimeraLetra = (string) => {
  console.log('[2] Capitalizando string:', string);
  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
};

async function actualizarCandados(horario, userId) {
  console.log('[3] Iniciando actualizarCandados para:', horario, 'usuario:', userId);
  try {
    const apuestasRef = collection(db, 'apuestas');
    const horarioCapitalizado = capitalizarPrimeraLetra(horario);
    console.log('[4] Horario capitalizado:', horarioCapitalizado);
    
    console.log('[5] Construyendo query...');
    const q = query(
      apuestasRef,
      where('id_listero', '==', userId),
      where('horario', '==', horarioCapitalizado),
      where('candadoAbierto', '==', true)
    );

    console.log('[6] Ejecutando consulta...');
    const snapshot = await getDocs(q);
    console.log('[7] Documentos encontrados:', snapshot.size);

    const updates = snapshot.docs.map(docRef => {
      console.log('[8] Preparando actualización para doc:', docRef.id);
      return updateDoc(docRef.ref, { 
        candadoAbierto: false,
        ultimaActualizacion: serverTimestamp()
      });
    });

    console.log('[9] Ejecutando actualizaciones...');
    await Promise.all(updates);
    console.log('[10] Actualizaciones completadas. Total:', updates.length);
    
    return { success: true, updated: updates.length };
  } catch (error) {
    console.error('[ERROR en actualizarCandados]', error);
    return { success: false, error };
  }
}

export function iniciarMonitorHorarios() {
  console.log('[11] iniciarMonitorHorarios ejecutándose');
  const auth = getAuth();
  const usuarioActual = auth.currentUser;
  
  if (!usuarioActual) {
    console.warn('[12] No hay usuario autenticado. Monitor no iniciado.');
    return null;
  }

  console.log('[13] Usuario autenticado:', usuarioActual.uid);
  console.log('[14] Configurando intervalo de verificación...');

  const intervalId = setInterval(async () => {
    console.log('[15] --- Inicio de verificación ---');
    try {
      const ahora = new Date();
      // Usar hora local si la configuración es en hora local
      const hora = ahora.getHours(); // Cambiado de getUTCHours()
      const minuto = ahora.getMinutes();
      const segundo = ahora.getSeconds();

      console.log('[16] Hora actual (LOCAL):', `${hora}:${minuto}:${segundo}`);

      await Promise.all(HORARIOS.map(async (horario) => {
        console.log(`[17] Procesando horario: ${horario}`);
        const horarioRef = doc(db, 'hora', horario);
        
        console.log('[18] Obteniendo documento de horario...');
        const docSnap = await getDoc(horarioRef);
        
        if (!docSnap.exists()) {
          console.log('[19] Documento no existe:', horario);
          return;
        }

        const config = docSnap.data();
        console.log('[20] Configuración obtenida:', config);

        const hh = parseInt(config.hh) || 0;
        const mm = parseInt(config.mm) || 0;
        const ss = parseInt(config.ss) || 0;

        console.log(`[21] Hora configurada para ${horario}:`, `${hh}:${mm}:${ss}`);

        if (hora === hh && minuto === mm && segundo === ss) {
          console.log('[22] ¡Coincidencia de horario detectada!');
          const resultado = await actualizarCandados(horario, usuarioActual.uid);
          console.log('[23] Resultado de actualización:', resultado);
        } else {
          console.log('[24] No hay coincidencia de horario');
        }
      }));
    } catch (error) {
      console.error('[ERROR en intervalo]', error);
    }
    console.log('[25] --- Fin de verificación ---');
  }, 1000);

  return () => {
    console.log('[26] Limpiando intervalo...');
    clearInterval(intervalId);
  };
}