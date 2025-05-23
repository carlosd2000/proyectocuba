<script setup>
import { onMounted, onUnmounted, ref, computed, watch } from 'vue'
import Swal from 'sweetalert2'
import { apuestas, obtenerApuestas, eliminarApuesta, sincronizarEliminaciones } from '../scripts/CRUDlistas.js'
import { useRouter, useRoute} from 'vue-router' 
import { sincronizarPendientes } from '../scripts/añadir.js'

const router = useRouter()
const route = useRoute()

const props = defineProps({
  fecha: {
    type: Date,
    required: true
  }
})

// Variables reactivas
const mostrarModal = ref(false)
const mostrarConfirmacionEliminar = ref(false)
const personaSeleccionada = ref(null)
const isOnline = ref(navigator.onLine)
const isSyncing = ref(false)

// Apuestas locales (offline)
const apuestasLocales = ref([])


// Función para comparar fechas (solo día, mes, año)
const esMismoDia = (fechaA, fechaB) => {
  const a = new Date(fechaA)
  const b = new Date(fechaB)
  return a.getFullYear() === b.getFullYear() &&
         a.getMonth() === b.getMonth() &&
         a.getDate() === b.getDate()
}

// Función para obtener icono de estado
const obtenerIconoEstado = (persona) => {
  if (!persona || !persona.estado) return 'bi bi-cloud-check text-success'
  
  switch(persona.estado) {
    default: case 'Cargado': return 'bi bi-cloud-check text-success'
    case 'Pendiente': return 'bi bi-cloud-slash text-danger'
    case 'EnTiempo': return 'bi bi-stopwatch text-success'
    case 'FueraDeTiempo': return 'bi bi-stopwatch text-danger'
  }
}

// Cargar apuestas locales desde localStorage
function cargarApuestasLocales() {
  try {
    const eliminacionesPermanentes = JSON.parse(localStorage.getItem('eliminacionesPermanentes') || '{}');
    const pendientes = JSON.parse(localStorage.getItem('apuestasPendientes') || '[]');
    
    apuestasLocales.value = pendientes
      .filter(a => !eliminacionesPermanentes[a.uuid])
      .map(a => ({
        ...a,
        estado: 'Pendiente',
        id: a.uuid,
        uuid: a.uuid,
        totalGlobal: Number(a.totalGlobal) || 0, // Asegúrate de que sea numérico
        candadoAbierto: a.candadoAbierto ?? false,
      }));
  } catch (error) {
    console.error('Error cargando apuestas locales:', error);
    apuestasLocales.value = [];
  }
}
// Función para mostrar la hora (CORREGIDA)
const mostrarHora = (persona) => {
  if (!persona || typeof persona !== 'object') return "--:-- --"

  const opciones = {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: 'America/Havana' // Huso horario de Cuba
  };

  const formatearHora = (fecha) => {
    if (!fecha) return "--:-- --";
    const fechaObj = typeof fecha === 'string' ? new Date(fecha) : fecha.toDate?.() || fecha;
    return fechaObj.toLocaleTimeString('es-ES', opciones);
  };

  if (persona.sincronizadoEn) {
    return formatearHora(persona.sincronizadoEn);
  }

  if (persona.estado === 'Pendiente' && persona.creadoEn) {
    return formatearHora(persona.creadoEn);
  }

  if (persona.creadoEn) {
    return formatearHora(persona.creadoEn);
  }

  return "--:-- --"
}

// Combina y ordena apuestas, filtrando por la fecha seleccionada
const apuestasCombinadas = computed(() => {
  const firebaseUuids = new Set(apuestas.value.map(a => a.uuid))
  const localesFiltradas = apuestasLocales.value.filter(local => 
    !firebaseUuids.has(local.uuid)
  )
  return [...apuestas.value, ...localesFiltradas]
    .filter(a => {
      let fecha = a.creadoEn?.seconds ? new Date(a.creadoEn.seconds * 1000) :
                  a.creadoEn?.toDate ? a.creadoEn.toDate() :
                  a.creadoEn ? new Date(a.creadoEn) : null;
      return fecha && esMismoDia(fecha, props.fecha)
    })
    .sort((a, b) => {
      if (a.estado === 'Pendiente') return -1
      if (b.estado === 'Pendiente') return 1
      return (b.creadoEn?.seconds || b.creadoEn?.getTime() || 0) - 
            (a.creadoEn?.seconds || a.creadoEn?.getTime() || 0)
    })
})

// Actualizar estado de conexión
const updateOnlineStatus = () => {
  isOnline.value = navigator.onLine;
  if (isOnline.value) {
    isSyncing.value = true;
    Promise.all([
      sincronizarPendientes(),
      sincronizarEliminaciones()
    ]).finally(() => {
      isSyncing.value = false;
      cargarApuestasLocales();
    });
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
  const esPendiente = personaSeleccionada.value.estado === 'Pendiente';
  
  router.push({
    path: `/anadirjugada/${route.params.id}`,
    query: {
      tipo: tipoJugada,
      editar: esPendiente ? personaSeleccionada.value.uuid : personaSeleccionada.value.id,
      esPendiente: esPendiente.toString()
    }
  });
  cerrarModal();
};

const eliminarPersona = async () => {
  try {
    const id = personaSeleccionada.value.id;
    const esPendiente = personaSeleccionada.value.estado === 'Pendiente';
    
    // Eliminar visualmente INMEDIATAMENTE
    if (esPendiente) {
      apuestasLocales.value = apuestasLocales.value.filter(a => a.uuid !== id);
      
      // Eliminar COMPLETAMENTE de localStorage
      const pendientes = JSON.parse(localStorage.getItem('apuestasPendientes') || '[]');
      const nuevasPendientes = pendientes.filter(p => p.uuid !== id);
      localStorage.setItem('apuestasPendientes', JSON.stringify(nuevasPendientes));
      
      // Crear registro de eliminación permanente
      const eliminacionesPermanentes = JSON.parse(localStorage.getItem('eliminacionesPermanentes') || '{}');
      eliminacionesPermanentes[id] = true;
      localStorage.setItem('eliminacionesPermanentes', JSON.stringify(eliminacionesPermanentes));
    } else {
      apuestas.value = apuestas.value.filter(a => a.id !== id);
    }
    
    // Llamar a la función de eliminación
    const { success } = await eliminarApuesta(id, esPendiente);
    
    if (!success) {
      throw new Error('No se pudo completar la eliminación');
    }
    
    // Cerrar modales
    mostrarConfirmacionEliminar.value = false;
    mostrarModal.value = false;
    
    Swal.fire({
      icon: 'success',
      title: '¡Eliminada!',
      text: 'La apuesta fue removida',
      timer: 1500,
      showConfirmButton: false
    });
  } catch (error) {
    console.error('Error en eliminarPersona:', error);
    
    // Revertir cambios visuales si falló
    if (esPendiente) {
      cargarApuestasLocales();
    } else {
      obtenerApuestas();
    }
    
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'No se pudo eliminar la apuesta',
      timer: 2000
    });
  }
}

const confirmarEliminar = () => {
  mostrarConfirmacionEliminar.value = true
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
    sincronizarEliminaciones()
      .then(sincronizarPendientes)
      .finally(() => {
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

const apuestasFiltradas = computed(() =>
  apuestas.value.filter(a => {
    let fecha = a.creadoEn?.seconds ? new Date(a.creadoEn.seconds * 1000) :
                a.creadoEn?.toDate ? a.creadoEn.toDate() :
                a.creadoEn ? new Date(a.creadoEn) : null;
    return fecha && esMismoDia(fecha, props.fecha)
  })
)
</script>

<template>
  <div class="m-0 p-0">
    <div v-for="persona in apuestasCombinadas" 
         :key="persona.id" 
         class="col-12 m-0 mb-2 p-0 pt-2 pb-2 persona" 
         @click="cuadroClick(persona)" 
         style="cursor: pointer;"
         :class="{ 'apuesta-pendiente': persona.estado === 'Pendiente' }">
         
      <header class="col-12 row m-0 px-1 py-2">
        <div class="col-10 -flex justify-content-start align-items-center">
          <p class="name">{{ persona.nombre }}</p>
        </div>
        <div class="col-2 m-0 p-0 d-flex justify-content-center align-items-center" @click.stop>
          <i :class="['bi', persona.candadoAbierto ? 'bi-unlock text-success' : 'bi-lock text-danger']"
             class="fs-4"
             style="cursor: pointer;"></i>
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
                <p class="m-1">{{ Number(persona.totalGlobal) || 0 }}</p>
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
p.name{
  font-size: 1.1rem;
}
i.bi{
  font-size: 1.3rem;
}
.container-number-cuadrado {
  width: 37px;
  height: 25px;
  font-size: 1.1rem;
  background-color: #f1f1f1;
}
.container-number {
  width: 25px;
  height: 25px;
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
  transition: all 0.3s ease;
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

.custom-modal-aceptar {
  background-color: #1e1e2f;
  color: #fff;
  padding: 20px;
  border-radius: 12px;
  width: 90%;
  max-width: 400px;
  text-align: center;
  box-shadow: 0 0 12px rgba(0, 0, 0, 0.4);
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

.btn.eliminar-confirmar {
  background-color: #ff0000;
  color: rgb(255, 255, 255);
}

.btn:hover {
  opacity: 0.8;
  font-weight: bold;
}

.persona {
  transition: all 0.3s ease;
}
.persona.eliminando {
  transform: scale(0.9);
  opacity: 0;
}

.eliminando {
  transform: scale(0.8);
  opacity: 0;
  height: 0;
  padding: 0;
  margin: 0;
  border: none;
  overflow: hidden;
  transition: all 0.3s ease;
}
</style>