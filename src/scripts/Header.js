// header.js
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

export const cuentaRegresiva = ref('--:--:--')
export const turnoActual = ref('')
let globalHorasTurno = {}
let intervalId = null

export function useHeader() {
  const route = useRoute()
  const router = useRouter()

  const turnos = ['dia', 'tarde', 'noche']
  const horaActual = ref('--:--:--')

  const back = computed(() => route.path.startsWith('/home'))
  const bell = computed(() => route.path.startsWith('/'))

  const irfondo = () => {
    const authStore = useAuthStore()
    if (authStore.isAuthenticated && authStore.userType && authStore.userId) {
      router.push(`/fondo/${authStore.userId}`)
    } else {
      router.push('/')
    }
  }

  const cargarDesdeHoraCierreCache = () => {
    const cache = JSON.parse(localStorage.getItem('horaCierreCache') || '{}')

    for (const turno of turnos) {
      const datos = cache[turno]
      if (datos?.activo === true && typeof datos.hora === 'string') {
        const [h, m] = datos.hora.split(':').map(Number)
        const hora = new Date()
        hora.setHours(h, m, 0, 0)
        globalHorasTurno[turno] = hora
      } else {
        globalHorasTurno[turno] = null
      }
    }
  }

  const calcularTiempoRestante = (ahora) => {
    horaActual.value = ahora.toLocaleTimeString('es-ES', { hour12: false })

    let menorDiferencia = Infinity
    let nuevoTurnoActual = ''

    for (const [turno, horaObj] of Object.entries(globalHorasTurno)) {
      if (!horaObj) continue

      const targetHoy = new Date(ahora)
      targetHoy.setHours(horaObj.getHours(), horaObj.getMinutes(), 0, 0)

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

  onMounted(() => {
    cargarDesdeHoraCierreCache()

    if (!intervalId) {
      intervalId = setInterval(() => {
        calcularTiempoRestante(new Date())
      }, 1000)
    }
  })

  onUnmounted(() => {
    if (intervalId) {
      clearInterval(intervalId)
      intervalId = null
    }
  })

  return {
    back,
    bell,
    cuentaRegresiva,
    irfondo,
    turnoActual
  }
}
