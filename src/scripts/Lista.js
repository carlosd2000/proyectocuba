import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import Swal from 'sweetalert2'
import { apuestas, obtenerApuestas, eliminarApuesta, sincronizarEliminaciones } from '../scripts/crudListas.js'
import { sincronizarPendientes } from '../scripts/añadir.js'

export default function useLista(fechaRef, router, route) {
    const mostrarModal = ref(false)
    const mostrarConfirmacionEliminar = ref(false)
    const personaSeleccionada = ref(null)
    const isOnline = ref(navigator.onLine)
    const isSyncing = ref(false)
    const apuestasLocales = ref([])
    let unsubscribe = null

    const esMismoDia = (fechaA, fechaB) => {
        try {
            const a = new Date(fechaA);
            const b = new Date(fechaB);
            return a.getFullYear() === b.getFullYear() &&
                a.getMonth() === b.getMonth() &&
                a.getDate() === b.getDate();
        } catch (e) {
            console.error('Error al comparar fechas:', e);
            return false;
        }
    }

    const obtenerIconoEstado = (persona) => {
        if (!persona || !persona.estado) return 'bi bi-cloud-check text-success'
        switch (persona.estado) {
        default: case 'Cargado': return 'bi bi-cloud-check text-success'
        case 'Pendiente': return 'bi bi-cloud-slash text-danger'
        case 'EnTiempo': return 'bi bi-stopwatch text-success'
        case 'FueraDeTiempo': return 'bi bi-stopwatch text-danger'
        }
    }

    function cargarApuestasLocales() {
        try {
        const eliminacionesPermanentes = JSON.parse(localStorage.getItem('eliminacionesPermanentes') || '{}');
        const pendientes = JSON.parse(localStorage.getItem('apuestasPendientes') || '[]');
        apuestasLocales.value = pendientes
            .filter(a => !eliminacionesPermanentes[a.uuid])
            .map(a => ({
            ...a,
            estado: 'Pendiente',
            id: a.uuid,
            uuid: a.uuid,
            totalGlobal: Number(a.totalGlobal) || 0,
            candadoAbierto: a.candadoAbierto ?? false,
            }));
        } catch (error) {
        console.error('Error cargando apuestas locales:', error);
        apuestasLocales.value = [];
        }
    }

    const mostrarHora = (persona) => {
        if (!persona || typeof persona !== 'object') return "--:-- --"
        const opciones = { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'America/Havana' }
        const formatearHora = (fecha) => {
        if (!fecha) return "--:-- --"
        const fechaObj = typeof fecha === 'string' ? new Date(fecha) : fecha.toDate?.() || fecha
        return fechaObj.toLocaleTimeString('es-ES', opciones)
        }
        if (persona.sincronizadoEn) return formatearHora(persona.sincronizadoEn)
        if (persona.estado === 'Pendiente' && persona.creadoEn) return formatearHora(persona.creadoEn)
        if (persona.creadoEn) return formatearHora(persona.creadoEn)
        return "--:-- --"
    }

    const apuestasCombinadas = computed(() => {
        if (!isOnline.value) {
            const filtradas = apuestasLocales.value.filter(a => {
                let fecha = a.creadoEn ? new Date(a.creadoEn) : null;
                const mismoDia = fecha && esMismoDia(fecha, fechaRef.value);
                return mismoDia;
            });
            
            return filtradas.sort((a, b) => {
                const fechaA = a.creadoEn ? new Date(a.creadoEn).getTime() : 0;
                const fechaB = b.creadoEn ? new Date(b.creadoEn).getTime() : 0;
                return fechaB - fechaA;
            });
        }

        const firebaseUuids = new Set(apuestas.value.map(a => a.uuid))
        const localesFiltradas = apuestasLocales.value.filter(local => !firebaseUuids.has(local.uuid))
        return [...apuestas.value, ...localesFiltradas]
        .filter(a => {
            let fechaA = a.creadoEn?.seconds ? new Date(a.creadoEn.seconds * 1000) :
            a.creadoEn?.toDate ? a.creadoEn.toDate() :
                a.creadoEn ? new Date(a.creadoEn) : null;
            return fechaA && esMismoDia(fechaA, fechaRef.value)
        })
        .sort((a, b) => {
            if (a.estado === 'Pendiente') return -1
            if (b.estado === 'Pendiente') return 1
            return (b.creadoEn?.seconds || b.creadoEn?.getTime() || 0) -
            (a.creadoEn?.seconds || a.creadoEn?.getTime() || 0)
        })
    })

    const updateOnlineStatus = () => {
        isOnline.value = navigator.onLine
        if (isOnline.value) {
        isSyncing.value = true
        Promise.all([sincronizarPendientes(), sincronizarEliminaciones()])
            .then(async () => {
            if (unsubscribe && typeof unsubscribe === 'function') unsubscribe();
            unsubscribe = await obtenerApuestas(); // Ahora es async
            cargarApuestasLocales();
            })
            .finally(() => {
            isSyncing.value = false
            })
        }
        else {
        cargarApuestasLocales();
        }
    }

    const handleCandadosActualizados = () => {
        console.log('Evento de candados actualizados recibido, actualizando lista...');
        if (unsubscribe && typeof unsubscribe === 'function') unsubscribe();
        unsubscribe = obtenerApuestas();
        cargarApuestasLocales();
    }

    const cuadroClick = (persona) => {
        if (!persona.candadoAbierto) return
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
        }

        const { success } = await eliminarApuesta(id, esPendiente)
        if (!success) throw new Error('No se pudo completar la eliminación')

        mostrarConfirmacionEliminar.value = false
        mostrarModal.value = false

        Swal.fire({ icon: 'success', title: '¡Eliminada!', text: 'La apuesta fue removida', timer: 1500, showConfirmButton: false })
        } catch (error) {
        console.error('Error en eliminarPersona:', error)
        if (personaSeleccionada.value.estado === 'Pendiente') cargarApuestasLocales()
        else if (unsubscribe) {
            unsubscribe();
            unsubscribe = obtenerApuestas();
        }
        Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo eliminar la apuesta', timer: 2000 })
        }
    }

    const confirmarEliminar = () => {
        mostrarConfirmacionEliminar.value = true
    }

    onMounted(async() => {
        isOnline.value = navigator.onLine;
        unsubscribe = await obtenerApuestas();
        cargarApuestasLocales()
        window.addEventListener('online', updateOnlineStatus)
        window.addEventListener('offline', updateOnlineStatus)
        window.addEventListener('storage', cargarApuestasLocales)
        window.addEventListener('candados-actualizados', handleCandadosActualizados)
        window.addEventListener('horario-cerrado', () => {
    if (unsubscribe && typeof unsubscribe === 'function') unsubscribe();
    unsubscribe = obtenerApuestas();
    cargarApuestasLocales();
});

        if (navigator.onLine) {
            isSyncing.value = true
            sincronizarEliminaciones()
                .then(sincronizarPendientes)
                .then(() => {
                    if (unsubscribe && typeof unsubscribe === 'function') unsubscribe();
                    unsubscribe = obtenerApuestas();
                    cargarApuestasLocales();
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