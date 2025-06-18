import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { getFirestore, collection, query, where, onSnapshot } from 'firebase/firestore'
import { useRoute, useRouter } from 'vue-router'
import { setHorario } from '../scripts/añadir.js'
import { obtenerBancoPadre } from '../scripts/FunctionBancoPadre.js'

export function useHorario(props) {
    // Firebase
    const db = getFirestore()
    const bancoId = ref(null)
    const apuestasRef = ref(null)

    // Router
    const route = useRoute()
    const router = useRouter()

    // Turnos disponibles
    const opciones = ['Dia', 'Tarde', 'Noche']
    const turnoSeleccionado = ref('Dia')

    // Total sumado online
    const totalGlobal = ref(0)
    // Reactividad para apuestas locales
    const apuestasLocalesVersion = ref(0)
    // Estado de conexión
    const isOnline = ref(navigator.onLine)

    // Sumar apuestas locales del turno seleccionado
    function calcularTotalLocal() {
        try {
            const pendientes = JSON.parse(localStorage.getItem('apuestasPendientes') || '[]')
            return pendientes
                .filter(a => a.horario === turnoSeleccionado.value)
                .reduce((sum, a) => sum + (Number(a.totalGlobal) || 0), 0)
        } catch {
            return 0
        }
    }

    // Total formateado: suma online + offline si online, o total guardado + offline si offline
    const totalFormateado = computed(() => {
        apuestasLocalesVersion.value // Dependencia reactiva
        const totalesOnline = JSON.parse(localStorage.getItem('totalesOnline') || '{}')
        const totalOnlineGuardado = totalesOnline[turnoSeleccionado.value] || 0
        const totalOffline = calcularTotalLocal()
        let total = 0
        if (isOnline.value) {
            total = totalGlobal.value + totalOffline
        } else {
            total = totalOnlineGuardado + totalOffline
        }
        return `$${total.toLocaleString('es-CO', { minimumFractionDigits: 2 })}`
    })

    // Ícono según turno
    const iconoTurno = computed(() => {
        if (turnoSeleccionado.value === 'Dia') return 'bi bi-sun-fill text-warning'
        if (turnoSeleccionado.value === 'Tarde') return 'bi bi-cloud-sun-fill text-secondary'
        return 'bi bi-moon-fill text-primary'
    })

    // Listener actual de Firebase
    let unsubscribe = null

    // Función para escuchar en tiempo real según turno
    const escucharCambios = () => {
        if (unsubscribe) unsubscribe()
        if (!bancoId.value) return
        apuestasRef.value = collection(db, 'bancos', bancoId.value, 'apuestas')
        const q = query(apuestasRef.value, where('horario', '==', turnoSeleccionado.value))
        unsubscribe = onSnapshot(q, (snapshot) => {
            let suma = 0
            snapshot.forEach(doc => {
                const data = doc.data()
                if (typeof data.totalGlobal === 'number') {
                    suma += data.totalGlobal
                }
            })
            totalGlobal.value = suma
            // Guarda el total online por horario en localStorage
            const totalesOnline = JSON.parse(localStorage.getItem('totalesOnline') || '{}')
            totalesOnline[turnoSeleccionado.value] = suma
            localStorage.setItem('totalesOnline', JSON.stringify(totalesOnline))
        })
    }

    // Iniciar escucha al montar
    onMounted(async () => {
        if (!props.modoEdicion) {
            turnoSeleccionado.value = 'Dia'
            setHorario('Dia')
        }
        bancoId.value = await obtenerBancoPadre()
        escucharCambios()
        // Reactividad para apuestas locales
        window.addEventListener('apuestas-locales-actualizadas', () => {
            apuestasLocalesVersion.value++
        })
        window.addEventListener('storage', (e) => {
            if (e.key === 'apuestasPendientes') {
                apuestasLocalesVersion.value++
            }
        })
        window.addEventListener('online', () => isOnline.value = true)
        window.addEventListener('offline', () => isOnline.value = false)
    })

    // Escuchar cambios de turno
    watch(turnoSeleccionado, (nuevoHorario) => {
        setHorario(nuevoHorario)
        escucharCambios()
    })

    // Escuchar cambios en horarioEdicion
    watch(() => props.horarioEdicion, (nuevoHorario) => {
        if (props.modoEdicion && nuevoHorario) {
            turnoSeleccionado.value = nuevoHorario
            setHorario(nuevoHorario)
        }
    }, { immediate: true })

    // Cancelar listener al desmontar
    onBeforeUnmount(() => {
        if (unsubscribe) unsubscribe()
        window.removeEventListener('apuestas-locales-actualizadas', () => {
            apuestasLocalesVersion.value++
        })
        window.removeEventListener('storage', () => {
            apuestasLocalesVersion.value++
        })
        window.removeEventListener('online', () => isOnline.value = true)
        window.removeEventListener('offline', () => isOnline.value = false)
    })

    return {
        opciones,
        turnoSeleccionado,
        totalFormateado,
        iconoTurno,
        route,
        router
    }
}