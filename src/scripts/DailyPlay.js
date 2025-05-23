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

// Router
    const route = useRoute()
    const router = useRouter()

// Mostrar total con formato
    const totalFormateado = computed(() => {
        return `$${totalGlobal.value.toLocaleString('es-CO', { minimumFractionDigits: 2 })}`
    })

// Listener actual de Firebase
    let unsubscribe = null

    // Función optimizada para escuchar cambios
    const escucharCambios = () => {
        if (unsubscribe) unsubscribe()

        const q = query(apuestasRef, where('horario', '==', turnoSeleccionado.value))
        unsubscribe = onSnapshot(q, (snapshot) => {
        totalGlobal.value = snapshot.docs.reduce((sum, doc) => {
            const data = doc.data()
            return sum + (typeof data.totalGlobal === 'number' ? data.totalGlobal : 0)
        }, 0)
        }, (error) => {
        console.error("Error en listener de Firebase:", error)
        })
    }

// Watcher para cambios de turno
    watch(turnoSeleccionado, (nuevoHorario) => {
        setHorario(nuevoHorario)
        escucharCambios()
    })

    onMounted(() => {
        turnoSeleccionado.value = 'Dia'
        setHorario('Dia')
        escucharCambios()

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