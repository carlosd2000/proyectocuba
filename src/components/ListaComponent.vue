<script setup>
import { toRef, reactive, watch, computed } from 'vue'
import useLista from '../scripts/Lista.js'
import { useRouter, useRoute } from 'vue-router'
import Swal from 'sweetalert2'

const router = useRouter()
const route = useRoute()

const props = defineProps({
  fecha: Date,
  horario: String,
  candadoAbierto: Boolean,
  apuestas: Array,
  opcionSeleccionada: String // Nuevo prop para saber si estamos en "Lista" o "Bote"
})

const fechaRef = toRef(props, 'fecha')
const detallesVisibles = reactive(new Set())
const valorBote = computed(() => Number(localStorage.getItem('valorBote')) || 100)

const toggleDetalles = (personaId) => {
  if (detallesVisibles.has(personaId)) {
    detallesVisibles.delete(personaId)
  } else {
    detallesVisibles.add(personaId)
  }
}

const {
  mostrarModal,
  mostrarConfirmacionEliminar,
  personaSeleccionada,
  isOnline,
  isSyncing,
  apuestasLocales,
  apuestasCombinadas,
  cuadroClick,
  cerrarModal,
  editarPersona,
  eliminarPersona,
  confirmarEliminar,
  mostrarHora,
  obtenerIconoEstado
} = useLista(fechaRef, router, route)

// Función para verificar si supera el bote
const superaBote = (apuesta) => {
  // Verificar círculo solo
  if (apuesta.circuloSolo && Number(apuesta.circuloSolo) > valorBote.value) {
    return true
  }
  
  // Verificar datos de apuesta
  if (apuesta.datos) {
    return apuesta.datos.some(d => {
      const c1 = d.circulo1 ? Number(d.circulo1) : 0
      const c2 = d.circulo2 ? Number(d.circulo2) : 0
      return c1 > valorBote.value || c2 > valorBote.value
    })
  }
  return false
}

// Filtramos las apuestas por horario Y por bote
const apuestasFiltradas = computed(() => {
  return apuestasCombinadas.value.filter(apuesta => {
    // Primero filtramos por horario
    const mismoHorario = apuesta.horario?.toLowerCase() === props.horario?.toLowerCase()
    if (!mismoHorario) return false
    
    // Luego aplicamos filtro de bote según la opción
    if (props.opcionSeleccionada === 'Bote') {
      return superaBote(apuesta)
    } else if (props.opcionSeleccionada === 'Lista') {
      return !superaBote(apuesta)
    }
    return true
  })
})

// Watcher para sincronizar cambios (se mantiene igual)
watch(apuestasCombinadas, (newVal) => {
  props.apuestas.splice(0, props.apuestas.length, ...newVal)
}, { deep: true })

const handleEditClick = (persona, event) => {
  event.stopPropagation()
  if (props.candadoAbierto || persona.estado === 'Pendiente' || persona.estado === 'EditadoOffline') {
    cuadroClick(persona)
  } else {
    Swal.fire({
      icon: 'warning',
      title: 'Acción no disponible',
      text: 'El candado está cerrado y no puedes editar esta apuesta',
      timer: 1500
    })
  }
}
</script>

<!-- El resto del template y estilos se mantiene EXACTAMENTE IGUAL -->

<template>
  <div v-if="!isOnline" class="offline-banner bg-warning text-center p-1 mb-1">
    Modo offline - mostrando datos cacheados
    <span v-if="isSyncing" class="ms-2">Sincronizando...</span>
  </div>
  
  <div v-if="!apuestasFiltradas.length" class="d-flex justify-content-center align-items-center h-100">
    <h5 class="body">
      Aún no hay jugadas en la lista
    </h5>
  </div>
  
  <div v-for="persona in apuestasFiltradas" 
       :key="`${persona.id}-${persona.estado}-${persona.sincronizadoEn || persona.creadoEn}`"
       class="container-list" 
       style="cursor: pointer;" 
       :class="{ 
         'apuesta-pendiente': persona.estado === 'Pendiente',
         'apuesta-editada': persona.estado === 'EditadoOffline',
         'eliminando': persona.estado === 'Eliminando'
       }">
    
    <header class="d-flex flex-row justify-content-between align-items-center h-100" @click="toggleDetalles(persona.id)">
      <div class="container-title d-flex justify-content-center align-items-center">
        <h5 class="body">{{ persona.nombre }}</h5>
      </div>
      <div class="container-cloud d-flex flex-row justify-content-center align-items-center">
        <img :src="obtenerIconoEstado(persona)" alt="">
        <h5 class="small">{{ mostrarHora(persona) }}</h5>
        <img src="../assets/icons/Expand.svg" alt="">
      </div>
    </header>
    
    <main v-if="detallesVisibles.has(persona.id)" class="row m-0 p-0 w-100 gap-1">
      <div class="col-12 container-apuestas p-0 py-1 d-flex flex-row justify-content-center align-items-center">
        <div class="col-1 d-flex justify-content-center align-items-start h-100">
          <div
            class="container-edit-button my-2"
            :class="{ 'disabled': !candadoAbierto}"
            @click="handleEditClick(persona, $event)"
          >
            <img src="../assets/icons/Editar.svg" alt="">
          </div>
        </div>
        <div class="col-8 apuestas d-flex flex-column justify-content-center align-items-start">
          <div v-for="(mapa, index) in persona.datos" :key="index" class="my-1 w-100">
            <div class="d-flex align-items-center flex-wrap justify-content-around container-line">
              <div class="col-4">
                <div v-if="'cuadrado' in mapa" class="d-flex justify-content-center align-items-center container-number">
                  <p class="label d-flex justify-content-center align-items-center">
                    {{ mapa['cuadrado'] }}
                  </p>
                </div>
              </div>
              <div class="col-3">
                <div v-if="'circulo1' in mapa" class="d-flex justify-content-center align-items-center container-number">
                  <p class="label d-flex justify-content-center align-items-center">
                    {{ mapa['circulo1'] }}
                  </p>
                </div>
              </div>
              <div class="col-3">
                <div v-if="'circulo2' in mapa" class="d-flex justify-content-center align-items-center container-number">
                  <p class="label d-flex justify-content-center align-items-center">
                    {{ mapa['circulo2'] }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-2 d-flex justify-content-center align-items-center">
          <div v-if="persona.circuloSolo !== undefined && persona.circuloSolo !== null" class="d-flex justify-content-center align-items-center container-number">
            <h5 class="label">{{ persona.circuloSolo }}</h5>
          </div>
        </div>
      </div>
      
      <div class="line"></div>
      
      <div class="p-2 d-flex flex-row justify-content-between align-items-center w-100">
        <div class="d-flex flex-column justify-content-center align-items-center gap-1">
          <h5 class="label">${{ Number(persona.totalGlobal) || 0 }}</h5>
          <div class="d-flex flex-row justify-content-center align-items-center gap-1">
            <img src="../assets/icons/Coin.svg" alt="">
            <h5 class="body">Bruto</h5>
          </div>
        </div>
        <div class="d-flex flex-column justify-content-center align-items-center gap-1">
          <h5 class="label">${{ Number(persona.totalGlobal) || 0 }}</h5>
          <div class="d-flex flex-row justify-content-center align-items-center gap-1">
            <img src="../assets/icons/Star.svg" alt="">
            <h5 class="body">Premio</h5>
          </div>
        </div>
        <div class="d-flex flex-column justify-content-center align-items-center gap-1">
          <h5 class="label">${{ Number(persona.totalGlobal) - Number(persona.totalGlobal) }}</h5>
          <div class="d-flex flex-row justify-content-center align-items-center gap-1">
            <img src="../assets/icons/Ganancia.svg" alt="">
            <h5 class="body">Neto</h5>
          </div>
        </div>
      </div>
    </main>
    
    <footer class="col-12 m-0 p-0 d-flex justify-conten-center align-items-center">
      <div class="col-12 m-0 p-0 d-flex justify-content-end align-items-center">
        <div class="mx-2 d-flex justify-content-center align-items-center">
          <i class="icon-estado" :class="obtenerIconoEstado(persona)"></i>
          <span v-if="!isOnline && persona.estado !== 'Pendiente' && persona.estado !== 'EditadoOffline'" 
                class="ms-1 badge bg-warning text-dark">Offline</span>
          <span v-if="persona.estado === 'Pendiente'" 
                class="ms-1 badge bg-primary text-white">Pendiente</span>
          <span v-if="persona.estado === 'EditadoOffline'" 
                class="ms-1 badge bg-info text-dark">Editada</span>
        </div>
      </div>
    </footer>
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
.line {
  width: 343px;
  height: 2px;
  border: 1px solid #F0F0FC;
  flex: none;
  flex-grow: 0;
}

.small, .body {
  color: #696974;
}

.container-cloud {
  gap: 6px;
}

.container-title {
  max-width: 200px;
}

@media (max-width: 375px) {
  .container-title {
    max-width: 140px;
  }
}

.container-apuestas {
  gap: 12px;
  flex: none;
  flex-grow: 0;
}

.container-list {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 16px;
  gap: 12px;
  height: auto;
  width: 100%;
  max-width: 500px;
  border: 1px solid #F3F3F3;
  border-radius: 12px;
  flex: none;
  flex-grow: 0;
  transition: all 0.3s ease;
}

.container-line {
  gap: 8px;
}

.container-edit-button {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 0px;
  gap: 10px;
  width: 28px;
  height: 28px;
  background: #E0E0F8;
  border-radius: 30px;
  flex: none;
  order: 0;
  flex-grow: 0;
  cursor: pointer;
}

.container-edit-button.disabled {
  opacity: 0.5;
  pointer-events: none;
}

.offline-banner {
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.container-number {
  padding: 8px 16px;
  gap: 16px;
  width: 55px;
  background: #F3F3F3;
  border-radius: 30px;
  flex: none;
  flex-grow: 0;
}

.apuesta-pendiente {
  background-color: #fff8e1;
  border: 2px dashed #ffc107;
}

.apuesta-editada {
  background-color: #e1f5fe;
  border: 2px dashed #03a9f4;
}

.apuestas {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
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
  background-color: #bdbdbd;
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
  border: 1px solid #000000;
  border-radius: 6px;
  cursor: pointer;
  transition: 0.3s;
}

.btn.editar {
  background-color: #fffb18;
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

.eliminando {
  transform: scale(0.95);
  opacity: 0;
  height: 0;
  padding: 0;
  margin: 0;
  overflow: hidden;
  transition: all 0.3s ease;
  border: none;
}

.badge {
  font-size: 0.7rem;
  padding: 0.25em 0.4em;
  border-radius: 0.25rem;
  font-weight: 500;
}
</style>