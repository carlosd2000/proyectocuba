import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { getFirestore, collection, query, where, onSnapshot } from 'firebase/firestore'
import { useRoute, useRouter } from 'vue-router'
import { setHorario } from '../scripts/añadir.js'

    export function useHorario(props) {
    // Firebase
    const db = getFirestore()
    const apuestasRef = collection(db, 'apuestas')

    // Router
    const route = useRoute()
    const router = useRouter()

    // Turnos disponibles
    const opciones = ['Dia', 'Tarde', 'Noche']
    const turnoSeleccionado = ref('Dia')

    // Total sumado
    const totalGlobal = ref(0)

    // Mostrar total con formato
    const totalFormateado = computed(() => {
        return `$${totalGlobal.value.toLocaleString('es-CO', { minimumFractionDigits: 2 })}`
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
        const q = query(apuestasRef, where('horario', '==', turnoSeleccionado.value))
        unsubscribe = onSnapshot(q, (snapshot) => {
        let suma = 0
        snapshot.forEach(doc => {
            const data = doc.data()
            if (typeof data.totalGlobal === 'number') {
            suma += data.totalGlobal
            }
        })
        totalGlobal.value = suma
        })
    }

    // Iniciar escucha al montar
    onMounted(() => {
        if (!props.modoEdicion) {
        turnoSeleccionado.value = 'Dia'
        setHorario('Dia')
        }
        escucharCambios()
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