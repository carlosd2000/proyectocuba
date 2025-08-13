import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { sincronizarEliminaciones  } from '../scripts/crudListas.js'
import { apuestas, obtenerApuestas } from '../scripts/obtenerApuestas.js'
import { sincronizarPendientes, sincronizarMutaciones } from '../scripts/añadir.js'
import Swal from 'sweetalert2'
import Cloud from '../assets/icons/Cloud.svg'
import CloudFill from '../assets/icons/Cloud_fill.svg'
import StropWatch from '../assets/icons/stopwatch.svg'
import localforage from 'localforage';
import GananciasService from '../firebase/gananciasService.js'
export default function useLista(fechaRef, router, route) {
    const mostrarModal = ref(false)
    const mostrarConfirmacionEliminar = ref(false)
    const personaSeleccionada = ref(null)
    const isOnline = ref(navigator.onLine)
    const isSyncing = ref(false)
    const apuestasLocales = ref([])
    let unsubscribe = null
    let syncInProgress = false 

    const idListero = route.params.id
    const CACHE_DURATION_HOURS = 12

    const esMismoDia = (fechaA, fechaB) => {
        try {
            const a = new Date(fechaA)
            const b = new Date(fechaB)
            return a.getFullYear() === b.getFullYear() &&
                a.getMonth() === b.getMonth() &&
                a.getDate() === b.getDate()
        } catch (e) {
            console.error('Error al comparar fechas:', e)
            return false
        }
    }

    const obtenerIconoEstado = (persona) => {
        if (!persona || !persona.estado) return Cloud
        switch (persona.estado) {
            case 'Pendiente': return CloudFill
            case 'Cargado': return Cloud;
            case 'FueraDeTiempo': return StropWatch
            case 'EditadoOffline': return CloudFill
            default: return Cloud
        }
    }

    const guardarApuestasEnCache = (apuestasFirebase) => {
        try {
            const apuestasHoy = apuestasFirebase.filter(a => {
                let fechaA
                if (a.creadoEn?.seconds) {
                    fechaA = new Date(a.creadoEn.seconds * 1000)
                } else if (a.creadoEn?.toDate) {
                    fechaA = a.creadoEn.toDate()
                } else if (a.creadoEn) {
                    fechaA = new Date(a.creadoEn)
                }
                return fechaA && esMismoDia(fechaA, fechaRef.value)
            })

            const cache = {
                data: apuestasHoy,
                timestamp: new Date().getTime(),
                cacheDate: fechaRef.value.toISOString().split('T')[0]
            }
            localStorage.setItem('apuestasFirebaseCache', JSON.stringify(cache))
        } catch (error) {
            console.error('Error guardando apuestas en cache:', error)
        }
    }

    const cargarApuestasDesdeCache = () => {
        try {
            const cacheStr = localStorage.getItem('apuestasFirebaseCache')
            if (!cacheStr) return []
            
            const cache = JSON.parse(cacheStr)
            const ahora = new Date().getTime()
            const hoy = new Date().toISOString().split('T')[0]
            
            const esCacheValido = cache.timestamp && 
                (ahora - cache.timestamp < CACHE_DURATION_HOURS * 60 * 60 * 1000) &&
                cache.cacheDate === hoy

            return esCacheValido ? cache.data || [] : []
        } catch (error) {
            console.error('Error cargando apuestas desde cache:', error)
            return []
        }
    }

async function cargarApuestasLocales() {
    try {
        const hoy = new Date().toISOString().split('T')[0];
        const esHoySeleccionado = esMismoDia(fechaRef.value, new Date());
        
        // Obtener eliminaciones permanentes
        const eliminacionesPermanentes = JSON.parse(
            localStorage.getItem('eliminacionesPermanentes') || '{}'
        );

        // Cargar ganadores confirmados primero
        // Modifica donde cargas ganadoresConfirmados
        let ganadoresConfirmados
        try {
            ganadoresConfirmados = JSON.parse(localStorage.getItem('ganadoresConfirmados') || '{}')
        } catch (e) {
            console.error('Error parsing ganadoresConfirmados:', e)
            ganadoresConfirmados = {}
        }
        const ganadoresHoy = ganadoresConfirmados[hoy] || [];
        
        // Obtener apuestas por fecha
        const apuestasPorFecha = await localforage.getItem('apuestasPorFecha') || {};
        const fechaSeleccionadaStr = fechaRef.value.toISOString().split('T')[0];
        let apuestasFecha = apuestasPorFecha[fechaSeleccionadaStr] || [];
        
        apuestasFecha = apuestasFecha.map(apuesta => {
            const esGanadora = ganadoresHoy.some(g => 
                g.uuid === apuesta.uuid || g.uuid === apuesta.id
            );
            return {
                ...apuesta,
                ganador: esGanadora || apuesta.ganador === true || apuesta.ganador === 'true'
            };
        });
        // Obtener mutaciones pendientes
        const mutaciones = await localforage.getItem('mutacionesPendientes') || [];
        const eliminacionesPendientes = mutaciones.filter(m => m.tipo === 'ELIMINACION');
        const edicionesPendientes = mutaciones.filter(m => m.tipo === 'EDICION');
        // Función para normalizar el valor de ganador
        const normalizarGanador = (valor) => {
            if (valor === undefined || valor === null) return false;
            return valor === true || valor === 'true';
        };
        // Filtrar eliminaciones y mantener todos los estados (Pendiente y Cargado)
        apuestasLocales.value = apuestasFecha
            .filter(a => !eliminacionesPermanentes[a.uuid])
            .filter(a => !eliminacionesPendientes.some(e => e.idOriginal === a.uuid || e.idOriginal === a.id))
            .map(a => {
                const ganador = normalizarGanador(a.ganador);
                const edicionPendiente = edicionesPendientes.find(e => 
                    e.idOriginal === a.uuid || e.idOriginal === a.id
                );

                if (edicionPendiente) {
                    return {
                        ...a,
                        ...edicionPendiente.nuevosDatos,
                        estado: 'EditadoOffline',
                        id: a.uuid,
                        totalGlobal: Number(edicionPendiente.nuevosDatos.totalGlobal) || Number(a.totalGlobal) || 0,
                        ganador: normalizarGanador(edicionPendiente.nuevosDatos.ganador ?? a.ganador)
                    };
                }
                
                return {
                    ...a,
                    estado: a.estado || 'Pendiente',
                    id: a.uuid,
                    totalGlobal: Number(a.totalGlobal) || 0,
                    ganador
                };
            });
        
        // Si es hoy, también cargar mutaciones pendientes (nuevas apuestas)
        if (esHoySeleccionado) {
            const nuevasApuestasPendientes = mutaciones
                .filter(m => m.tipo === 'CREACION')
                .map(m => ({
                    ...m.nuevosDatos,
                    estado: 'Pendiente',
                    id: m.uuid,
                    ganador: normalizarGanador(m.nuevosDatos.ganador),
                }));
            
            apuestasLocales.value = [...apuestasLocales.value, ...nuevasApuestasPendientes];
        }
    } catch (error) {
        console.error('Error cargando apuestas locales:', error);
        apuestasLocales.value = [];
    }
}

    const mostrarHora = (persona) => {
        try {
            if (!persona || typeof persona !== 'object') return "--:-- --"
            
            const opciones = { 
                hour: '2-digit', 
                minute: '2-digit', 
                hour12: true, 
                timeZone: 'America/Havana' 
            }

            const formatearHora = (fecha) => {
                try {
                    if (!fecha) return "--:-- --"
                    
                    let fechaObj
                    
                    if (typeof fecha === 'object' && 'seconds' in fecha) {
                        fechaObj = new Date(fecha.seconds * 1000)
                    } 
                    else if (typeof fecha === 'object' && typeof fecha.toDate === 'function') {
                        fechaObj = fecha.toDate()
                    }
                    else if (typeof fecha === 'string') {
                        fechaObj = new Date(fecha)
                    }
                    else if (fecha instanceof Date) {
                        fechaObj = fecha
                    }
                    
                    if (!fechaObj || isNaN(fechaObj.getTime())) return "--:-- --"
                    
                    return fechaObj.toLocaleTimeString('es-ES', opciones)
                } catch {
                    return "--:-- --"
                }
            }

            return formatearHora(
                persona.sincronizadoEn || 
                (persona.estado === 'Pendiente' && persona.creadoEn) || 
                persona.creadoEn
            ) || "--:-- --"
            
        } catch (error) {
            console.error('Error al mostrar hora:', error)
            return "--:-- --"
        }
    }

// En lista.js, modificar la función apuestasCombinadas
const apuestasCombinadas = computed(() => {
    const hoy = new Date();
    const esHoySeleccionado = esMismoDia(fechaRef.value, hoy);
    
    // Cargar ganadores confirmados
    // Modifica donde cargas ganadoresConfirmados
    let ganadoresConfirmados
    try {
        ganadoresConfirmados = JSON.parse(localStorage.getItem('ganadoresConfirmados') || '{}')
    } catch (e) {
        console.error('Error parsing ganadoresConfirmados:', e)
        ganadoresConfirmados = {}
    }
    const ganadoresHoy = ganadoresConfirmados[hoy] || [];
    // Obtener todas las apuestas locales (pendientes y cargadas)
    const apuestasLocalesHoy = apuestasLocales.value
        .filter(a => {
            try {
                let fechaA;
                if (a.creadoEn?.seconds) {
                    fechaA = new Date(a.creadoEn.seconds * 1000);
                } else if (a.creadoEn?.toDate) {
                    fechaA = a.creadoEn.toDate();
                } else if (a.creadoEn) {
                    fechaA = new Date(a.creadoEn);
                }
                return fechaA && esMismoDia(fechaA, fechaRef.value);
            } catch {
                return false;
            }
        })
        .map(a => ({
            ...a,
            ganador: ganadoresHoy.some(g => g.uuid === a.uuid || g.uuid === a.id) || 
                a.ganador === true || 
                a.ganador === 'true'
        }));

    // Si es hoy, mostramos todas las locales (pendientes y cargadas)
    if (esHoySeleccionado) {
        return apuestasLocalesHoy.sort((a, b) => {
            try {
                const fechaA = a.creadoEn?.seconds ? a.creadoEn.seconds * 1000 : 
                    a.creadoEn?.toDate ? a.creadoEn.toDate().getTime() : 
                    a.creadoEn ? new Date(a.creadoEn).getTime() : 0;
                
                const fechaB = b.creadoEn?.seconds ? b.creadoEn.seconds * 1000 : 
                    b.creadoEn?.toDate ? b.creadoEn.toDate().getTime() : 
                    b.creadoEn ? new Date(b.creadoEn).getTime() : 0;
                
                return fechaB - fechaA;
            } catch {
                return 0;
            }
        });
    }

    // Para otros días, mostrar de Firebase si hay conexión
    if (isOnline.value && apuestas.value.length > 0) {
        const apuestasFirebaseFiltradas = apuestas.value
            .filter(a => {
                try {
                    let fechaA;
                    if (a.creadoEn?.seconds) {
                        fechaA = new Date(a.creadoEn.seconds * 1000);
                    } else if (a.creadoEn?.toDate) {
                        fechaA = a.creadoEn.toDate();
                    } else if (a.creadoEn) {
                        fechaA = new Date(a.creadoEn);
                    }
                    return fechaA && esMismoDia(fechaA, fechaRef.value);
                } catch {
                    return false;
                }
            })
            .map(fbApuesta => {
                const esGanadora = ganadoresHoy.some(g => g.uuid === fbApuesta.uuid);
                const localVersion = apuestasLocalesHoy.find(
                    local => local.uuid === fbApuesta.uuid
                );
                
                return {
                    ...fbApuesta,
                    ganador: esGanadora || 
                            (localVersion?.ganador === true) || 
                            fbApuesta.ganador === true
                };
            });
        
        return apuestasFirebaseFiltradas.sort((a, b) => {
            try {
                const fechaA = a.creadoEn?.seconds ? a.creadoEn.seconds * 1000 : 
                    a.creadoEn?.toDate ? a.creadoEn.toDate().getTime() : 
                    a.creadoEn ? new Date(a.creadoEn).getTime() : 0;
                
                const fechaB = b.creadoEn?.seconds ? b.creadoEn.seconds * 1000 : 
                    b.creadoEn?.toDate ? b.creadoEn.toDate().getTime() : 
                    b.creadoEn ? new Date(b.creadoEn).getTime() : 0;
                
                return fechaB - fechaA;
            } catch {
                return 0;
            }
        });
    }

    // Si no hay conexión y no es hoy, mostrar cache de Firebase si existe
    const cache = cargarApuestasDesdeCache();
    const apuestasCacheFiltradas = cache.filter(a => {
        try {
            let fechaA;
            if (a.creadoEn?.seconds) {
                fechaA = new Date(a.creadoEn.seconds * 1000);
            } else if (a.creadoEn?.toDate) {
                fechaA = a.creadoEn.toDate();
            } else if (a.creadoEn) {
                fechaA = new Date(a.creadoEn);
            }
            return fechaA && !esMismoDia(fechaA, hoy) && esMismoDia(fechaA, fechaRef.value);
        } catch {
            return false;
        }
    });
    
    return apuestasCacheFiltradas;
});

    const updateOnlineStatus = async () => {
        isOnline.value = navigator.onLine;
        if (isOnline.value) {
            isSyncing.value = true;
            try {
                // Sincronizar en este orden específico
                await sincronizarPendientes();
                await sincronizarMutaciones();
                await sincronizarEliminaciones();
                
                // Actualizar datos locales
                if (unsubscribe && typeof unsubscribe === 'function') unsubscribe();
                unsubscribe = await obtenerApuestas(idListero);
                await cargarApuestasLocales();
                
                // Forzar actualización de UI
                window.dispatchEvent(new Event('apuestas-actualizadas'));
            } catch (error) {
                console.error('Error en sincronización:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error de sincronización',
                    text: 'Algunos cambios no se sincronizaron correctamente',
                    timer: 2000
                });
            } finally {
                isSyncing.value = false;
            }
        }
    };

    const cuadroClick = (persona) => {
        personaSeleccionada.value = persona
        mostrarModal.value = true
    }

    const cerrarModal = () => {
        mostrarModal.value = false
    }
const eliminarPersona = async () => {
  try {
    const id = personaSeleccionada.value.id || personaSeleccionada.value.uuid;

    const esCargado = personaSeleccionada.value.estado === 'Cargado';
    
    apuestasLocales.value = apuestasLocales.value.filter(a => a.id !== id && a.uuid !== id);
    
    // 1. Eliminar de apuestas locales
    const hoy = new Date().toISOString().split('T')[0];
    const apuestasPorFecha = await localforage.getItem('apuestasPorFecha') || {};
    
    if (apuestasPorFecha[hoy]) {
      apuestasPorFecha[hoy] = apuestasPorFecha[hoy].filter(a => a.uuid !== id);
      await localforage.setItem('apuestasPorFecha', apuestasPorFecha);
    }

    // 2. Si está online y es una apuesta cargada, eliminar también el registro de ganancia
    if (isOnline.value && esCargado) {
      try {
        await GananciasService.eliminarRegistroGanancia({
          apuestaId: id,
          bancoId: personaSeleccionada.value.bancoId || authStore.bancoId,
          userId: personaSeleccionada.value.id_usuario || auth.currentUser?.uid,
          horario: personaSeleccionada.value.horario
        });
        console.log(`Registro de ganancia eliminado para apuesta ${id}`);
      } catch (error) {
        console.error('Error eliminando registro de ganancia:', error);
        // No fallamos el proceso completo por un error en ganancias
      }
    }

    // 3. Agregar a mutaciones pendientes (con serialización segura)
    const mutaciones = await localforage.getItem('mutacionesPendientes') || [];
    const existe = mutaciones.some(m => m.idOriginal === id && m.tipo === 'ELIMINACION');
    
    if (!existe) {
      // Crear objeto serializable para la mutación
      const mutacionSerializable = {
        tipo: 'ELIMINACION',
        idOriginal: id,
        timestamp: Date.now(),
        uuid: id,
        estado: 'Pendiente',
        bancoId: personaSeleccionada.value.bancoId || authStore.bancoId,
        // Serializar campos de fecha manualmente
        creadoEn: personaSeleccionada.value.creadoEn?.toISOString?.() || 
                 personaSeleccionada.value.creadoEn,
        // Solo guardar datos esenciales para evitar problemas
        datosOriginales: personaSeleccionada.value.estado === 'Cargado' ? {
          nombre: personaSeleccionada.value.nombre,
          totalGlobal: personaSeleccionada.value.totalGlobal,
          tipo: personaSeleccionada.value.tipo,
          horario: personaSeleccionada.value.horario,
          id_usuario: personaSeleccionada.value.id_usuario
        } : null
      };

      mutaciones.push(mutacionSerializable);
      await localforage.setItem('mutacionesPendientes', mutaciones);
    }

    await cargarApuestasLocales();
    window.dispatchEvent(new CustomEvent('apuestas-actualizadas'));

    mostrarConfirmacionEliminar.value = false;
    mostrarModal.value = false;

    Swal.fire({ 
      icon: 'success', 
      title: isOnline.value ? '¡Eliminada!' : '¡Marcada para eliminar!', 
      text: isOnline.value ? 'La apuesta fue removida' : 'La apuesta será eliminada cuando vuelvas a estar online', 
      timer: 1500, 
      showConfirmButton: false 
    });

    // 6. Si estamos online, sincronizar inmediatamente
    if (isOnline.value) {
      await sincronizarMutaciones();
    }
  } catch (error) {
    console.error('Error en eliminarPersona:', error);
    Swal.fire({ 
      icon: 'error', 
      title: 'Error', 
      text: 'No se pudo eliminar la apuesta: ' + error.message, 
      timer: 2000 
    });
  }
};

const editarPersona = async () => {
  try {
    const tipoJugada = personaSeleccionada.value.tipo.split('/')[0] || 'normal';
    const esPendiente = personaSeleccionada.value.estado === 'Pendiente';
    
    // Siempre usar el ID original
    const idEdicion = personaSeleccionada.value.id || personaSeleccionada.value.uuid;
    
    router.push({
      path: `/anadirjugada/${route.params.id}`,
      query: {
        tipo: tipoJugada,
        editar: idEdicion,
        esPendiente: esPendiente.toString(),
        idOriginal: idEdicion,
        ts: Date.now()
      }
    });
    
    cerrarModal();
  } catch (error) {
    console.error('[EDITAR] Error en editarPersona:', error);
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'No se pudo iniciar la edición: ' + error.message,
      timer: 2000
    });
  }
};

    const confirmarEliminar = () => {
        mostrarConfirmacionEliminar.value = true
    }

    onMounted(async() => {
        isOnline.value = navigator.onLine
        unsubscribe = await obtenerApuestas(idListero)
        cargarApuestasLocales()
        
        // Listener para cambios simples de estado de conexión
        window.addEventListener('online', updateOnlineStatus)
        window.addEventListener('offline', updateOnlineStatus)
        
        window.addEventListener('storage', cargarApuestasLocales)
        window.addEventListener('horario-cerrado', () => {
            if (unsubscribe && typeof unsubscribe === 'function') unsubscribe()
            unsubscribe = obtenerApuestas(idListero)
            cargarApuestasLocales()
        })
        
        // Listener principal para sincronización al reconectar
        window.addEventListener('online', handleReconnect)
        
        window.addEventListener('apuestas-actualizadas', cargarApuestasLocales)
        window.addEventListener('mutaciones-completadas', cargarApuestasLocales)

        if (navigator.onLine) {
            syncInProgress = true
            isSyncing.value = true
            try {
                await Promise.all([
                    sincronizarEliminaciones(),
                    sincronizarPendientes(),
                    sincronizarMutaciones()
                ])
                if (unsubscribe && typeof unsubscribe === 'function') unsubscribe()
                unsubscribe = await obtenerApuestas(idListero)
                await cargarApuestasLocales()
            } finally {
                syncInProgress = false
                isSyncing.value = false
            }
        }
    })
 // Nueva función para manejar la reconexión
    const handleReconnect = async () => {
        if (syncInProgress) {
            return
        }
        
        syncInProgress = true
        isSyncing.value = true
        
        try {
            // Esperar 3 segundos para asegurar conexión estable
            await new Promise(resolve => setTimeout(resolve, 3000))
            
            console.log('[SYNC] Paso 1: Sincronizando eliminaciones...')
            const elimResults = await sincronizarEliminaciones()
            console.log('[SYNC] Resultado eliminaciones:', elimResults)
            
            console.log('[SYNC] Paso 2: Sincronizando mutaciones...')
            const mutResults = await sincronizarMutaciones()
            console.log('[SYNC] Resultado mutaciones:', mutResults)
            
            console.log('[SYNC] Paso 3: Sincronizando nuevas apuestas...')
            const pendResults = await sincronizarPendientes()
            console.log('[SYNC] Resultado pendientes:', pendResults)
            
            console.log('[SYNC] Actualizando datos locales...')
            if (unsubscribe && typeof unsubscribe === 'function') unsubscribe()
            unsubscribe = await obtenerApuestas(idListero)
            await cargarApuestasLocales()
            
            console.log('[SYNC] Sincronización completada exitosamente')
        } catch (error) {
            console.error('[SYNC] Error durante sincronización:', error)
            Swal.fire({
                icon: 'error',
                title: 'Error de sincronización',
                text: 'Algunos cambios no se sincronizaron correctamente',
                timer: 2000
            })
        } finally {
            syncInProgress = false
            isSyncing.value = false
        }
    }
    onUnmounted(() => {
        if (unsubscribe && typeof unsubscribe === 'function') unsubscribe()
        window.removeEventListener('online', updateOnlineStatus)
        window.removeEventListener('offline', updateOnlineStatus)
        window.removeEventListener('online', handleReconnect) // <-- Nuevo
        window.removeEventListener('storage', cargarApuestasLocales)
    })

    watch(() => fechaRef.value, () => {
        cargarApuestasLocales()
    })
    watch(apuestasCombinadas, (newVal) => {
        console.log('🔍 Apuestas combinadas:', {
            total: newVal.length,
            conGanador: newVal.filter(a => a.ganador).length,
            detallesGanadores: newVal.filter(a => a.ganador).map(a => ({
                id: a.id,
                nombre: a.nombre,
                horario: a.horario,
                ganador: a.ganador
            }))
        });
    }, { deep: true, immediate: true });

    return {
        mostrarModal,
        mostrarConfirmacionEliminar,
        personaSeleccionada,
        isOnline,
        isSyncing,
        apuestasLocales,
        apuestasCombinadas,
        cuadroClick,
        cerrarModal,
        editarPersona,
        eliminarPersona,
        confirmarEliminar,
        mostrarHora,
        obtenerIconoEstado,
        cargarApuestasLocales
    }
}