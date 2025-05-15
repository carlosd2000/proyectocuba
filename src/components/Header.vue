<template>
  <div class="head d-flex flex-column justify-content-center align-items-center">
    <div class="col-12 row p-0 m-0 d-flex justify-content-center align-items-center header-border">
      <div class="col-5 m-0 p-0 d-flex justify-content-start align-items-center">
        <ButtonBack class="col-3 ml-2 d-flex justify-content-center" v-if="!back" />
        <p class="col-8 m-0 p-0 ml-2">{{ cuentaRegresiva || 'hh:mm:ss' }}</p>
      </div>
      <div class="col-7 row p-0 m-0 d-flex justify-content-end align-items-center">
        <button class=" btn btn-light border-0 mx-1 p-0 bg-transparent" @click="irwallet">
          <p class="m-0 p-0">$20,000,000.00</p>
        </button>

        <div class="px-1 m-0 mr-2 d-flex justify-content-end align-items-center" v-if="bell">
          <i class="bi bi-bell"></i>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import ButtonBack from '../components/ButtonBack.vue'
  import { useRoute, useRouter } from 'vue-router'
  import { computed, ref, onMounted, onUnmounted } from 'vue'
  import { db } from '../firebase/config'
  import { doc, onSnapshot } from 'firebase/firestore'
  import { useAuthStore } from '@/stores/authStore'

  // Variables
  const route = useRoute()
  const router = useRouter()
  const authStore = useAuthStore()

  const turnos = ['dia', 'tarde', 'noche']
  const turnoActual = ref('')
  const cuentaRegresiva = ref('--:--:--')
  const horaActual = ref('--:--:--')
  const horasTurno = ref({})

  // Bell y Back (corregido con startsWith)
  const back = computed(() => route.path.startsWith('/listeros'))
  const bell = computed(() => route.path.startsWith('/listeros'))

  const irwallet = () => {
    if (authStore.isAuthenticated && authStore.userType && authStore.userId) {
      router.push(`/${authStore.userType}/${authStore.userId}`)
    } else {
      router.push('/')
    }
  }


  // Obtener fecha y hora reales en Cuba
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

  // Cargar datos iniciales desde caché
  const cargarDesdeCache = () => {
    const cachedData = localStorage.getItem('cachedTurnosData')
    if (cachedData) {
      const { horasTurnoCache, turnoCache, cuentaRegresivaCache } = JSON.parse(cachedData)
      horasTurno.value = horasTurnoCache || {}
      turnoActual.value = turnoCache || ''
      cuentaRegresiva.value = cuentaRegresivaCache || '--:--:--'
    }
  }

  // Función para calcular el tiempo restante al turno más cercano
  const calcularTiempoRestante = (ahora) => {
    horaActual.value = ahora.toLocaleTimeString('es-ES', { hour12: false })

    if (Object.keys(horasTurno.value).length === 0) return

    let menorDiferencia = Infinity
    let turnoCercano = ''
    let tiempoRestante = '--:--:--'

    for (const [turno, hora] of Object.entries(horasTurno.value)) {
      const targetHoy = new Date(ahora)
      targetHoy.setHours(hora.hh, hora.mm, hora.ss, 0)
      
      const targetManana = new Date(targetHoy)
      targetManana.setDate(targetHoy.getDate() + 1)
      
      const diffHoy = targetHoy - ahora
      const diffManana = targetManana - ahora
      
      if (diffHoy > 0 && diffHoy < menorDiferencia) {
        menorDiferencia = diffHoy
        turnoCercano = turno
      }
      if (diffManana > 0 && diffManana < menorDiferencia) {
        menorDiferencia = diffManana
        turnoCercano = turno
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

  // Suscribir cambios en Firestore
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
        }
      })
    }
  }

  // Inicialización
  let intervalo
  onMounted(() => {
    cargarDesdeCache()
    const ahora = getFechaHoraCuba()
    calcularTiempoRestante(ahora)
    suscribirHorasTurnos()

    intervalo = setInterval(() => {
      calcularTiempoRestante(getFechaHoraCuba())
    }, 1000)
  })

  onUnmounted(() => clearInterval(intervalo))
</script>

<style scoped>
.header-border {
  border-bottom: 3px solid #000;
}
.head{
  height: 100%;
}
p {
  font-weight: 450;
  color: #000000;
  font-size: 1.1rem;
}
.ms-2 {
  margin-left: 0.5rem;
}
i{
  color: #000000;
}
</style>
