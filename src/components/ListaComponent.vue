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
  <div class="m-0 p-0">
    <div v-if="!isOnline" class="offline-banner bg-warning text-center p-1 mb-1">
      <i class="bi bi-wifi-off"></i> Modo offline - mostrando solo apuestas locales
      
    </div>
    <div v-if="!apuestasCombinadas" >
      <h3>
        No hay apuestas para el dia de hoy
      </h3>
    </div>
    <div v-for="persona in apuestasCombinadas" :key="persona.id" class="container-list" @click="cuadroClick(persona)" style="cursor: pointer;" :class="{ 'apuesta-pendiente': persona.estado === 'Pendiente' }">
      <header class="d-flex flex-row justify-content-between align-items-center" @click="toggleDetalles(persona.id)">
        <div class="d-flex justify-content-start align-items-center">
          <p class="name">{{ persona.nombre }}</p>
        </div>
        <div class="container-cloud d-flex flex-row justify-content-end align-items-center w-100">
          <img :src="obtenerIconoEstado(persona)" alt="">
          <p class="hora-text">{{ mostrarHora(persona) }}</p>
          <img src="../assets/Expand.svg" alt="">
        </div>
      </header>
      <main v-if="detallesVisibles.has(persona.id)" class="row m-0 p-0 w-100">
        <div class="col-12 container-apuestas p-0 d-flex flex-row justify-content-center align-items-center">
          <div class="col-9 apuestas d-flex flex-column justify-content-center align-items-start">
            <div v-for="(mapa, index) in persona.datos" :key="index" class="my-2 w-100">
              <div class="d-flex align-items-center flex-wrap">
                <div v-if="'cuadrado' in mapa" class="col-6 m-0 p-0 d-flex justify-content-center align-items-center">
                  <p class="d-flex justify-content-center align-items-center container-number">
                    {{ mapa['cuadrado'] }}
                  </p>
                </div>
                <div class="col-3 m-0 p-0 d-flex justify-content-center align-items-center">
                  <p v-if="'circulo1' in mapa" class="d-flex justify-content-center align-items-center container-number">
                    {{ mapa['circulo1'] }}
                  </p>
                </div>
                <div class="col-3 m-0 p-0 d-flex justify-content-center align-items-center">
                  <p v-if="'circulo2' in mapa" class="d-flex justify-content-center align-items-center container-number">
                    {{ mapa['circulo2'] }}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div class="col-3 d-flex justify-content-center align-items-center">
            <div v-if="persona.circuloSolo" class="d-flex justify-content-center align-items-center container-number">
              {{ persona.circuloSolo }}
            </div>
          </div>
        </div>
        <div class="p-0 d-flex flex-row justify-content-between align-items-center w-100">
          <div class="d-flex flex-column justify-content-center align-items-center">
            <p>{{ Number(persona.totalGlobal) || 0 }}</p>
            <div class="d-flex flex-row justify-content-center align-items-center gap-1">
              <img src="../assets/Coin.svg" alt="">
              <p>Bruto</p>
            </div>
          </div>
          <div class="d-flex flex-column justify-content-center align-items-center">
            <p>{{ Number(persona.totalGlobal) || 0 }}</p>
            <div class="d-flex flex-row justify-content-center align-items-center gap-1">
              <img src="../assets/Star.svg" alt="">
              <p>Premio</p>
            </div>
          </div>
          <div class="d-flex flex-column justify-content-center align-items-center">
            <p>{{ Number(persona.totalGlobal) || 0 }}</p>
            <div class="d-flex flex-row justify-content-center align-items-center gap-1">
              <img src="../assets/Ganancia.svg" alt="">
              <p>Neto</p>
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
.container-cloud{
  gap: 6px;
}
.container-apuestas{
  gap: 16px;
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
  max-width: 343px;
  border: 1px solid #F3F3F3;
  border-radius: 12px;
  flex: none;
  flex-grow: 0;
}
header{
  padding: 0px;
  gap: 12px;
  flex: none;
  flex-grow: 1;
}
p {
  margin: 0px;
  padding: 0px;
  font-size: 0.9rem;
}
p.name{
  font-size: 1.1rem;
}
.offline-banner{
  font-size: 0.8rem;
}
.container-number {
  padding: 8px 16px;
  gap: 16px;
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
.hora-text {
  font-size: 0.6rem;
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