import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { db } from '../firebase/config'
import { doc, onSnapshot } from 'firebase/firestore'
import { useAuthStore } from '@/stores/authStore'
import { obtenerBancoPadre } from '../scripts/FunctionBancoPadre.js'

// Refs globales y reactivas
export const cuentaRegresiva = ref('--:--:--')
export const turnoActual = ref('')
let globalHorasTurno = {}
let unsubscribeCallbacks = []
let intervalId = null

export function useHeader() {
    const route = useRoute()
    const router = useRouter()
    const authStore = useAuthStore()

    const turnos = ['dia', 'tarde', 'noche']
    const horaActual = ref('--:--:--')
    const bancoPadreId = ref(null)

    const back = computed(() => route.path.startsWith('/listeros'))
    const bell = computed(() => route.path.startsWith('/'))

    const irwallet = () => {
        if (authStore.isAuthenticated && authStore.userType && authStore.userId) {
            router.push(`/${authStore.userType}/${authStore.userId}`)
        } else {
            router.push('/')
        }
    }

    const calcularTiempoRestante = (ahora) => {
        horaActual.value = ahora.toLocaleTimeString('es-ES', { hour12: false })

        let menorDiferencia = Infinity
        let nuevoTurnoActual = ''

        for (const [turno, horaObj] of Object.entries(globalHorasTurno)) {
            if (!horaObj || typeof horaObj.getHours !== 'function') continue

            const targetHoy = new Date(ahora)
            targetHoy.setHours(horaObj.getHours(), horaObj.getMinutes(), horaObj.getSeconds(), 0)

            const targetManana = new Date(targetHoy)
            targetManana.setDate(targetHoy.getDate() + 1)

            const diffHoy = targetHoy - ahora
            const diffManana = targetManana - ahora

            if (diffHoy > 0 && diffHoy < menorDiferencia) {
                menorDiferencia = diffHoy
                nuevoTurnoActual = turno
            }
            if (diffManana > 0 && diffManana < menorDiferencia) {
                menorDiferencia = diffManana
                nuevoTurnoActual = turno
            }
        }

        if (menorDiferencia !== Infinity) {
            const horas = Math.floor(menorDiferencia / (1000 * 60 * 60))
            const minutos = Math.floor((menorDiferencia % (1000 * 60 * 60)) / (1000 * 60))
            const segundos = Math.floor((menorDiferencia % (1000 * 60)) / 1000)

            cuentaRegresiva.value = [
                horas.toString().padStart(2, '0'),
                minutos.toString().padStart(2, '0'),
                segundos.toString().padStart(2, '0')
            ].join(':')
            turnoActual.value = nuevoTurnoActual
        } else {
            cuentaRegresiva.value = '--:--:--'
            turnoActual.value = ''
        }
    }

    const suscribirHorasTurnos = async () => {
        if (!bancoPadreId.value) {
            bancoPadreId.value = await obtenerBancoPadre()
        }
        if (!bancoPadreId.value) return

        // Solo suscribir si no hay suscripciones activas
        if (unsubscribeCallbacks.length === 0) {
            for (const turno of turnos) {
                const docRef = doc(db, `bancos/${bancoPadreId.value}/hora`, turno)
                const unsubscribe = onSnapshot(docRef, (docSnap) => {
                    if (docSnap.exists()) {
                        const data = docSnap.data()
                        if (data.hora && typeof data.hora.toDate === 'function') {
                            globalHorasTurno[turno] = data.hora.toDate()
                        } else {
                            globalHorasTurno[turno] = null
                        }
                    }
                })
                unsubscribeCallbacks.push(unsubscribe)
            }
        }
    }

    onMounted(() => {
        // Solo iniciar el intervalo si no está activo
        if (!intervalId) {
            intervalId = setInterval(() => {
                calcularTiempoRestante(new Date())
            }, 1000)
        }
        suscribirHorasTurnos().catch(console.error)
    })

    onUnmounted(() => {
        // No limpiamos el intervalo aquí, se mantiene activo
    })

    // Función para limpiar todas las suscripciones (si alguna vez quieres limpiar todo)
    const limpiarSuscripciones = () => {
        unsubscribeCallbacks.forEach(unsubscribe => unsubscribe())
        unsubscribeCallbacks = []
        if (intervalId) {
            clearInterval(intervalId)
            intervalId = null
        }
    }

    return {
        back,
        bell,
        cuentaRegresiva,
        irwallet,
        turnoActual,
        limpiarSuscripciones
    }
}