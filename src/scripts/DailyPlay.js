import { ref, computed, onMounted, watch, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getFirestore, collection, query, where, onSnapshot } from 'firebase/firestore'
import { setHorario } from '../scripts/añadir.js'

    export function useDailyPlay() {
    // Firebase initialization
    const db = getFirestore()
    const apuestasRef = collection(db, 'apuestas')

// Opciones disponibles
    const opciones = ['Dia', 'Tarde', 'Noche']
    const turnoSeleccionado = ref('Dia')
    const desplegado1 = ref(true)

// Total sumado
    const totalGlobal = ref(0)
    const isOnline = ref(navigator.onLine)

// Router
    const route = useRoute()
    const router = useRouter()

    // Sumar apuestas locales si está offline
    function calcularTotalLocal() {
        try {
            const pendientes = JSON.parse(localStorage.getItem('apuestasPendientes') || '[]')
            // Solo sumar las del turno seleccionado
            return pendientes
                .filter(a => a.horario === turnoSeleccionado.value)
                .reduce((sum, a) => sum + (Number(a.totalGlobal) || 0), 0)
        } catch {
            return 0
        }
    }
    // Mostrar total con formato (incluye local si offline)
    const totalFormateado = computed(() => {
        // Total de apuestas online guardado
        const totalesOnline = JSON.parse(localStorage.getItem('totalesOnline') || '{}')
        const totalOnlineGuardado = totalesOnline[turnoSeleccionado.value] || 0
        // Total de apuestas offline
        const totalOffline = calcularTotalLocal()

        let total = 0
        if (isOnline.value) {
            // Mientras se sincroniza, muestra la suma de ambos
            total = totalGlobal.value + totalOffline
        } else {
            // Si está offline, muestra el total guardado online + offline
            total = totalOnlineGuardado + totalOffline
        }
        return `$${total.toLocaleString('es-CO', { minimumFractionDigits: 2 })}`
    })

// Listener actual de Firebase
    let unsubscribe = null

    // Función optimizada para escuchar cambios
    const escucharCambios = () => {
        if (unsubscribe) unsubscribe()

        const q = query(apuestasRef, where('horario', '==', turnoSeleccionado.value))
        unsubscribe = onSnapshot(q, (snapshot) => {
            const total = snapshot.docs.reduce((sum, doc) => {
                const data = doc.data()
                return sum + (typeof data.totalGlobal === 'number' ? data.totalGlobal : 0)
            }, 0)
            totalGlobal.value = total
            // Guarda el total online por horario en localStorage
            const totalesOnline = JSON.parse(localStorage.getItem('totalesOnline') || '{}')
            totalesOnline[turnoSeleccionado.value] = total
            localStorage.setItem('totalesOnline', JSON.stringify(totalesOnline))
        }, (error) => {
            console.error("Error en listener de Firebase:", error)
        })
    }

        // Watcher para cambios de turno
    watch(turnoSeleccionado, (nuevoHorario) => {
        setHorario(nuevoHorario)
        if (isOnline.value) {
            escucharCambios()
        } else {
            // Forzar recalculo del total local al cambiar de horario offline
            totalGlobal.value = 0
        }
    })

    // Watcher para cambios de conexión
    function updateOnlineStatus() {
        isOnline.value = navigator.onLine
        if (isOnline.value) {
            escucharCambios()
        }
    }

    onMounted(() => {
        turnoSeleccionado.value = 'Dia'
        setHorario('Dia')
                if (isOnline.value) {
            escucharCambios()
        }
        window.addEventListener('online', updateOnlineStatus)
        window.addEventListener('offline', updateOnlineStatus)
        window.addEventListener('apuestas-sincronizadas', () => {
            // Forzar recalculo del total offline
            totalGlobal.value = 0; // Esto fuerza el computed a recalcular
        });
     // Carga estado de desplegado
        const savedDesplegado1 = localStorage.getItem('desplegado1')
        if (savedDesplegado1 !== null) {
            desplegado1.value = JSON.parse(savedDesplegado1)
        }
    })

    watch(desplegado1, (newValue) => {
        localStorage.setItem('desplegado1', JSON.stringify(newValue))
    })

    onBeforeUnmount(() => {
        if (unsubscribe) unsubscribe()
        window.removeEventListener('online', updateOnlineStatus)
        window.removeEventListener('offline', updateOnlineStatus)
        window.removeEventListener('apuestas-sincronizadas', () => {
            totalGlobal.value = 0;
        });
    })

    return {
        opciones,
        turnoSeleccionado,
        desplegado1,
        totalGlobal,
        totalFormateado,
        route,
        router
    }
}