import { computed, ref, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { db } from '../firebase/config'
import { doc, onSnapshot } from 'firebase/firestore'
import { useAuthStore } from '@/stores/authStore'

export function useHeader() {
    const route = useRoute()
    const router = useRouter()
    const authStore = useAuthStore()

    const turnos = ['dia', 'tarde', 'noche']
    const turnoActual = ref('')
    const cuentaRegresiva = ref('--:--:--')
    const horaActual = ref('--:--:--')
    const horasTurno = ref({})
    const horariosCerrados = ref(new Set()) // Nuevo: Track de horarios ya cerrados

    const back = computed(() => route.path.startsWith('/listeros'))
    const bell = computed(() => route.path.startsWith('/listeros'))

    const irwallet = () => {
        if (authStore.isAuthenticated && authStore.userType && authStore.userId) {
            router.push(`/${authStore.userType}/${authStore.userId}`)
        } else {
            router.push('/')
        }
    }

    const getFechaHoraCuba = () => {
        const ahora = new Date()
        const opciones = { timeZone: 'America/Havana', hour12: false }
        const formato = new Intl.DateTimeFormat('en-GB', {
            ...opciones,
            year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit', second: '2-digit'
        }).formatToParts(ahora)

        const partes = Object.fromEntries(formato.map(({ type, value }) => [type, value]))
        return new Date(`${partes.year}-${partes.month}-${partes.day}T${partes.hour}:${partes.minute}:${partes.second}`)
    }

    const cargarDesdeCache = () => {
        const cachedData = localStorage.getItem('cachedTurnosData')
        if (cachedData) {
            const { horasTurnoCache, turnoCache, cuentaRegresivaCache } = JSON.parse(cachedData)
            horasTurno.value = horasTurnoCache || {}
            turnoActual.value = turnoCache || ''
            cuentaRegresiva.value = cuentaRegresivaCache || '--:--:--'
        }
    }

    // Función mejorada para detectar cuando un horario ha terminado
    const calcularTiempoRestante = (ahora) => {
        horaActual.value = ahora.toLocaleTimeString('es-ES', { hour12: false })

        if (Object.keys(horasTurno.value).length === 0) return

        let menorDiferencia = Infinity
        let turnoCercano = ''
        let tiempoRestante = '--:--:--'
        let horarioTerminado = false

        for (const [turno, hora] of Object.entries(horasTurno.value)) {
            const targetHoy = new Date(ahora)
            targetHoy.setHours(hora.hh, hora.mm, hora.ss, 0)
            
            const targetManana = new Date(targetHoy)
            targetManana.setDate(targetHoy.getDate() + 1)
            
            const diffHoy = targetHoy - ahora
            const diffManana = targetManana - ahora
            
            // Verificar si el horario acaba de terminar (diferencia entre -1 y 0 segundos)
            if (diffHoy <= 0 && diffHoy > -1000 && !horariosCerrados.value.has(turno)) {
                console.log(`Horario ${turno} acaba de terminar!`)
                horariosCerrados.value.add(turno)
                horarioTerminado = true
                // Disparar evento global para notificar a otros componentes
                window.dispatchEvent(new CustomEvent('horario-cerrado', { 
                    detail: { turno } 
                }))
            }

            if (diffHoy > 0 && diffHoy < menorDiferencia) {
                menorDiferencia = diffHoy
                turnoCercano = turno
            }
            if (diffManana > 0 && diffManana < menorDiferencia) {
                menorDiferencia = diffManana
                turnoCercano = turno
            }
        }

        if (horarioTerminado) {
            // Forzar recálculo después de cerrar un horario
            setTimeout(() => calcularTiempoRestante(getFechaHoraCuba()), 1000)
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
            turnoActual.value = turnoCercano

            localStorage.setItem('cachedTurnosData', JSON.stringify({
                horasTurnoCache: horasTurno.value,
                turnoCache: turnoCercano,
                cuentaRegresivaCache: cuentaRegresiva.value
            }))
        } else {
            cuentaRegresiva.value = '--:--:--'
            turnoActual.value = ''
        }
    }

    const suscribirHorasTurnos = () => {
        for (const turno of turnos) {
            const docRef = doc(db, 'hora', turno)
            onSnapshot(docRef, (docSnap) => {
                if (docSnap.exists()) {
                    const data = docSnap.data()
                    horasTurno.value[turno] = {
                        hh: parseInt(data.hh) || 0,
                        mm: parseInt(data.mm) || 0,
                        ss: parseInt(data.ss) || 0
                    }
                    // Resetear el track de horarios cerrados cuando cambia la configuración
                    horariosCerrados.value.delete(turno)
                }
            })
        }
    }

    // Limpiar horarios cerrados al cambiar de día
    const limpiarHorariosCerrados = () => {
        const hoy = new Date().toDateString()
        if (horariosCerrados.value.fecha !== hoy) {
            horariosCerrados.value = new Set()
            horariosCerrados.value.fecha = hoy
        }
    }

    onMounted(() => {
        cargarDesdeCache()
        const ahora = getFechaHoraCuba()
        calcularTiempoRestante(ahora)
        suscribirHorasTurnos()
        limpiarHorariosCerrados()

        const intervalo = setInterval(() => {
            limpiarHorariosCerrados()
            calcularTiempoRestante(getFechaHoraCuba())
        }, 1000)

        onUnmounted(() => clearInterval(intervalo))
    })

    return {
        back,
        bell,
        cuentaRegresiva,
        irwallet,
        turnoActual // Exportamos para poder usarlo en otros componentes
    }
}