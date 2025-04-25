<template>
  <div class="d-flex flex-column justify-content-center align-items-center">
    <div class="col-12 row p-0 m-0 d-flex justify-content-center align-items-center header-border">
      <div class="col-5 m-0 p-0 d-flex justify-content-start align-items-center">
        <ButtonBack class="col-3 ml-2 d-flex justify-content-center" v-if="!back"/>
        <p class="col-8 m-0 p-1 ml-2">{{ cuentaRegresiva || 'hh:mm:ss' }}</p>
        <p class="ms-2">{{ horaActual }} ({{ turnoActual }})</p>
      </div>
      <div class="col-7 row p-1 m-0 d-flex justify-content-end align-items-center">
        <button class="btn btn-light border-0 p-0 bg-transparent" @click="$router.push('/listeros')">
          <p class="m-0 p-1">$20,000,000.00</p>
        </button>
        
        <div class="col-2 p-2 m-0 mr-2 d-flex justify-content-end align-items-center" v-if="bell">
          <i class="bi bi-bell"></i>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import ButtonBack from '../components/ButtonBack.vue'
import { useRoute } from 'vue-router'
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { db } from '../firebase/config'
import { doc, onSnapshot } from 'firebase/firestore'

const route = useRoute()
const turnos = ['dia', 'tarde', 'noche']
const turnoActual = ref('')
const horaTarget = ref(null)
const cuentaRegresiva = ref('')
const horaActual = ref('--:--:--')

// Define reactividad para determinar si estamos en la página principal
const bell = computed(() => route.path === '/listeros')
const back = computed(() => route.path === '/listeros')

// Obtener la hora actual en Cuba (UTC-5 o UTC-4)
const getHoraCuba = () => {
  const ahora = new Date()
  const opciones = {
    timeZone: 'America/Havana',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }
  
  // Formatear y parsear para obtener hora local cubana
  const horaStr = new Intl.DateTimeFormat('es-ES', opciones).format(ahora)
  const [hh, mm, ss] = horaStr.split(':').map(Number)
  
  // Crear nueva fecha con hora cubana (en zona local)
  const horaCuba = new Date()
  horaCuba.setHours(hh, mm, ss)
  
  return {
    hora: hh,
    minuto: mm,
    segundo: ss,
    fecha: horaCuba,
    esHorarioVerano: () => {
      // Simplificación: Cuba usa horario de verano aprox. de marzo a noviembre
      const mes = horaCuba.getMonth()
      return mes >= 2 && mes <= 10
    }
  }
}

// Determinar el turno actual basado en la hora
const determinarTurnoActual = (horaCuba) => {
  const hora = horaCuba.hora
  
  if (hora >= 5 && hora < 12) return 'dia'     // Mañana: 5:00 - 11:59
  if (hora >= 12 && hora < 18) return 'tarde'  // Tarde: 12:00 - 17:59
  return 'noche'                              // Noche: 18:00 - 4:59
}

// Cargar datos de Firebase para el turno actual
const cargarHoraTurno = async (turno) => {
  try {
    const docRef = doc(db, 'hora', turno)
    const docSnap = await new Promise((resolve) => {
      const unsubscribe = onSnapshot(docRef, (doc) => {
        resolve(doc)
      })
    })
    
    if (docSnap.exists()) {
      const data = docSnap.data()
      horaTarget.value = {
        hh: parseInt(data.hh) || 0,
        mm: parseInt(data.mm) || 0,
        ss: parseInt(data.ss) || 0
      }
      turnoActual.value = turno
      console.log(`Hora objetivo actualizada para ${turno}:`, horaTarget.value)
    } else {
      console.log(`No se encontraron datos para el turno ${turno}`)
      horaTarget.value = null
      cuentaRegresiva.value = 'hh:mm:ss'
    }
  } catch (error) {
    console.error('Error al procesar los datos:', error)
    horaTarget.value = null
    cuentaRegresiva.value = 'Error'
  }
}

const actualizarRelojes = () => {
  const cubaTime = getHoraCuba()
  const nuevoTurno = determinarTurnoActual(cubaTime)
  
  // Actualizar hora actual mostrada
  horaActual.value = [
    cubaTime.hora.toString().padStart(2, '0'),
    cubaTime.minuto.toString().padStart(2, '0'),
    cubaTime.segundo.toString().padStart(2, '0')
  ].join(':')
  
  // Cambiar de turno si es necesario
  if (turnoActual.value !== nuevoTurno) {
    cargarHoraTurno(nuevoTurno)
  }
  
  // Calcular cuenta regresiva si tenemos hora objetivo
  if (horaTarget.value) {
    const ahora = cubaTime.fecha.getTime()
    const target = new Date(cubaTime.fecha)
    target.setHours(horaTarget.value.hh, horaTarget.value.mm, horaTarget.value.ss, 0)
    
    // Si la hora objetivo ya pasó hoy, calculamos para mañana
    if (target.getTime() < ahora) {
      target.setDate(target.getDate() + 1)
    }
    
    const diff = target.getTime() - ahora
    const horas = Math.floor(diff / (1000 * 60 * 60))
    const minutos = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    const segundos = Math.floor((diff % (1000 * 60)) / 1000)
    
    // Formatear con 2 dígitos
    cuentaRegresiva.value = [
      horas.toString().padStart(2, '0'),
      minutos.toString().padStart(2, '0'),
      segundos.toString().padStart(2, '0')
    ].join(':')
  }
}

// Configurar intervalos
let intervaloReloj
let intervaloCuentaRegresiva

onMounted(() => {
  // Inicializar con el turno actual
  const turnoInicial = determinarTurnoActual(getHoraCuba())
  cargarHoraTurno(turnoInicial)
  
  actualizarRelojes()
  intervaloReloj = setInterval(actualizarRelojes, 1000)
  intervaloCuentaRegresiva = setInterval(actualizarRelojes, 100)
})

onUnmounted(() => {
  clearInterval(intervaloReloj)
  clearInterval(intervaloCuentaRegresiva)
})
</script>

<style scoped>
/* Tus estilos existentes */
.header-border {
  border-bottom: 3px solid #000;
}
p {
  font-weight: 450;
  color: #000000;
  font-size: 1.1rem;
}
.ms-2 {
  margin-left: 0.5rem;
}
</style>