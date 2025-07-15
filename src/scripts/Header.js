import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { db } from '../firebase/config'
import { doc, getDoc } from 'firebase/firestore'
import { useAuthStore } from '@/stores/authStore'

export const cuentaRegresiva = ref('--:--:--')
export const turnoActual = ref('')
let globalHorasTurno = {}
let intervalId = null

export function useHeader() {
  const route = useRoute()
  const router = useRouter()
  const authStore = useAuthStore()

  const turnos = ['dia', 'tarde', 'noche']
  const horaActual = ref('--:--:--')
  const bancoPadreId = ref(null)

  const back = computed(() => route.path.startsWith('/home'))
  const bell = computed(() => route.path.startsWith('/'))

  const irfondo = () => {
    if (authStore.isAuthenticated && authStore.userType && authStore.userId) {
      router.push(`/fondo/${authStore.userId}`)
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

  const cargarDesdeLocalStorage = () => {
    const dataLocal = JSON.parse(localStorage.getItem('horasTurnos') || '{}')
    for (const turno of turnos) {
      if (dataLocal[turno]) {
        globalHorasTurno[turno] = new Date(dataLocal[turno])
      }
    }
  }

  const cargarHorasTurnos = async () => {
    try {
      bancoPadreId.value = authStore.bancoId
      if (!bancoPadreId.value) return

      for (const turno of turnos) {
        const docRef = doc(db, `bancos/${bancoPadreId.value}/hora`, turno)
        const docSnap = await getDoc(docRef)
        if (docSnap.exists()) {
          const data = docSnap.data()
          if (data.activo === true && data.hora && typeof data.hora.toDate === 'function') {
            const fechaHora = data.hora.toDate()
            globalHorasTurno[turno] = fechaHora

            const guardado = JSON.parse(localStorage.getItem('horasTurnos') || '{}')
            guardado[turno] = fechaHora.toISOString()
            localStorage.setItem('horasTurnos', JSON.stringify(guardado))
          } else {
            globalHorasTurno[turno] = null
          }
        }
      }
    } catch (error) {
      console.warn('No se pudieron cargar los horarios:', error)
      cargarDesdeLocalStorage()
    }
  }

  onMounted(() => {
    cargarDesdeLocalStorage()
    cargarHorasTurnos()

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
