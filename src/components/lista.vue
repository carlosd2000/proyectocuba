<script setup>
import { onMounted, onUnmounted, ref, computed } from 'vue'
import Swal from 'sweetalert2'
import { apuestas, obtenerApuestas, eliminarApuesta } from '../scripts/CRUDlistas.js'
import { useRouter, useRoute} from 'vue-router' 
import { sincronizarPendientes, formatearHoraCuba } from '../scripts/añadir.js'

const router = useRouter()
const route = useRoute()

// Variables reactivas
const mostrarModal = ref(false)
const mostrarConfirmacionEliminar = ref(false)
const personaSeleccionada = ref(null)
const isOnline = ref(navigator.onLine)
const isSyncing = ref(false)

// Apuestas locales (offline)
const apuestasLocales = ref([])

// Función para obtener icono de estado
const obtenerIconoEstado = (persona) => {
  if (!persona || !persona.estado) return 'bi bi-exclamation-lg text-primary'
  
  switch(persona.estado) {
    case 'Cargado': return 'bi bi-cloud-check text-success'
    case 'Pendiente': return 'bi bi-cloud-slash text-danger'
    case 'EnTiempo': return 'bi bi-stopwatch text-success'
    case 'FueraDeTiempo': return 'bi bi-stopwatch text-danger'
    default: return 'bi bi-exclamation-lg text-primary'
  }
}

// Cargar apuestas locales desde localStorage
function cargarApuestasLocales() {
  const pendientes = JSON.parse(localStorage.getItem('apuestasPendientes') || '[]')
  apuestasLocales.value = pendientes.map(a => ({
    ...a,
    estado: 'Pendiente',
    id: a.uuid
  }))
}
// Función para mostrar la hora (CORREGIDA)
const mostrarHora = (persona) => {
  if (!persona || typeof persona !== 'object') return "--:-- --"

  if (persona.estado === 'Pendiente') {
    if (persona.horaCuba24) return formatearHoraCuba(persona.horaCuba24)
    if (persona.creadoEn) {
      const fecha = typeof persona.creadoEn === 'string' ? new Date(persona.creadoEn) : persona.creadoEn
      return fecha.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })
    }
    return "--:-- --"
  }

  if (persona.horaCuba12) return persona.horaCuba12
  if (persona.horaCuba24) return formatearHoraCuba(persona.horaCuba24)
  if (persona.creadoEn?.toDate) {
    return persona.creadoEn.toDate().toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  }

  return "--:-- --"
}

// Combina y ordena apuestas
const apuestasCombinadas = computed(() => {
  const firebaseUuids = new Set(apuestas.value.map(a => a.uuid))
  const localesFiltradas = apuestasLocales.value.filter(local => 
    !firebaseUuids.has(local.uuid)
  )
  
  return [...apuestas.value, ...localesFiltradas].sort((a, b) => {
    if (a.estado === 'Pendiente') return -1
    if (b.estado === 'Pendiente') return 1
    return (b.creadoEn?.seconds || b.creadoEn?.getTime() || 0) - 
           (a.creadoEn?.seconds || a.creadoEn?.getTime() || 0)
  })
})

// Actualizar estado de conexión
const updateOnlineStatus = () => {
  isOnline.value = navigator.onLine
  if (isOnline.value && !isSyncing.value) {
    isSyncing.value = true
    sincronizarPendientes().finally(() => {
      isSyncing.value = false
      cargarApuestasLocales()
    })
  }
}
// Resto de funciones del componente
const cuadroClick = (persona) => {
  if (!persona.candadoAbierto) return
  personaSeleccionada.value = persona
  mostrarModal.value = true
}

const cerrarModal = () => {
  mostrarModal.value = false
}

const editarPersona = async () => {
  const tipoJugada = personaSeleccionada.value.tipo.split('/')[0] || 'normal';
  router.push({
    path: `/anadirjugada/${route.params.id}`,
    query: {
      tipo: tipoJugada,
      editar: personaSeleccionada.value.id
    }
  });
  cerrarModal();
};

const eliminarPersona = async () => {
  await eliminarApuesta(personaSeleccionada.value.id)
  mostrarConfirmacionEliminar.value = false
  mostrarModal.value = false
}

const confirmarEliminar = () => {
  mostrarConfirmacionEliminar.value = true
}

const toggleCandado = async (persona) => {
  if (persona.candadoAbierto) {
    const result = await Swal.fire({
      title: '¿Deseas cerrar la apuesta?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí',
      cancelButtonText: 'Cancelar'
    })
    if (!result.isConfirmed) return
  }
  persona.candadoAbierto = !persona.candadoAbierto
}

// Suscripción a datos
let unsubscribe = null
onMounted(() => {
  unsubscribe = obtenerApuestas()
  cargarApuestasLocales()
  window.addEventListener('online', updateOnlineStatus)
  window.addEventListener('offline', updateOnlineStatus)
  window.addEventListener('storage', cargarApuestasLocales)
  
  if (navigator.onLine) {
    isSyncing.value = true
    sincronizarPendientes().finally(() => {
      isSyncing.value = false
    })
  }
})

onUnmounted(() => {
  if (unsubscribe) unsubscribe()
  window.removeEventListener('online', updateOnlineStatus)
  window.removeEventListener('offline', updateOnlineStatus)
  window.removeEventListener('storage', cargarApuestasLocales)
})
</script>

<template>
  <div class="m-0 p-0">
    <div v-for="persona in apuestasCombinadas" 
         :key="persona.id" 
         class="col-12 m-0 mb-2 p-0 pt-3 pb-2 persona" 
         @click="cuadroClick(persona)" 
         style="cursor: pointer;"
         :class="{ 'apuesta-pendiente': persona.estado === 'Pendiente' }">
         
      <header class="col-12 row m-0 p-0">
        <div class="col-10 -flex justify-content-start align-items-center">
          <p>{{ persona.nombre }}</p>
        </div>
        <div class="col-2 d-flex justify-content-end align-items-center" @click.stop>
          <i :class="['bi', persona.candadoAbierto ? 'bi-unlock text-success' : 'bi-lock text-danger']"
             class="fs-4"
             style="cursor: pointer;"
             @click="toggleCandado(persona)"></i>
        </div>
      </header>
      
      <main class="col-12 row m-0 p-0">
        <div class="col-6 m-0 p-0 apuestas d-flex flex-column justify-content-center align-items-start">
          <div class="col-12 m-0 p-0">
            <div v-for="(mapa, index) in persona.datos" :key="index" class="my-2">
              <div class="m-0 p-0 d-flex align-items-center flex-wrap">
                <div v-if="'cuadrado' in mapa" class="col-6 m-0 p-0 d-flex justify-content-center align-items-center">
                  <p class="m-0 p-0 d-flex justify-content-center align-items-center rounded container-number-cuadrado">
                    {{ mapa['cuadrado'] }}
                  </p>
                </div>
                <div class="col-3 m-0 p-0 d-flex justify-content-center align-items-center">
                  <p v-if="'circulo1' in mapa" class="m-0 p-0 d-flex justify-content-center align-items-center rounded-circle container-number">
                    {{ mapa['circulo1'] }}
                  </p>
                </div>
                <div class="col-3 m-0 p-0 d-flex justify-content-center align-items-center">
                  <p v-if="'circulo2' in mapa" class="m-0 p-0 d-flex justify-content-center align-items-center rounded-circle container-number">
                    {{ mapa['circulo2'] }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="col-2 m-0 p-0 d-flex justify-content-center align-items-center">
          <div v-if="persona.circuloSolo" class="m-0 p-0 d-flex justify-content-center align-items-center rounded-circle container-number">
            {{ persona.circuloSolo }}
          </div>
        </div>
        
        <div class="col-4 m-0 p-0 d-flex justify-content-center align-items-center">
          <div class="col-12 m-0 p-0 d-flex flex-column justify-content-center align-items-center">
            <div class="col-12 m-0 p-0 d-flex justify-content-around align-items-center">
              <div class="col-6 m-0 p-0 d-flex justify-content-center align-items-center">
                <i class="bi bi-coin m-1"></i>
              </div>
              <div class="col-6 m-0 p-0 d-flex justify-content-start align-items-center">
                <p class="m-1">{{ persona.totalGlobal }}</p>
              </div>
            </div>
            <div class="col-12 m-0 p-0 flex d-flex flex-column justify-content-center align-items-center">
              <div class="col-12 m-0 p-0 d-flex justify-content-around align-items-center">
                <div class="col-6 m-0 p-0 d-flex justify-content-center align-items-center">
                  <i class="bi bi-award-fill"></i>
                </div>
                <div class="col-6 m-0 p-0 d-flex justify-content-start align-items-center">
                  <p class="m-1">-</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <footer class="col-12 m-0 p-0 d-flex justify-conten-center align-items-center">
        <div class="col-12 m-0 p-0 d-flex justify-content-end align-items-center">
          <div class="mx-2 d-flex justify-content-center align-items-center">
            <p class="hora-text">{{ mostrarHora(persona) }}</p>
            <i :class="obtenerIconoEstado(persona)"></i>
            <span v-if="!isOnline && persona.estado !== 'Pendiente'" class="ms-1 badge bg-warning text-dark">Offline</span>
          </div>
        </div>
      </footer>
    </div>
  </div>

  <!-- Modal personalizado -->
  <div v-if="mostrarModal" class="custom-modal-backdrop" @click="cerrarModal">
    <div class="custom-modal" @click.stop>
      <div class="button-group">
        <button @click="editarPersona" class="btn editar btn-page">
          <i class="bi bi-pencil-fill"></i>
          Editar
        </button>
        <button @click="confirmarEliminar" class="btn eliminar">
          <i class="bi bi-trash3"></i>
          Eliminar
        </button>
      </div>
    </div>
  </div>

  <!-- Modal de confirmación de eliminación -->
  <div v-if="mostrarConfirmacionEliminar" class="custom-modal-backdrop" @click="mostrarConfirmacionEliminar = false">
    <div class="custom-modal-aceptar" @click.stop>
      <h3>¿Estás seguro de eliminar a {{ personaSeleccionada?.nombre }}?</h3>
      <div class="button-group">
        <button @click="eliminarPersona" class="btn eliminar-confirmar">Sí, eliminar</button>
        <button @click="mostrarConfirmacionEliminar = false" class="btn cancelar">Cancelar</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
p {
  margin: 0px;
  padding: 0px;
  font-size: 0.9rem;
}
.container-number-cuadrado {
  width: 42px;
  height: 30px;
  font-size: 1.1rem;
  background-color: #f1f1f1;
}
.container-number {
  width: 30px;
  height: 30px;
  background-color: #f1f1f1;
}
.persona {
  background: white;
  border-radius: 8px;
  border: #000 solid 2px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.305);
  padding: 10px;
}
.apuesta-pendiente {
  background-color: #fff8e1;
  border: 2px dashed #ffc107;
}
.apuestas {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
}
.hora-text {
  font-size: 0.7rem;
}

.custom-modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(117, 117, 117, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.custom-modal {
  background-color: transparent;
  padding: 10px;
  border-radius: 12px;
  width: 95%;
  max-width: 400px;
  text-align: center;
}

.button-group {
  display: flex;
  justify-content: space-around;
  margin-top: 1.5rem;
}

.btn {
  padding: 5px 15px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: 0.3s;
}

.btn.editar {
  border: #000 solid 3px;
  color: rgb(0, 0, 0);
}

.btn.eliminar {
  background-color: #e2e2e2;
  color: rgb(0, 0, 0);
}

.btn:hover {
  opacity: 0.8;
  font-weight: bold;
}

.badge {
  font-size: 0.6rem;
  padding: 0.2em 0.4em;
}
</style>