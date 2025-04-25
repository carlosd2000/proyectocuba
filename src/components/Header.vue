<template>
  <div class="d-flex flex-column justify-content-center align-items-center">
    <div class="col-12 row p-0 m-0 d-flex justify-content-center align-items-center header-border">
      <div class="col-5 m-0 p-0 d-flex justify-content-start align-items-center">
        <ButtonBack class="col-3 ml-2 d-flex justify-content-center" v-if="!back"/>
        <p class="col-8 m-0 p-1 ml-2">{{ cuentaRegresiva || 'hh:mm:ss' }}</p>
        <p class="ms-2">{{ horaActual }}</p>
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
const horaTarget = ref(null)
const cuentaRegresiva = ref('')
const horaActual = ref('--:--:--')

// Define reactividad para determinar si estamos en la página principal
const bell = computed(() => route.path === '/listeros')
const back = computed(() => route.path === '/listeros')

// Obtener la hora objetivo desde Firebase
onMounted(() => {
  const docRef = doc(db, 'hora', 'tarde')
  
  const unsubscribe = onSnapshot(docRef, (doc) => {
    try {
      if (doc.exists()) {
        const data = doc.data()
        horaTarget.value = {
          hh: parseInt(data.hh) || 0,
          mm: parseInt(data.mm) || 0,
          ss: parseInt(data.ss) || 0
        }
        //console.log('Hora objetivo actualizada:', horaTarget.value)
      } else {
        //console.log('No se encontraron datos para el turno tarde')
        horaTarget.value = null
        cuentaRegresiva.value = 'hh:mm:ss'
      }
    } catch (error) {
      //console.error('Error al procesar los datos:', error)
      horaTarget.value = null
      cuentaRegresiva.value = 'Error'
    }
  })

  onUnmounted(unsubscribe)
})

// Función para calcular la hora actual en Cuba considerando el offset correcto
const getHoraCuba = () => {
  const ahora = new Date()
  // Ajustar a la zona horaria de Cuba (UTC-4 o UTC-5)
  const offset = ahora.getTimezoneOffset() / 60
  const offsetCuba = ahora.getHours() === 0 ? -5 : -4 // Simplificación (podemos usar una librería de timezone para precisión)
  const diff = offset + offsetCuba
  ahora.setHours(ahora.getHours() + diff)
  return ahora
}

const actualizarRelojes = () => {
  const ahoraCuba = getHoraCuba()
  
  // Actualizar hora actual mostrada
  horaActual.value = ahoraCuba.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  })
  
  // Calcular cuenta regresiva si tenemos hora objetivo
  if (horaTarget.value) {
    const target = new Date(ahoraCuba)
    target.setHours(horaTarget.value.hh, horaTarget.value.mm, horaTarget.value.ss, 0)
    
    // Si la hora objetivo ya pasó hoy, calculamos para mañana
    if (target < ahoraCuba) {
      target.setDate(target.getDate() + 1)
    }
    
    const diff = target - ahoraCuba
    
    // Calcular horas, minutos y segundos restantes
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