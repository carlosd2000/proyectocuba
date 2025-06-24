<script setup>
import { toRef, reactive } from 'vue'
import useLista from '../scripts/Lista.js' // ajusta la ruta si es diferente
import { useRouter, useRoute } from 'vue-router'

  const props = defineProps({
    fecha: {
      type: Date,
      required: true
    }
  })

const router = useRouter()
const route = useRoute()

const fechaRef = toRef(props, 'fecha')
const detallesVisibles = reactive(new Set()) // IDs con detalles visibles

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
  apuestasFiltradas,
  cuadroClick,
  cerrarModal,
  editarPersona,
  eliminarPersona,
  confirmarEliminar,
  mostrarHora,
  obtenerIconoEstado
} = useLista(fechaRef, router, route)
</script>


<template>
  <div class="d-flex flex-column justify-content-center align-items-center h-100 w-100 gap-2">
    <div v-if="!isOnline" class="offline-banner bg-warning text-center p-1 mb-1">
      <i class="bi bi-wifi-off"></i> Modo offline - mostrando solo apuestas locales
    </div>
    <div v-if="!apuestasCombinadas.length" >
      <h5 class="body">
        Aun no hay usuarios en la lista
      </h5>
    </div>
    <div v-for="persona in apuestasCombinadas" :key="persona.id" class="container-list" style="cursor: pointer;" :class="{ 'apuesta-pendiente': persona.estado === 'Pendiente' }">
      <header class="d-flex flex-row justify-content-between align-items-center" @click="toggleDetalles(persona.id)">
        <div class="d-flex justify-content-start align-items-center">
          <h5 class="body">{{ persona.nombre }}</h5>
        </div>
        <div>
          {{ persona.horario }}
        </div>
        <div class="container-cloud d-flex flex-row justify-content-end align-items-center w-100">
          <img :src="obtenerIconoEstado(persona)" alt="">
          <h5 class="small">{{ mostrarHora(persona) }}</h5>
          <img src="../assets/icons/Expand.svg" alt="">
        </div>
      </header>
      <main v-if="detallesVisibles.has(persona.id)" class="row m-0 p-0 w-100 gap-1">
        <div class="col-12 container-apuestas p-0 py-1 d-flex flex-row justify-content-center align-items-center">
          <div class="col-2 d-flex justify-content-center align-items-start h-100">
            <div class="container-edit-button my-2"  @click="cuadroClick(persona)">
              <img src="../assets/icons/Editar.svg" alt="">
            </div>
          </div>
          <div class="col-8 apuestas d-flex flex-column justify-content-center align-items-start">
            <div v-for="(mapa, index) in persona.datos" :key="index" class="my-2 w-100">
              <div class="d-flex align-items-center flex-wrap justify-content-around">
                <div class="col-5">
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
            <div v-if="persona.circuloSolo" class="label d-flex justify-content-center align-items-center container-number">
              {{ persona.circuloSolo }}
            </div>
          </div>
        </div>
        <div class="line"></div>
        <div class="p-2 d-flex flex-row justify-content-between align-items-center w-100">
          <div class="d-flex flex-column justify-content-center align-items-center">
            <h5 class="label">{{ Number(persona.totalGlobal) || 0 }}</h5>
            <div class="d-flex flex-row justify-content-center align-items-center gap-1">
              <img src="../assets/icons/Coin.svg" alt="">
              <h5 class="body">Bruto</h5>
            </div>
          </div>
          <div class="d-flex flex-column justify-content-center align-items-center">
            <h5 class="label">{{ Number(persona.totalGlobal) || 0 }}</h5>
            <div class="d-flex flex-row justify-content-center align-items-center gap-1">
              <img src="../assets/icons/Star.svg" alt="">
              <h5 class="body">Premio</h5>
            </div>
          </div>
          <div class="d-flex flex-column justify-content-center align-items-center">
            <h5 class="label">{{ Number(persona.totalGlobal) || 0 }}</h5>
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
.line{
  width: 343px;
  height: 2px;
  border: 1px solid #F0F0FC;
  flex: none;
  flex-grow: 0;
}
.small, .body{
  color: #696974;
}
.container-cloud{
  gap: 6px;
}
.container-apuestas{
  gap: 2px;
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
  width: 100%;
  max-width: 343px;
  border: 1px solid #F3F3F3;
  border-radius: 12px;
  flex: none;
  flex-grow: 0;
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
}
header{
  padding: 0px;
  gap: 12px;
  flex: none;
  flex-grow: 1;
}
.offline-banner{
  font-size: 0.8rem;
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
  transition: all 0.3s ease;
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