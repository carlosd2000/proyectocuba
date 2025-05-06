<script setup>
import { onMounted, onUnmounted } from 'vue'
import Swal from 'sweetalert2'
import { ref } from 'vue'

const mostrarModal = ref(false)
const mostrarConfirmacionEliminar = ref(false)
const personaSeleccionada = ref(null)

import {
  apuestas,
  obtenerApuestas,
  eliminarApuesta,
  editarApuesta
} from '../scripts/CRUDlistas.js'

let unsubscribe = null

const cuadroClick = (persona) => {
  if (!persona.candadoAbierto) return
  personaSeleccionada.value = persona
  mostrarModal.value = true
}

const cerrarModal = () => {
  mostrarModal.value = false
}

const editarPersona = async () => {
  console.log('Editar a:', personaSeleccionada.value.nombre)
  // await editarApuesta(personaSeleccionada.value.id, { nombre: 'Nuevo nombre' })
  cerrarModal()
}

const eliminarPersona = async () => {
  await eliminarApuesta(personaSeleccionada.value.id)
  mostrarConfirmacionEliminar.value = false
  mostrarModal.value = false
}

const confirmarEliminar = () => {
  mostrarConfirmacionEliminar.value = true
}

onMounted(() => {
  unsubscribe = obtenerApuestas()
})

onUnmounted(() => {
  if (unsubscribe) unsubscribe()
})

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


const extraerHora = (textoFecha) => {
  if (!textoFecha) return ''
  const fecha = textoFecha.toDate ? textoFecha.toDate() : textoFecha
  const opciones = {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  }
  return fecha.toLocaleTimeString('es-CO', opciones)
}

const obtenerIconoEstado = (persona) => {
  if (persona.estado === 'Cargado') return 'bi bi-cloud-check text-success'
  if (persona.estado === 'Pendiente') return 'bi bi-cloud-slash text-danger'
  if (persona.estado === 'EnTiempo') return 'bi bi-stopwatch text-success'
  if (persona.estado === 'FueraDeTiempo') return 'bi bi-stopwatch text-danger'
  return 'bi bi-exclamation-lg text-primary'
}
</script>

<template>
  <div class="col-12 m-0 p-0">
    <div
      v-for="persona in apuestas"
      :key="persona.id"
      class="m-0 mb-2 p-1 pt-3 pb-2 persona"
      @click="cuadroClick(persona)"
      style="cursor: pointer;"
    >
      <header class="col-12 row m-0 p-0">
        <div class="col-10 d-flex justify-content-start align-items-center">
          <p>{{ persona.nombre }}</p>
        </div>
        <div
          class="col-2 d-flex justify-content-end align-items-center"
          @click.stop
        >
          <i
            :class="['bi', persona.candadoAbierto ? 'bi-unlock text-success' : 'bi-lock text-danger']"
            class="fs-4"
            style="cursor: pointer;"
            @click="toggleCandado(persona)"
          ></i>
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
                <div v-if="'circulo1' in mapa" class="col-3 m-0 p-0 d-flex justify-content-center align-items-center">
                  <p class="m-0 p-0 d-flex justify-content-center align-items-center rounded-circle container-number">
                    {{ mapa['circulo1'] }}
                  </p>
                </div>
                <div v-if="'circulo2' in mapa" class="col-3 m-0 p-0">
                  <div class="col-12 m-0 p-0 d-flex justify-content-center align-items-center">
                    <p class="m-0 p-0 d-flex justify-content-center align-items-center rounded-circle container-number">
                      {{ mapa['circulo2'] }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-2 m-0 p-0 d-flex justify-content-center align-items-center">
          <div class="m-0 p-0 d-flex justify-content-center align-items-center rounded-circle container-number">
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
            <p class="hora-text">{{ extraerHora(persona.creadoEn) }}</p>
            <i :class="obtenerIconoEstado(persona)"></i>
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
  flex: 1 1 300px;
  min-width: 250px;
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




</style>