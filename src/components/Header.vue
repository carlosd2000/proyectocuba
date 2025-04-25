<template>
  <div class="d-flex flex-column justify-content-center align-items-center">
    <div class="col-12 row p-0 m-0 d-flex justify-content-center align-items-center header-border">
      <div class="col-5 m-0 p-0 d-flex justify-content-start align-items-center">
        <ButtonBack class="col-3 ml-2 d-flex justify-content-center" v-if="!back"/>
        <p class="col-8 m-0 p-1 ml-2">{{ horaTotal || 'hh:mm:ss' }}</p>
        <p class="">{{ horaActual }}</p>
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
import { doc, onSnapshot } from 'firebase/firestore' // Cambiamos getDoc por onSnapshot

const route = useRoute()
const horaTotal = ref('')

// Define reactividad para determinar si estamos en la página principal
const bell = computed(() => route.path === '/listeros')
const back = computed(() => route.path === '/listeros')

// Obtener la hora al cargar el componente y suscribirse a cambios
onMounted(() => {
  const docRef = doc(db, 'hora', 'tarde')
  
  // Suscripción a cambios en tiempo real
  const unsubscribe = onSnapshot(docRef, (doc) => {
    try {
      if (doc.exists()) {
        const data = doc.data()
        // Formatear como hh:mm:ss
        horaTotal.value = `${data.hh || '00'}:${data.mm || '00'}:${data.ss || '00'}`
        console.log('Datos actualizados:', horaTotal.value)
      } else {
        console.log('No se encontraron datos para el turno tarde')
        horaTotal.value = 'hh:mm:ss'
      }
    } catch (error) {
      console.error('Error al procesar los datos:', error)
      horaTotal.value = 'Error'
    }
  })

  // Limpiar la suscripción cuando el componente se desmonte
  onUnmounted(unsubscribe)
})


// Obtener la hora actual
const horaActual = ref('--:--:--');
  // Zona horaria de Cuba (puede ser 'America/Havana' o 'Cuba')
const zonaHorariaCuba = 'America/Havana';
const actualizarHora = () => {
    const ahora = new Date();
    horaActual.value = ahora.toLocaleTimeString('es-ES', {
        timeZone: zonaHorariaCuba,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    });
};
let intervalo;
onMounted(() => {
    // Actualizar inmediatamente al montar el componente
    actualizarHora();
    // Actualizar cada segundo
    intervalo = setInterval(actualizarHora, 1000);
});
onUnmounted(() => {
    // Limpiar el intervalo cuando el componente se desmonte
    clearInterval(intervalo);
});

</script>

<style scoped>
.header-border {
  border-bottom: 3px solid #000;
}
p {
  font-weight: 450;
  color: #000000;
  font-size: 1.1rem;
}
</style>