import { ref } from 'vue';
import { db, auth } from '../firebase/config';
import { serverTimestamp, updateDoc, doc, setDoc, getDoc, deleteDoc } from 'firebase/firestore';
import { filasFijas, filasExtra, expandirApuestasPorLinea } from './operaciones';
import { obtenerHoraCuba } from './horacuba.js';
import { useAuthStore } from '@/stores/authStore'
import localforage from '@/stores/localStorage';
import GananciasService from '../firebase/gananciasService.js';

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

async function guardarEnLocal(docAGuardar, esEdicion = false) {
    try {
        // Obtener la fecha actual en formato YYYY-MM-DD
        const hoy = new Date().toISOString().split('T')[0];
        
        // Obtener todas las apuestas locales organizadas por fecha
        const apuestasPorFecha = await localforage.getItem('apuestasPorFecha') || {};
        
        // Inicializar el array para la fecha si no existe
        if (!apuestasPorFecha[hoy]) {
            apuestasPorFecha[hoy] = [];
        }
        
        if (esEdicion) {
            // Buscar y actualizar la apuesta existente
            const index = apuestasPorFecha[hoy].findIndex(p => p.uuid === docAGuardar.uuid);
            if (index !== -1) {
                apuestasPorFecha[hoy][index] = docAGuardar;
            } else {
                apuestasPorFecha[hoy].push(docAGuardar);
            }
        } else {
            // Añadir nueva apuesta
            const existe = apuestasPorFecha[hoy].some(p => p.uuid === docAGuardar.uuid);
            if (!existe) {
                apuestasPorFecha[hoy].push(docAGuardar);
            }
        }
        
        await localforage.setItem('apuestasPorFecha', apuestasPorFecha);
        window.dispatchEvent(new Event('apuestas-locales-actualizadas'));
        return true;
    } catch (error) {
        console.error('[LocalForage] Error guardando apuesta local:', error);
        return false;
    }
}
// ================= PROCESAMIENTO DE DATOS =================
function procesarFilas(filas, tipo) {
  return filas.map((fila, index) => {
    const { circuloSolo, ...filaSinCirculo } = fila;

    const filaProcesada = { tipo, fila: index + 1 };
    let tieneDatos = false;

    // Procesar solo los campos que no son circuloSolo
    for (const clave in filaSinCirculo) {
      const valor = filaSinCirculo[clave];
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

  const { timestamp } = obtenerHoraCuba();
  try {
    const bancoId = authStore.bancoId;
    if (!bancoId) throw new Error("No se pudo determinar el banco padre");

    const uuid = modoEdicion.value && idEdicion.value
      ? idEdicion.value
      : (uuidGenerado.value || tomarUUID());


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
      circuloSolo: circuloSoloValido ? Number(circuloSolo) : null,
      id_usuario: auth.currentUser?.uid || 'sin-autenticar',
      tipo: circuloSoloValido && tipoOrigen.value === "tiros" ? `${tipoOrigen.value}/candado` : tipoOrigen.value,
      horario: horarioSeleccionado.value,
      uuid: uuid,
      timestampLocal: timestamp,
      fecha: new Date().toISOString().slice(0, 10),
      bancoId,
      fueraDeTiempo: false, // Asumimos que no está fuera de tiempo al guardar
      estado: 'Pendiente', // Siempre marcamos como pendiente para el día actual
      creadoEn: new Date().toISOString(), // Usamos fecha local
    };
    // Guardar siempre en local primero
    const guardadoLocal = await guardarEnLocal(docAGuardar, modoEdicion.value);
    
    if (!guardadoLocal) {
        return { 
            success: false, 
            message: "Error al guardar localmente"
        };
    }
    if (circuloSoloValido) {
      docAGuardar.circuloSolo = Number(circuloSolo);
    }

    // Manejo offline
    if (navigator.onLine) {
        try {
            const docPath = `bancos/${bancoId}/apuestas/${uuid}`;
            const docParaFirebase = {
                ...docAGuardar,
                estado: 'Cargado',
                sincronizadoEn: serverTimestamp()
            };
            if (modoEdicion.value) {
              await updateDoc(doc(db, docPath), {
                ...docParaFirebase,
                creadoEn: new Date().toISOString(),
                sincronizadoEn: serverTimestamp()
              });
            } else {
                await setDoc(doc(db, docPath), docParaFirebase);
            }
            
            // Registrar ganancia solo para apuestas nuevas (no en edición) y cuando está online
            if (!modoEdicion.value) {
              try {
                await GananciasService.procesarGananciaDesdeApuesta(
                  uuid,
                  bancoId,
                  auth.currentUser?.uid,
                  0.85 // 85% de ganancia
                );
              } catch (error) {
                console.error('Error registrando ganancia:', error);
                // No fallamos el proceso completo por un error en ganancias
              }
            }
            
            // Actualizar estado en local
            const hoy = new Date().toISOString().split('T')[0];
            const apuestasPorFecha = await localforage.getItem('apuestasPorFecha') || {};
            
            if (apuestasPorFecha[hoy]) {
                // Buscar y actualizar la apuesta local
                const index = apuestasPorFecha[hoy].findIndex(a => a.uuid === uuid);
                if (index !== -1) {
                    apuestasPorFecha[hoy][index] = {
                        ...apuestasPorFecha[hoy][index],
                        estado: 'Cargado',
                    };
                    await localforage.setItem('apuestasPorFecha', apuestasPorFecha);
                }
            }
            return { 
                success: true, 
                message: `Apuesta ${modoEdicion.value ? 'actualizada' : 'guardada'} correctamente`,
                docId: uuid,
                totalGlobal // Añadimos totalGlobal al resultado para usarlo en Pagar.vue
            };
        } 
        catch (error) {
            console.error('Error al sincronizar con Firebase:', error);
            return { 
                success: true, // Aún consideramos éxito porque se guardó localmente
                message: 'Apuesta guardada localmente. Error al sincronizar con Firebase',
                offline: true,
                uuid
            };
        }
    }
    else if (modoEdicion.value) {
      // Si es edición y estamos offline, registrar la mutación de edición
      await registrarEdicionOffline(
          { ...docAGuardar, uuid: idEdicion.value }, // apuestaOriginal
          docAGuardar // nuevosDatos
      );
    }

    return { 
      success: true, 
      offline: !navigator.onLine,
      uuid,
      message: navigator.onLine
        ? `Apuesta ${modoEdicion.value ? 'actualizada' : 'guardada'} correctamente`
        : 'Apuesta guardada localmente. Se sincronizará automáticamente cuando vuelvas a estar online'
    };
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
    
    try {
        const apuestasPorFecha = await localforage.getItem('apuestasPorFecha') || {};
        const hoy = new Date().toISOString().split('T')[0];
        const pendientes = apuestasPorFecha[hoy] || [];
        const pendientesExitosos = [];

        for (const apuesta of pendientes) {
            try {
                const bancoId = apuesta.bancoId || authStore.bancoId;
                if (!bancoId) {
                    continue;
                }

                const docRef = doc(db, `bancos/${bancoId}/apuestas`, apuesta.uuid);
                const snap = await getDoc(docRef);
                
                if (snap.exists()) {
                    
                    // Actualizar estado local pero mantener la apuesta visible
                    const index = pendientes.findIndex(p => p.uuid === apuesta.uuid);
                    if (index !== -1) {
                        pendientes[index].estado = 'Cargado';
                        pendientesExitosos.push(apuesta.uuid);
                    }
                    continue;
                }

                await setDoc(docRef, {
                    ...apuesta,
                    estado: 'Cargado',
                    sincronizadoEn: serverTimestamp()
                });

                // Registrar ganancia para apuestas pendientes que se sincronizan
                try {
                  await GananciasService.procesarGananciaDesdeApuesta(
                    apuesta.uuid,
                    bancoId,
                    apuesta.id_usuario,
                    0.85
                  );
                } catch (error) {
                  console.error('Error registrando ganancia para apuesta pendiente:', error);
                }

                // Actualizar estado local pero mantener la apuesta
                const index = pendientes.findIndex(p => p.uuid === apuesta.uuid);
                if (index !== -1) {
                    pendientes[index].estado = 'Cargado';
                }
                
                pendientesExitosos.push(apuesta.uuid);
            } catch (error) {
                console.error(`[SYNC] Error en apuesta ${apuesta.uuid}:`, error);
            }
        }
        
        // Guardar los cambios en las apuestas locales (estados actualizados)
        apuestasPorFecha[hoy] = pendientes;
        await localforage.setItem('apuestasPorFecha', apuestasPorFecha);
        window.dispatchEvent(new Event('apuestas-locales-actualizadas'));
    } catch (error) {
        console.error('[SYNC] Error general:', error);
    } finally {
        syncPending = false;
    }
}

// Variable global mejorada para control de concurrencia
let syncInProgress = {
  mutaciones: false,
  eliminaciones: false,
  pendientes: false
};// Variable global para control de concurrencia

export async function sincronizarMutaciones() {
  if (syncInProgress.mutaciones) {
    return { success: false, message: 'already-in-progress' };
  }
  
  syncInProgress.mutaciones = true;
  try {
    const bancoId = authStore.bancoId;
    if (!bancoId) throw new Error("No se pudo obtener bancoId");

    const mutaciones = await localforage.getItem('mutacionesPendientes') || [];

    const resultados = {
      exitosas: 0,
      fallidas: 0,
      errores: []
    };

    // Filtrar solo las mutaciones únicas
    const mutacionesUnicas = [];
    const idsProcesados = new Set();
    
    for (const mutacion of mutaciones) {
      if (!idsProcesados.has(mutacion.idOriginal)) {
        mutacionesUnicas.push(mutacion);
        idsProcesados.add(mutacion.idOriginal);
      }
    }

    // Procesar mutaciones en serie para evitar conflictos
    for (const mutacion of mutacionesUnicas) {
      try {
        const docRef = doc(db, `bancos/${bancoId}/apuestas`, mutacion.idOriginal);
        
        if (mutacion.tipo === 'EDICION') {
          await updateDoc(docRef, {
            ...mutacion.nuevosDatos,
            estado: 'Cargado',
            sincronizadoEn: serverTimestamp()
          });
          resultados.exitosas++;
        }
        else if (mutacion.tipo === 'ELIMINACION') {
          // Primero eliminar el registro de ganancia si existe
          if (mutacion.datosOriginales?.horario && mutacion.datosOriginales?.id_usuario) {
            try {
              await GananciasService.eliminarRegistroGanancia({
                apuestaId: mutacion.idOriginal,
                bancoId: bancoId,
                userId: mutacion.datosOriginales.id_usuario,
                horario: mutacion.datosOriginales.horario
              });
              console.log(`Registro de ganancia eliminado para apuesta ${mutacion.idOriginal}`);
            } catch (error) {
              console.error(`Error eliminando registro de ganancia para ${mutacion.idOriginal}:`, error);
              // Continuamos con la eliminación aunque falle la eliminación de ganancia
            }
          }
          
          // Luego eliminar la apuesta
          await deleteDoc(docRef);
          resultados.exitosas++;
        }
      } catch (error) {
        console.error(`[SYNC-MUT] Error procesando mutación ${mutacion.idOriginal}:`, error);
        resultados.fallidas++;
        resultados.errores.push({
          id: mutacion.idOriginal,
          error: error.message
        });
      }
    }

    // Actualizar mutaciones pendientes (remover las exitosas)
    const nuevasMutaciones = mutaciones.filter(m => 
      !mutacionesUnicas.slice(0, resultados.exitosas).some(u => u.idOriginal === m.idOriginal)
    );
    
    await localforage.setItem('mutacionesPendientes', nuevasMutaciones);
  
    return { 
      success: resultados.fallidas === 0,
      count: resultados.exitosas,
      errors: resultados.errores
    };
  } catch (error) {
    console.error('[SYNC-MUT] Error general:', error);
    return { success: false, error: error.message };
  } finally {
    syncInProgress.mutaciones = false;
  }
};

// Para registrar ediciones
export async function registrarEdicionOffline(apuestaOriginal, nuevosDatos) {
  try {
    const mutaciones = await localforage.getItem('mutacionesPendientes') || [];
    
    // Verificar si ya existe una mutación para esta apuesta
    const existeIndex = mutaciones.findIndex(m => 
      m.idOriginal === apuestaOriginal.uuid && m.tipo === 'EDICION'
    );

    const mutacion = {
      tipo: 'EDICION',
      idOriginal: apuestaOriginal.uuid,
      uuid: apuestaOriginal.uuid,
      timestamp: Date.now(),
      nuevosDatos: {
        ...nuevosDatos,
        estado: 'EditadoOffline',
      },
      bancoId: apuestaOriginal.bancoId || authStore.bancoId
    };

    if (existeIndex !== -1) {
      mutaciones[existeIndex] = mutacion;
    } else {
      mutaciones.push(mutacion);
    }

    await localforage.setItem('mutacionesPendientes', mutaciones);
    
    // Actualizar también en apuestasPorFecha para consistencia UI
    const hoy = new Date().toISOString().split('T')[0];
    const apuestasPorFecha = await localforage.getItem('apuestasPorFecha') || {};
    
    if (apuestasPorFecha[hoy]) {
      const index = apuestasPorFecha[hoy].findIndex(a => a.uuid === apuestaOriginal.uuid);
      if (index !== -1) {
        apuestasPorFecha[hoy][index] = {
          ...apuestasPorFecha[hoy][index],
          ...nuevosDatos,
          estado: 'EditadoOffline'
        };
        await localforage.setItem('apuestasPorFecha', apuestasPorFecha);
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error registrando edición offline:', error);
    return false;
  }
}

// Para registrar eliminaciones
export async function registrarEliminacionOffline(apuesta) {
  try {
    const mutaciones = await localforage.getItem('mutacionesPendientes') || [];
    
    mutaciones.push({
      tipo: 'ELIMINACION',
      idOriginal: apuesta.id || apuesta.uuid,
      uuid: apuesta.uuid,
      timestamp: Date.now(),
      bancoId: apuesta.bancoId || authStore.bancoId,
      datosOriginales: {
        nombre: apuesta.nombre,
        totalGlobal: apuesta.totalGlobal
      }
    });

    await localforage.setItem('mutacionesPendientes', mutaciones);
    return true;
  } catch (error) {
    console.error('Error registrando eliminación:', error);
    return false;
  }
}

// ================= EVENT LISTENERS PARA SINCRONIZACIÓN =================
if (typeof window !== 'undefined') {
  window.addEventListener('online', async () => {
    // Esperar 3 segundos para asegurar conexión estable
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Ejecutar en secuencia para evitar conflictos
    try {
      await sincronizarEliminaciones();
      await sincronizarMutaciones();
      await sincronizarPendientes();
      console.log('[SYNC] Sincronización completa');
    } catch (error) {
      console.error('[SYNC] Error en sincronización:', error);
    }
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