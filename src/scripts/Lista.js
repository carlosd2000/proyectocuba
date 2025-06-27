import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import Swal from 'sweetalert2'
import { apuestas, obtenerApuestas, eliminarApuesta, sincronizarEliminaciones } from '../scripts/crudListas.js'
import { sincronizarPendientes } from '../scripts/añadir.js'
import Cloud from '../assets/icons/Cloud.svg'
import CloudFill from '../assets/icons/Cloud_fill.svg'
import StropWatch from '../assets/icons/stopwatch.svg'

export default function useLista(fechaRef, router, route) {
    const mostrarModal = ref(false)
    const mostrarConfirmacionEliminar = ref(false)
    const personaSeleccionada = ref(null)
    const isOnline = ref(navigator.onLine)
    const isSyncing = ref(false)
    const apuestasLocales = ref([])
    let unsubscribe = null

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
            case 'FueraDeTiempo': return StropWatch
            default: return Cloud
        }
    }

    const guardarApuestasEnCache = (apuestasFirebase) => {
        try {
            const apuestasHoy = apuestasFirebase.filter(a => {
                let fechaA = a.creadoEn?.seconds ? new Date(a.creadoEn.seconds * 1000) :
                    a.creadoEn?.toDate ? a.creadoEn.toDate() :
                    a.creadoEn ? new Date(a.creadoEn) : null
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

    function cargarApuestasLocales() {
        try {
            const eliminacionesPermanentes = JSON.parse(
                localStorage.getItem('eliminacionesPermanentes') || '{}'
            )
            const pendientes = JSON.parse(
                localStorage.getItem('apuestasPendientes') || '[]'
            )
            const cacheadas = cargarApuestasDesdeCache()
            
            apuestasLocales.value = [
                ...pendientes.filter(a => !eliminacionesPermanentes[a.uuid]),
                ...cacheadas.filter(a => !eliminacionesPermanentes[a.id])
            ].map(a => ({
                ...a,
                estado: a.uuid ? 'Pendiente' : 'Cargado',
                id: a.uuid || a.id,
                uuid: a.uuid || a.id,
                totalGlobal: Number(a.totalGlobal) || 0,
            }))
        } catch (error) {
            console.error('Error cargando apuestas locales:', error)
            apuestasLocales.value = []
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

    const apuestasCombinadas = computed(() => {
        if (isOnline.value && apuestas.value.length > 0) {
            guardarApuestasEnCache(apuestas.value)
        }

        const apuestasParaMostrar = isOnline.value ? apuestas.value : cargarApuestasDesdeCache()
        const firebaseUuids = new Set(apuestasParaMostrar.map(a => a.uuid))
        const localesFiltradas = apuestasLocales.value.filter(local => !firebaseUuids.has(local.uuid))
        
        return [...apuestasParaMostrar, ...localesFiltradas]
            .filter(a => {
                let fechaA
                try {
                    if (a.creadoEn?.seconds) {
                        fechaA = new Date(a.creadoEn.seconds * 1000)
                    } else if (a.creadoEn?.toDate) {
                        fechaA = a.creadoEn.toDate()
                    } else if (a.creadoEn) {
                        fechaA = new Date(a.creadoEn)
                    }
                    return fechaA && esMismoDia(fechaA, fechaRef.value)
                } catch {
                    return false
                }
            })
            .sort((a, b) => {
                try {
                    const fechaA = a.creadoEn?.seconds ? a.creadoEn.seconds * 1000 : 
                        a.creadoEn?.toDate ? a.creadoEn.toDate().getTime() : 
                        a.creadoEn ? new Date(a.creadoEn).getTime() : 0
                    
                    const fechaB = b.creadoEn?.seconds ? b.creadoEn.seconds * 1000 : 
                        b.creadoEn?.toDate ? b.creadoEn.toDate().getTime() : 
                        b.creadoEn ? new Date(b.creadoEn).getTime() : 0
                    
                    if (a.estado === 'Pendiente') return -1
                    if (b.estado === 'Pendiente') return 1
                    return fechaB - fechaA
                } catch {
                    return 0
                }
            })
    })

    const updateOnlineStatus = () => {
        isOnline.value = navigator.onLine
        if (isOnline.value) {
            isSyncing.value = true
            Promise.all([sincronizarPendientes(), sincronizarEliminaciones()])
                .then(async () => {
                    if (unsubscribe && typeof unsubscribe === 'function') unsubscribe()
                    unsubscribe = await obtenerApuestas(idListero)
                    cargarApuestasLocales()
                })
                .finally(() => {
                    isSyncing.value = false
                })
        } else {
            cargarApuestasLocales()
        }
    }

    const handleCandadosActualizados = () => {
        console.log('Evento de candados actualizados recibido, actualizando lista...')
        if (unsubscribe && typeof unsubscribe === 'function') unsubscribe()
        unsubscribe = obtenerApuestas(idListero)
        cargarApuestasLocales()
    }

    const cuadroClick = (persona) => {
        personaSeleccionada.value = persona
        mostrarModal.value = true
    }

    const cerrarModal = () => {
        mostrarModal.value = false
    }

    const editarPersona = async () => {
        const tipoJugada = personaSeleccionada.value.tipo.split('/')[0] || 'normal'
        const esPendiente = personaSeleccionada.value.estado === 'Pendiente'
        router.push({
            path: `/anadirjugada/${route.params.id}`,
            query: {
                tipo: tipoJugada,
                editar: esPendiente ? personaSeleccionada.value.uuid : personaSeleccionada.value.id,
                esPendiente: esPendiente.toString()
            }
        })
        cerrarModal()
    }

    const eliminarPersona = async () => {
        try {
            const id = personaSeleccionada.value.id
            const esPendiente = personaSeleccionada.value.estado === 'Pendiente'
            
            // Eliminar inmediatamente de la UI
            if (esPendiente) {
                apuestasLocales.value = apuestasLocales.value.filter(a => a.uuid !== id)
                const pendientes = JSON.parse(localStorage.getItem('apuestasPendientes') || '[]')
                const nuevasPendientes = pendientes.filter(p => p.uuid !== id)
                localStorage.setItem('apuestasPendientes', JSON.stringify(nuevasPendientes))
                const eliminacionesPermanentes = JSON.parse(localStorage.getItem('eliminacionesPermanentes') || '{}')
                eliminacionesPermanentes[id] = true
                localStorage.setItem('eliminacionesPermanentes', JSON.stringify(eliminacionesPermanentes))
            } else {
                apuestas.value = apuestas.value.filter(a => a.id !== id)
                apuestasLocales.value = apuestasLocales.value.filter(a => a.id !== id)
            }

            // Cerrar modales inmediatamente
            mostrarConfirmacionEliminar.value = false
            mostrarModal.value = false

            // Procesar la eliminación en segundo plano
            const { success } = await eliminarApuesta(id, esPendiente)
            if (!success) throw new Error('No se pudo completar la eliminación')

            Swal.fire({ 
                icon: 'success', 
                title: '¡Eliminada!', 
                text: 'La apuesta fue removida', 
                timer: 1500, 
                showConfirmButton: false 
            })
        } catch (error) {
            console.error('Error en eliminarPersona:', error)
            if (personaSeleccionada.value?.estado === 'Pendiente') {
                cargarApuestasLocales()
            } else if (unsubscribe) {
                unsubscribe()
                unsubscribe = await obtenerApuestas(idListero)
            }
            Swal.fire({ 
                icon: 'error', 
                title: 'Error', 
                text: 'No se pudo eliminar la apuesta', 
                timer: 2000 
            })
        }
    }

    const confirmarEliminar = () => {
        mostrarConfirmacionEliminar.value = true
    }

    onMounted(async() => {
        isOnline.value = navigator.onLine
        unsubscribe = await obtenerApuestas(idListero)
        cargarApuestasLocales()
        window.addEventListener('online', updateOnlineStatus)
        window.addEventListener('offline', updateOnlineStatus)
        window.addEventListener('storage', cargarApuestasLocales)
        window.addEventListener('candados-actualizados', handleCandadosActualizados)
        window.addEventListener('horario-cerrado', () => {
            if (unsubscribe && typeof unsubscribe === 'function') unsubscribe()
            unsubscribe = obtenerApuestas(idListero)
            cargarApuestasLocales()
        })

        if (navigator.onLine) {
            isSyncing.value = true
            sincronizarEliminaciones()
                .then(sincronizarPendientes)
                .then(() => {
                    if (unsubscribe && typeof unsubscribe === 'function') unsubscribe()
                    unsubscribe = obtenerApuestas(idListero)
                    cargarApuestasLocales()
                })
                .finally(() => { isSyncing.value = false })
        }
    })

    onUnmounted(() => {
        if (unsubscribe && typeof unsubscribe === 'function') unsubscribe()
        window.removeEventListener('online', updateOnlineStatus)
        window.removeEventListener('offline', updateOnlineStatus)
        window.removeEventListener('storage', cargarApuestasLocales)
        window.removeEventListener('candados-actualizados', handleCandadosActualizados)
    })

    watch(() => fechaRef.value, () => {
        cargarApuestasLocales()
    })

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
        obtenerIconoEstado
    }
}