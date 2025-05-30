import { ref, computed, onMounted, watch, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getFirestore, collection, query, where, onSnapshot } from 'firebase/firestore'
import { setHorario } from '../scripts/añadir.js'
import { obtenerBancoPadre } from '../scripts/FunctionBancoPadre.js'

export function useDailyPlay() {
    const db = getFirestore()
    const bancoId = ref(null)
    const apuestasRef = ref(null)

    const opciones = ['Dia', 'Tarde', 'Noche']
    const turnoSeleccionado = ref('Dia')
    const desplegado1 = ref(true)
    const totalGlobal = ref(0)
    const isOnline = ref(navigator.onLine)
    const route = useRoute()
    const router = useRouter()

    // Sumar apuestas locales si está offline
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

    const totalFormateado = computed(() => {
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

    let unsubscribe = null

    // Escuchar cambios en la subcolección correcta
    const escucharCambios = () => {
        if (unsubscribe) unsubscribe()
        if (!bancoId.value) return
        apuestasRef.value = collection(db, 'bancos', bancoId.value, 'apuestas')
        const q = query(apuestasRef.value, where('horario', '==', turnoSeleccionado.value))
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
        if (isOnline.value && bancoId.value) {
            escucharCambios()
        } else {
            totalGlobal.value = 0
        }
    })

    function updateOnlineStatus() {
        isOnline.value = navigator.onLine
        if (isOnline.value && bancoId.value) {
            escucharCambios()
        }
    }

    onMounted(async () => {
        bancoId.value = await obtenerBancoPadre()
        if (isOnline.value && bancoId.value) {
            escucharCambios()
        }
        window.addEventListener('online', updateOnlineStatus)
        window.addEventListener('offline', updateOnlineStatus)
        window.addEventListener('apuestas-sincronizadas', () => {
            totalGlobal.value = 0
        })
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
            totalGlobal.value = 0
        })
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